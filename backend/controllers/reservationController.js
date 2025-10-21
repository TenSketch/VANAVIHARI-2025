import Reservation from '../models/reservationModel.js'

export const createReservation = async (req, res) => {
  try {
    const payload = { ...req.body }
    // Convert numeric and date-like fields
    if (payload.checkIn) payload.checkIn = new Date(payload.checkIn)
    if (payload.checkOut) payload.checkOut = new Date(payload.checkOut)
    if (payload.reservationDate) payload.reservationDate = new Date(payload.reservationDate)
    if (payload.guests) payload.guests = Number(payload.guests)
    if (payload.extraGuests) payload.extraGuests = Number(payload.extraGuests)
    if (payload.children) payload.children = Number(payload.children)
    if (payload.numberOfRooms) payload.numberOfRooms = Number(payload.numberOfRooms)
    if (payload.refundPercentage) payload.refundPercentage = Number(payload.refundPercentage)
    if (payload.roomPrice) payload.roomPrice = Number(String(payload.roomPrice).replace(/[₹,\s]/g, ''))
    if (payload.totalPayable) payload.totalPayable = Number(String(payload.totalPayable).replace(/[₹,\s]/g, ''))

    const reservation = new Reservation(payload)
    await reservation.save()
    res.status(201).json({ success: true, reservation })
  } catch (err) {
    console.error('createReservation error', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 }).lean()
    res.json({ success: true, reservations })
  } catch (err) {
    console.error('getReservations error', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params
    const payload = { ...req.body }
    // normalize known fields
    if (payload.checkIn) payload.checkIn = new Date(payload.checkIn)
    if (payload.checkOut) payload.checkOut = new Date(payload.checkOut)
    if (payload.reservationDate) payload.reservationDate = new Date(payload.reservationDate)
    if (payload.guests) payload.guests = Number(payload.guests)
    if (payload.extraGuests) payload.extraGuests = Number(payload.extraGuests)
    if (payload.children) payload.children = Number(payload.children)
    if (payload.rooms) payload.numberOfRooms = Number(payload.rooms)
    if (payload.refundPercent) payload.refundPercentage = Number(payload.refundPercent)
    // allow toggling disabled flag
    if (typeof payload.disabled !== 'undefined') payload.disabled = Boolean(payload.disabled)

    const updated = await Reservation.findByIdAndUpdate(id, payload, { new: true }).lean()
    if (!updated) return res.status(404).json({ success: false, error: 'Reservation not found' })
    res.json({ success: true, reservation: updated })
  } catch (err) {
    console.error('updateReservation error', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

export const getNextSerial = async (req, res) => {
  try {
    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Count reservations created today
    const count = await Reservation.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    })

    // Next serial is count + 1
    const serial = count + 1

    res.json({ success: true, serial })
  } catch (err) {
    console.error('getNextSerial error', err)
    res.status(500).json({ success: false, error: err.message })
  }
}
