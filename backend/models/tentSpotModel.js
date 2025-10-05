import mongoose from 'mongoose'

const tentSpotSchema = new mongoose.Schema({
  spotName: { type: String, required: true },
  location: String,
  contactPerson: String,
  contactNo: String,
  email: String,
  rules: String,
  accommodation: String,
  foodAvailable: String,
  kidsStay: String,
  womenStay: String,
  checkIn: String,
  checkOut: String,
  resort: { type: mongoose.Schema.Types.ObjectId, ref: 'Resort' },
  isDisabled: { type: Boolean, default: false },
}, { timestamps: true })

const TentSpot = mongoose.models.TentSpot || mongoose.model('TentSpot', tentSpotSchema)
export default TentSpot
