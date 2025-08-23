import CottageType from '../models/cottageTypeModel.js'
import cloudinary from '../config/cloudinaryConfig.js'
import fs from 'fs'
import { promisify } from 'util'
const unlinkAsync = promisify(fs.unlink)

const createCottageType = async (req, res) => {
  try {
    const body = req.body || {}
    const v = (key) => {
      const val = body[key]
      if (Array.isArray(val)) return val[0]
      return val
    }

    const cottageData = {
      name: v('name'),
      description: v('description'),
      maxGuests: v('maxGuests') ? Number(v('maxGuests')) : undefined,
      bedrooms: v('bedrooms') ? Number(v('bedrooms')) : undefined,
      bathrooms: v('bathrooms') ? Number(v('bathrooms')) : undefined,
      basePrice: v('basePrice') ? Number(v('basePrice')) : undefined,
      amenities: body.amenities ? (Array.isArray(body.amenities) ? body.amenities : [body.amenities]) : [],
    }

    // handle multiple files (images)
    const images = []
    if (req.files && req.files.length) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, { folder: 'vanavihari/cottageTypes' })
          images.push({ url: result.secure_url, public_id: result.public_id })
        } finally {
          if (file && file.path) {
            try { await unlinkAsync(file.path) } catch (e) { console.warn('cleanup failed', e.message || e) }
          }
        }
      }
    }

    if (images.length) cottageData.images = images

    if (v('resort')) cottageData.resort = v('resort')

    const ct = new CottageType(cottageData)
    await ct.save()
    res.status(201).json({ cottageType: ct })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

const listCottageTypes = async (req, res) => {
  try {
    const list = await CottageType.find().sort({ createdAt: -1 }).populate('resort')
    res.json({ cottageTypes: list })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export { createCottageType, listCottageTypes }
