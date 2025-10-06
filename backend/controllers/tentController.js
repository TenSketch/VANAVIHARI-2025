import TentType from '../models/tentTypeModel.js'

const createTentType = async (req, res) => {
  try {
    const body = req.body || {}
    const v = (key) => {
      const val = body[key]
      if (Array.isArray(val)) return val[0]
      return val
    }

    const tentData = {
      tentType: v('tentType'),
      dimensions: v('dimensions'),
      brand: v('brand'),
      features: v('features'),
      pricePerDay: v('price') ? Number(v('price')) : (v('pricePerDay') ? Number(v('pricePerDay')) : undefined),
      amenities: body.amenities ? (Array.isArray(body.amenities) ? body.amenities : [body.amenities]) : [],
    }

    if (v('resort')) tentData.resort = v('resort')

    const tt = new TentType(tentData)
    await tt.save()
    res.status(201).json({ tentType: tt })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

const listTentTypes = async (req, res) => {
  try {
    const list = await TentType.find().sort({ createdAt: -1 }).populate('resort')
    res.json({ tentTypes: list })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getTentType = async (req, res) => {
  try {
    const tt = await TentType.findById(req.params.id).populate('resort')
    if (!tt) return res.status(404).json({ error: 'Not found' })
    res.json({ tentType: tt })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const updateTentType = async (req, res) => {
  try {
    const updates = req.body || {}
    const allowed = ['tentType','dimensions','brand','features','pricePerDay','resort','amenities','isDisabled']
    const toSet = {}
    for (const k of allowed) if (updates[k] !== undefined) toSet[k] = updates[k]
    // accept 'price' as alias to pricePerDay coming from forms
    if (updates.price !== undefined && toSet.pricePerDay === undefined) toSet.pricePerDay = Number(updates.price)

    const tt = await TentType.findByIdAndUpdate(req.params.id, { $set: toSet }, { new: true }).populate('resort')
    if (!tt) return res.status(404).json({ error: 'Not found' })
    res.json({ tentType: tt })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const toggleDisableTentType = async (req, res) => {
  try {
    const { isDisabled } = req.body
    if (typeof isDisabled !== 'boolean') return res.status(400).json({ error: 'isDisabled boolean required' })
    const tt = await TentType.findByIdAndUpdate(req.params.id, { $set: { isDisabled } }, { new: true })
    if (!tt) return res.status(404).json({ error: 'Not found' })
    res.json({ tentType: tt })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export { createTentType, listTentTypes, getTentType, updateTentType, toggleDisableTentType }
