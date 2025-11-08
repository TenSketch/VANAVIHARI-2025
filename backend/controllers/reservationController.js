import Reservation from '../models/reservationModel.js'
import Resort from '../models/resortModel.js'
import CottageType from '../models/cottageTypeModel.js'
import Room from '../models/roomModel.js'
import mongoose from 'mongoose'

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
    if (payload.extraBedCharges) payload.extraBedCharges = Number(String(payload.extraBedCharges).replace(/[₹,\s]/g, ''))
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

// Get bookings for authenticated user
export const getUserBookings = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const userId = req.user._id.toString()
    
    // Find all reservations for this user
    const reservations = await Reservation.find({ 
      existingGuest: userId 
    })
    .sort({ createdAt: -1 })
    .lean()
    
    // Manually populate related data since fields are stored as strings
    const populatedReservations = await Promise.all(
      reservations.map(async (reservation) => {
        // Fetch resort details
        let resortData = null
        if (reservation.resort && mongoose.Types.ObjectId.isValid(reservation.resort)) {
          resortData = await Resort.findById(reservation.resort).select('resortName slug').lean()
        }
        
        // Fetch cottage type details
        let cottageTypesData = []
        if (reservation.cottageTypes && Array.isArray(reservation.cottageTypes)) {
          const validCottageIds = reservation.cottageTypes.filter(id => mongoose.Types.ObjectId.isValid(id))
          if (validCottageIds.length > 0) {
            cottageTypesData = await CottageType.find({ 
              _id: { $in: validCottageIds } 
            }).select('name').lean()
          }
        }
        
        // Fetch room details
        let roomsData = []
        if (reservation.rooms && Array.isArray(reservation.rooms)) {
          const validRoomIds = reservation.rooms.filter(id => mongoose.Types.ObjectId.isValid(id))
          if (validRoomIds.length > 0) {
            roomsData = await Room.find({ 
              _id: { $in: validRoomIds } 
            }).select('roomNumber roomId roomName').lean()
          }
        }
        
        return {
          ...reservation,
          resort: resortData,
          cottageTypes: cottageTypesData,
          rooms: roomsData
        }
      })
    )
    
    res.json({ 
      success: true, 
      bookings: populatedReservations,
      count: populatedReservations.length 
    })
  } catch (err) {
    console.error('getUserBookings error', err)
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

// User booking endpoint (requires user authentication)
export const createPublicBooking = async (req, res) => {
  try {
    const payload = { ...req.body }
    
    // Add authenticated user info
    if (req.user) {
      payload.existingGuest = req.user._id.toString()
      // Store user reference in rawSource for tracking
      if (!payload.rawSource) payload.rawSource = {}
      payload.rawSource.userId = req.user._id.toString()
      payload.rawSource.userEmail = req.user.email
    }
    
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
    if (payload.extraBedCharges) payload.extraBedCharges = Number(String(payload.extraBedCharges).replace(/[₹,\s]/g, ''))
    if (payload.totalPayable) payload.totalPayable = Number(String(payload.totalPayable).replace(/[₹,\s]/g, ''))

    // Auto-generate booking ID if not provided
    if (!payload.bookingId) {
      // Get resort initials
      let resortInitials = 'BK';
      if (payload.resort) {
        // If resort name is provided in rawSource, use it
        const resortName = payload.rawSource?.resortName || '';
        if (resortName) {
          resortInitials = resortName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');
        }
      }

      // Get current date/time
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const year = String(now.getFullYear()).slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');

      // Get today's serial
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const count = await Reservation.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      });
      const serial = String(count + 1).padStart(3, '0');

      // Generate booking ID: BB2109072510008
      payload.bookingId = `${resortInitials}${day}${hour}${minute}${year}${month}${serial}`;
    }

    const reservation = new Reservation(payload)
    await reservation.save()
    res.status(201).json({ success: true, reservation })
  } catch (err) {
    console.error('createPublicBooking error', err)
    res.status(500).json({ success: false, error: err.message })
  }
}
