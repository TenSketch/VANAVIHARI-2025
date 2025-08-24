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
