import Log from '../models/logModel.js'

export const createLog = async (req, res) => {
  try {
    const payload = { ...req.body }
    if (payload.logEntryDate) payload.logEntryDate = new Date(payload.logEntryDate)
    payload.raw = payload.raw || null

    const log = new Log(payload)
    await log.save()
    res.status(201).json({ success: true, log })
  } catch (err) {
    console.error('createLog error', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

export const getLogs = async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).lean()
    res.json({ success: true, logs })
  } catch (err) {
    console.error('getLogs error', err)
    res.status(500).json({ success: false, error: err.message })
  }
}
