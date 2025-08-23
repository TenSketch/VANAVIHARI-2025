import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  roomId: String,
  status: { type: String, enum: ['available', 'booked', 'maintenance'], default: 'available' },
  price: { type: Number },
  resort: { type: mongoose.Schema.Types.ObjectId, ref: 'Resort' },
  cottageType: { type: mongoose.Schema.Types.ObjectId, ref: 'CottageType' },
  amenities: [String],
  notes: String,
  images: [
    {
      url: String,
      public_id: String,
    },
  ],
}, { timestamps: true })

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema)
export default Room
