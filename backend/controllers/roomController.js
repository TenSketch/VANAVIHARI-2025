import Room from '../models/roomModel.js'
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

    const roomData = {
      roomNumber: v('roomNumber'),
      roomId: v('roomId'),
      status: v('status') || undefined,
      price: v('price') ? Number(v('price')) : undefined,
      resort: v('resort') || undefined,
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

export { createRoom, listRooms }
