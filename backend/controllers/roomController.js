import Room from '../models/roomModel.js'
import Resort from '../models/resortModel.js'
import mongoose from 'mongoose'
import cloudinary from '../config/cloudinaryConfig.js'
import fs from 'fs'
import { promisify } from 'util'
const unlinkAsync = promisify(fs.unlink)

const createRoom = async (req, res) => {
  try {
    const body = req.body || {}
    const v = (key) => {
      const val = body[key]
      if (Array.isArray(val)) return val[0]
      return val
    }

    // Generate roomId if not provided
    let roomId = v('roomId')
    let roomNumber = v('roomNumber')
    const resortId = v('resort')

    if (!roomId && resortId) {
      // Fetch resort to get prefix
      const resort = await Resort.findById(resortId)
      if (resort && resort.roomIdPrefix) {
        const prefix = resort.roomIdPrefix
        // Find the last room with this prefix
        const lastRoom = await Room.findOne({ 
          roomId: new RegExp(`^${prefix}\\d+$`) 
        }).sort({ createdAt: -1 })
        
        let nextNumber = 1
        if (lastRoom && lastRoom.roomId) {
          const match = lastRoom.roomId.match(/\d+$/)
          if (match) {
            nextNumber = parseInt(match[0]) + 1
          }
        }
        roomId = `${prefix}${nextNumber}`
      }
    }

    // Use roomId as roomNumber if roomNumber not provided
    if (!roomNumber && roomId) {
      roomNumber = roomId
    }

    const roomData = {
      roomNumber: roomNumber,
      roomId: roomId,
      roomName: v('roomName'),
      status: v('status') || undefined,
      price: v('price') ? Number(v('price')) : undefined,
      weekdayRate: v('weekdayRate') ? Number(v('weekdayRate')) : undefined,
      weekendRate: v('weekendRate') ? Number(v('weekendRate')) : undefined,
      guests: v('guests') ? Number(v('guests')) : (v('noOfGuests') ? Number(v('noOfGuests')) : undefined),
      extraGuests: v('extraGuests') ? Number(v('extraGuests')) : undefined,
      children: v('children') ? Number(v('children')) : (v('noOfChildren') ? Number(v('noOfChildren')) : undefined),
      bedChargeWeekday: v('bedChargeWeekday') ? Number(v('bedChargeWeekday')) : (v('chargesPerBedWeekDays') ? Number(v('chargesPerBedWeekDays')) : undefined),
      bedChargeWeekend: v('bedChargeWeekend') ? Number(v('bedChargeWeekend')) : (v('chargesPerBedWeekEnd') ? Number(v('chargesPerBedWeekEnd')) : undefined),
      resort: resortId || undefined,
      cottageType: v('cottageType') || undefined,
      amenities: body.amenities ? (Array.isArray(body.amenities) ? body.amenities : [body.amenities]) : [],
      notes: v('notes'),
    }

    const images = []
    if (req.files && req.files.length) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, { folder: 'vanavihari/rooms' })
          images.push({ url: result.secure_url, public_id: result.public_id })
        } finally {
          if (file && file.path) {
            try { await unlinkAsync(file.path) } catch (e) { console.warn('cleanup failed', e.message || e) }
          }
        }
      }
    }

    if (images.length) roomData.images = images

    const room = new Room(roomData)
    await room.save()
    res.status(201).json({ room })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

const listRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 }).populate('resort').populate('cottageType')
    res.json({ rooms })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update a room (basic fields + optional new images)
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params
    const body = req.body || {}
    let existing = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      existing = await Room.findById(id)
    }
    // fallback: allow updating by roomId or roomNumber for legacy/static data IDs
    if (!existing) {
      existing = await Room.findOne({ $or: [ { roomId: id }, { roomNumber: id } ] })
    }
    if (!existing) return res.status(404).json({ error: 'Room not found' })

    // Map updatable scalar fields
    const scalarUpdates = ['roomNumber','roomId','roomName','status','price','weekdayRate','weekendRate','guests','extraGuests','children','bedChargeWeekday','bedChargeWeekend','resort','cottageType','notes']
    for (const f of scalarUpdates) {
      if (body[f] !== undefined && body[f] !== null && body[f] !== '') {
        // number coercion for numeric fields
        if (['price','weekdayRate','weekendRate','guests','extraGuests','children','bedChargeWeekday','bedChargeWeekend'].includes(f)) {
          existing[f] = Number(body[f])
        } else {
          existing[f] = body[f]
        }
      }
    }

    // amenities array
    if (body.amenities) {
      existing.amenities = Array.isArray(body.amenities) ? body.amenities : [body.amenities]
    }

    // Handle new images if provided
    if (req.files && req.files.length) {
      const images = []
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, { folder: 'vanavihari/rooms' })
          images.push({ url: result.secure_url, public_id: result.public_id })
        } finally {
          if (file && file.path) {
            try { await unlinkAsync(file.path) } catch (e) { console.warn('cleanup failed', e.message || e) }
          }
        }
      }
      if (images.length) {
        existing.images = [...(existing.images || []), ...images]
      }
    }

    await existing.save()
    res.json({ room: existing })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

// Get next available room ID for a resort
const getNextRoomId = async (req, res) => {
  try {
    const { resortId } = req.params
    
    if (!resortId) {
      return res.status(400).json({ error: 'Resort ID is required' })
    }

    // Fetch resort to get prefix
    const resort = await Resort.findById(resortId)
    if (!resort) {
      return res.status(404).json({ error: 'Resort not found' })
    }

    if (!resort.roomIdPrefix) {
      return res.json({ nextRoomId: '' })
    }

    const prefix = resort.roomIdPrefix
    // Find the last room with this prefix
    const lastRoom = await Room.findOne({ 
      roomId: new RegExp(`^${prefix}\\d+$`),
      resort: resortId
    }).sort({ createdAt: -1 })
    
    let nextNumber = 1
    if (lastRoom && lastRoom.roomId) {
      const match = lastRoom.roomId.match(/\d+$/)
      if (match) {
        nextNumber = parseInt(match[0]) + 1
      }
    }
    
    const nextRoomId = `${prefix}${nextNumber}`
    res.json({ nextRoomId, prefix })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

export { createRoom, listRooms, updateRoom, getNextRoomId }
