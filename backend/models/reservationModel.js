import mongoose from 'mongoose'

const reservationSchema = new mongoose.Schema({
  resort: String,
  cottageTypes: [String], // Array of cottage type IDs
  rooms: [String], // Array of room IDs
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  extraGuests: Number,
  children: Number,
  status: { type: String, default: 'reserved' },
  bookingId: String,
  reservationDate: Date,
  numberOfRooms: Number,
  totalPayable: Number,
  paymentStatus: String,
  refundPercentage: Number,
  existingGuest: String,
  fullName: String,
  phone: String,
  email: String,
  address1: String,
  address2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  roomPrice: Number,
  extraBedCharges: Number,
  rawSource: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true })

const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema)
export default Reservation
