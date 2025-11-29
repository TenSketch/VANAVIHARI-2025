import Reservation from '../models/reservationModel.js'
import Resort from '../models/resortModel.js'
import Room from '../models/roomModel.js'

// Get daily occupancy report for a specific resort
export const getDailyOccupancyReport = async (req, res) => {
  try {
    const { resortId } = req.params
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all rooms for this resort
    const rooms = await Room.find({ resort: resortId }).lean()
    
    // Get all active reservations for today (checkIn <= today < checkOut)
    const reservations = await Reservation.find({
      resort: resortId,
      status: 'reserved',
      checkIn: { $lte: tomorrow },
      checkOut: { $gt: today }
    }).lean()

    // Create a map of room occupancy
    const roomOccupancyMap = new Map()
    
    reservations.forEach(reservation => {
      if (reservation.rooms && Array.isArray(reservation.rooms)) {
        reservation.rooms.forEach(roomId => {
          // Calculate remaining days
          const checkOutDate = new Date(reservation.checkOut)
          const diffTime = checkOutDate.getTime() - today.getTime()
          const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          // Calculate number of days
          const checkInDate = new Date(reservation.checkIn)
          const totalDiffTime = checkOutDate.getTime() - checkInDate.getTime()
          const noOfDays = Math.ceil(totalDiffTime / (1000 * 60 * 60 * 24))
          
          roomOccupancyMap.set(roomId, {
            bookingId: reservation.bookingId,
            guestName: reservation.fullName,
            paidAmount: reservation.totalPayable,
            guests: reservation.guests || 0,
            extraGuests: reservation.extraGuests || 0,
            children: reservation.children || 0,
            totalGuests: (reservation.guests || 0) + (reservation.extraGuests || 0) + (reservation.children || 0),
            totalFoods: (reservation.guests || 0) + (reservation.extraGuests || 0) + (reservation.children || 0),
            noOfDays,
            remainingDays: Math.max(0, remainingDays)
          })
        })
      }
    })

    // Build report data
    const reportData = rooms.map(room => {
      const roomId = room._id.toString()
      const occupancy = roomOccupancyMap.get(roomId)
      
      if (occupancy) {
        return {
          roomName: room.roomName || room.roomId || room.roomNumber || 'Unknown',
          ...occupancy
        }
      } else {
        return {
          roomName: room.roomName || room.roomId || room.roomNumber || 'Unknown',
          status: 'Available'
        }
      }
    })

    res.json({ success: true, data: reportData })
  } catch (err) {
    console.error('getDailyOccupancyReport error', err)
    res.status(500).json({ success: false, error: err.message })
  }
}

// Get daily occupancy report by resort slug
export const getDailyOccupancyReportBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    
    // Find resort by slug
    const resort = await Resort.findOne({ slug }).lean()
    if (!resort) {
      return res.status(404).json({ success: false, error: 'Resort not found' })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all rooms for this resort
    const rooms = await Room.find({ resort: resort._id }).lean()
    
    // Get all active reservations for today
    const reservations = await Reservation.find({
      resort: resort._id.toString(),
      status: 'reserved',
      checkIn: { $lte: tomorrow },
      checkOut: { $gt: today }
    }).lean()

    // Create a map of room occupancy
    const roomOccupancyMap = new Map()
    
    reservations.forEach(reservation => {
      if (reservation.rooms && Array.isArray(reservation.rooms)) {
        reservation.rooms.forEach(roomId => {
          const checkOutDate = new Date(reservation.checkOut)
          const diffTime = checkOutDate.getTime() - today.getTime()
          const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          const checkInDate = new Date(reservation.checkIn)
          const totalDiffTime = checkOutDate.getTime() - checkInDate.getTime()
          const noOfDays = Math.ceil(totalDiffTime / (1000 * 60 * 60 * 24))
          
          roomOccupancyMap.set(roomId, {
            bookingId: reservation.bookingId,
            guestName: reservation.fullName,
            paidAmount: reservation.totalPayable,
            guests: reservation.guests || 0,
            extraGuests: reservation.extraGuests || 0,
            children: reservation.children || 0,
            totalGuests: (reservation.guests || 0) + (reservation.extraGuests || 0) + (reservation.children || 0),
            totalFoods: (reservation.guests || 0) + (reservation.extraGuests || 0) + (reservation.children || 0),
            noOfDays,
            remainingDays: Math.max(0, remainingDays)
          })
        })
      }
    })

    // Build report data
    const reportData = rooms.map(room => {
      const roomId = room._id.toString()
      const occupancy = roomOccupancyMap.get(roomId)
      
      if (occupancy) {
        return {
          roomName: room.roomName || room.roomId || room.roomNumber || 'Unknown',
          ...occupancy
        }
      } else {
        return {
          roomName: room.roomName || room.roomId || room.roomNumber || 'Unknown',
          status: 'Available'
        }
      }
    })

    res.json({ success: true, data: reportData, resortName: resort.resortName })
  } catch (err) {
    console.error('getDailyOccupancyReportBySlug error', err)
    res.status(500).json({ success: false, error: err.message })
  }
}
