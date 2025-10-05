import TentSpot from '../models/tentSpotModel.js'

const createTentSpot = async (req, res) => {
  try {
    const body = req.body || {}
    const v = (key) => {
      const val = body[key]
      if (Array.isArray(val)) return val[0]
      return val
    }

    const spotData = {
      spotName: v('spotName'),
      location: v('location'),
      contactPerson: v('contactPerson'),
      contactNo: v('contactNo'),
      email: v('email'),
      rules: v('rules'),
      accommodation: v('accommodation'),
      foodAvailable: v('foodAvailable'),
      kidsStay: v('kidsStay'),
      womenStay: v('womenStay'),
      checkIn: v('checkIn'),
      checkOut: v('checkOut'),
    }

    if (v('resort')) spotData.resort = v('resort')

    const ts = new TentSpot(spotData)
    await ts.save()
    res.status(201).json({ tentSpot: ts })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

const listTentSpots = async (req, res) => {
  try {
    const list = await TentSpot.find().sort({ createdAt: -1 }).populate('resort')
    res.json({ tentSpots: list })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getTentSpot = async (req, res) => {
  try {
    const ts = await TentSpot.findById(req.params.id).populate('resort')
    if (!ts) return res.status(404).json({ error: 'Not found' })
    res.json({ tentSpot: ts })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const updateTentSpot = async (req, res) => {
  try {
    const updates = req.body || {}
    const allowed = ['spotName','location','contactPerson','contactNo','email','rules','accommodation','foodAvailable','kidsStay','womenStay','checkIn','checkOut','resort']
    const toSet = {}
    for (const k of allowed) if (updates[k] !== undefined) toSet[k] = updates[k]

    const ts = await TentSpot.findByIdAndUpdate(req.params.id, { $set: toSet }, { new: true }).populate('resort')
    if (!ts) return res.status(404).json({ error: 'Not found' })
    res.json({ tentSpot: ts })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const toggleDisableTentSpot = async (req, res) => {
  try {
    const { isDisabled } = req.body
    if (typeof isDisabled !== 'boolean') return res.status(400).json({ error: 'isDisabled boolean required' })
    const ts = await TentSpot.findByIdAndUpdate(req.params.id, { $set: { isDisabled } }, { new: true })
    if (!ts) return res.status(404).json({ error: 'Not found' })
    res.json({ tentSpot: ts })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export { createTentSpot, listTentSpots, getTentSpot, updateTentSpot, toggleDisableTentSpot }
