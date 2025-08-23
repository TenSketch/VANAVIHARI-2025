import Resort from '../models/resortModel.js'
import cloudinary from '../config/cloudinaryConfig.js'
import fs from 'fs'
import { promisify } from 'util'
const unlinkAsync = promisify(fs.unlink)

// create resort with optional logo upload (logoFile is cloudinary uploaded result)
const createResort = async (req, res) => {
  try {
    const body = req.body || {}

    // helper to normalize values from multipart/form-data where fields may be arrays
    const v = (key) => {
      const val = body[key]
      if (Array.isArray(val)) return val[0]
      return val
    }

    const resortData = {
      resortName: v('resortName'),
      contactPersonName: v('contactPersonName'),
      contactNumber: v('contactNumber'),
      email: v('email'),
      address: {
        line1: v('addressLine1'),
        line2: v('addressLine2'),
        cityDistrict: v('cityDistrict'),
        stateProvince: v('stateProvince'),
        postalCode: v('postalCode'),
        country: v('country'),
      },
      website: v('website'),
      foodProviding: v('foodProviding'),
      foodDetails: v('foodDetails'),
      roomIdPrefix: v('roomIdPrefix'),
      extraGuestCharges: v('extraGuestCharges') ? Number(v('extraGuestCharges')) : undefined,
      supportNumber: v('supportNumber'),
    }

    // if multer provided a file, upload to cloudinary
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'vanavihari/resorts' })
        resortData.logo = { url: result.secure_url, public_id: result.public_id }
      } finally {
        // attempt to remove temp file if it exists
        if (req.file && req.file.path) {
          try {
            await unlinkAsync(req.file.path)
          } catch (e) {
            // log but don't fail the request because of cleanup error
            console.warn('Failed to remove temp file:', req.file.path, e.message || e)
          }
        }
      }
    }

    const resort = new Resort(resortData)
    await resort.save()

    res.status(201).json({ resort })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

const listResorts = async (req, res) => {
  try {
    const resorts = await Resort.find().sort({ createdAt: -1 })
    res.json({ resorts })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export { createResort, listResorts }
