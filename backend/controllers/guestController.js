import Guest from '../models/guestModel.js'
import cloudinary from '../config/cloudinaryConfig.js'
import fs from 'fs'
import { promisify } from 'util'
const unlinkAsync = promisify(fs.unlink)

export const createGuest = async (req, res) => {
  try {
    const body = { ...req.body }
    // normalize dates
    if (body.registrationDate) body.registrationDate = new Date(body.registrationDate)
    if (body.dateOfBirth) body.dateOfBirth = new Date(body.dateOfBirth)

    // handle image upload if multer provided a file
    if (req.file && req.file.path) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'vanavihari/guests' })
        body.profileImage = { url: result.secure_url, public_id: result.public_id }
      } finally {
        try { await unlinkAsync(req.file.path) } catch (e) { console.warn('cleanup failed', e.message || e) }
      }
    }

    const guest = new Guest(body)
    await guest.save()
    res.status(201).json({ success: true, guest })
  } catch (err) {
    console.error('createGuest error', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

export const listGuests = async (req, res) => {
  try {
    const guests = await Guest.find().sort({ createdAt: -1 }).lean()
    res.json({ success: true, guests })
  } catch (err) {
    console.error('listGuests error', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

export const updateGuest = async (req, res) => {
  try {
    const { id } = req.params
    const payload = { ...req.body }
    if (payload.registrationDate) payload.registrationDate = new Date(payload.registrationDate)
    if (payload.dateOfBirth) payload.dateOfBirth = new Date(payload.dateOfBirth)
    if (typeof payload.disabled !== 'undefined') payload.disabled = Boolean(payload.disabled)

    const updated = await Guest.findByIdAndUpdate(id, payload, { new: true }).lean()
    if (!updated) return res.status(404).json({ success: false, error: 'Guest not found' })
    res.json({ success: true, guest: updated })
  } catch (err) {
    console.error('updateGuest error', err)
    res.status(500).json({ success: false, error: err.message })
  }
}
