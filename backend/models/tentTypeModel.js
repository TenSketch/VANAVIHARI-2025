import mongoose from 'mongoose'

const tentTypeSchema = new mongoose.Schema({
  tentType: { type: String, required: true },
  dimensions: String,
  brand: String,
  features: String,
  pricePerDay: { type: Number, required: true },
  amenities: [String],
  resort: { type: mongoose.Schema.Types.ObjectId, ref: 'Resort' },
  isDisabled: { type: Boolean, default: false },
}, { timestamps: true })

const TentType = mongoose.models.TentType || mongoose.model('TentType', tentTypeSchema)
export default TentType
