import Amenity from '../models/amenityModel.js'

const createAmenity = async (req, res) => {
  try {
    const { name, description, isActive } = req.body || {}
    if (!name || !String(name).trim()) return res.status(400).json({ error: 'Amenity name is required' })

    const amenity = new Amenity({
      name: String(name).trim(),
      description: description ? String(description).trim() : undefined,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    })

    await amenity.save()
    return res.status(201).json({ amenity })
  } catch (error) {
    console.error('createAmenity error', error)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}

const listAmenities = async (req, res) => {
  try {
    const amenities = await Amenity.find().sort({ createdAt: -1 })
    res.json({ amenities })
  } catch (error) {
    console.error('listAmenities error', error)
    res.status(500).json({ error: error.message || 'Server error' })
  }
}

export { createAmenity, listAmenities }
