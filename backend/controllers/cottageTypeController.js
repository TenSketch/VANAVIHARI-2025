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

const getCottageType = async (req, res) => {
  try {
    const ct = await CottageType.findById(req.params.id).populate('resort')
    if (!ct) return res.status(404).json({ error: 'Not found' })
    res.json({ cottageType: ct })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const updateCottageType = async (req, res) => {
  try {
    const updates = req.body || {}
    // restrict fields
    const allowed = ['name','description','maxGuests','bedrooms','bathrooms','basePrice','amenities','resort']
    const toSet = {}
    for (const k of allowed) if (updates[k] !== undefined) toSet[k] = updates[k]
    const ct = await CottageType.findByIdAndUpdate(req.params.id, { $set: toSet }, { new: true }).populate('resort')
    if (!ct) return res.status(404).json({ error: 'Not found' })
    res.json({ cottageType: ct })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const toggleDisableCottageType = async (req, res) => {
  try {
    const { isDisabled } = req.body
    if (typeof isDisabled !== 'boolean') return res.status(400).json({ error: 'isDisabled boolean required' })
    const ct = await CottageType.findByIdAndUpdate(req.params.id, { $set: { isDisabled } }, { new: true })
    if (!ct) return res.status(404).json({ error: 'Not found' })
    res.json({ cottageType: ct })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export { createCottageType, listCottageTypes, getCottageType, updateCottageType, toggleDisableCottageType }
