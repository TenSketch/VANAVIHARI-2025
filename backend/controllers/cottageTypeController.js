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

    // Tent related: normalize isTent/tentType coming from multipart/form-data
    try {
      const isTentRaw = v('isTent')
      const isTent = isTentRaw === 'true' || isTentRaw === true
      if (isTent) {
        cottageData.isTent = true
        const tt = v('tentType')
        if (tt) cottageData.tentType = tt
      }
    } catch (e) {
      // ignore normalization errors
    }

    const ct = new CottageType(cottageData)

    // Resolve Vanavihari tent metadata if applicable (map tentType -> price/size/notes)
    try {
      if (ct.isTent && ct.tentType && ct.resort) {
        const Resort = (await import('../models/resortModel.js')).default
        const resortObj = await Resort.findById(ct.resort)
        const resortName = (resortObj && resortObj.resortName || '').toString().toLowerCase()
        if (resortName.includes('vanavihari')) {
          const tentMap = {
            '2-person': { price: 1500, size: '205 cm × 145 cm, height 110 cm', notes: 'For Males Only – strictly no kids', reservedFor: 'males-only' },
            '4-person': { price: 3000, size: '210 cm × 240 cm, height 190 cm', notes: 'For Males Only – strictly no kids', reservedFor: 'males-only' },
          }
          const meta = tentMap[ct.tentType]
          if (meta) {
            ct.tentMeta = meta
            // apply reasonable defaults if not provided
            if (!ct.basePrice && meta.price) ct.basePrice = meta.price
            if ((!ct.maxGuests || ct.maxGuests === undefined) && ct.tentType) {
              ct.maxGuests = ct.tentType === '4-person' ? 4 : 2
            }
          }
        }
      }
    } catch (e) {
      console.warn('Tent meta resolution failed', e && e.message)
    }

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
    const allowed = ['name','description','maxGuests','bedrooms','bathrooms','basePrice','amenities','resort','isTent','tentType']
    const toSet = {}
    for (const k of allowed) if (updates[k] !== undefined) toSet[k] = updates[k]
    const ct = await CottageType.findByIdAndUpdate(req.params.id, { $set: toSet }, { new: true }).populate('resort')
    if (!ct) return res.status(404).json({ error: 'Not found' })
    // If tent fields were updated and this resort is Vanavihari, attempt to resolve tentMeta
    try {
      if ((toSet.isTent || toSet.tentType) && ct.isTent && ct.tentType && ct.resort) {
        const Resort = (await import('../models/resortModel.js')).default
        const resortObj = await Resort.findById(ct.resort)
        const resortName = (resortObj && resortObj.resortName || '').toString().toLowerCase()
        if (resortName.includes('vanavihari')) {
          const tentMap = {
            '2-person': { price: 1500, size: '205 cm × 145 cm, height 110 cm', notes: 'For Males Only – strictly no kids', reservedFor: 'males-only' },
            '4-person': { price: 3000, size: '210 cm × 240 cm, height 190 cm', notes: 'For Males Only – strictly no kids', reservedFor: 'males-only' },
          }
          const meta = tentMap[ct.tentType]
          if (meta) {
            ct.tentMeta = meta
            if (!ct.basePrice && meta.price) ct.basePrice = meta.price
            if ((!ct.maxGuests || ct.maxGuests === undefined) && ct.tentType) {
              ct.maxGuests = ct.tentType === '4-person' ? 4 : 2
            }
            await ct.save()
          }
        }
      }
    } catch (e) {
      console.warn('Tent meta resolution failed during update', e && e.message)
    }
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
