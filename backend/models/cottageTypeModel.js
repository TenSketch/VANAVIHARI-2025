import mongoose from 'mongoose'

const cottageTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  maxGuests: { type: Number, default: 2 },
  bedrooms: { type: Number, default: 1 },
  bathrooms: { type: Number, default: 1 },
  basePrice: { type: Number, required: true },
  amenities: [String],
  images: [
    {
      url: String,
      public_id: String,
    },
  ],
  resort: { type: mongoose.Schema.Types.ObjectId, ref: 'Resort' },
  isDisabled: { type: Boolean, default: false },
}, { timestamps: true })

const CottageType = mongoose.models.CottageType || mongoose.model('CottageType', cottageTypeSchema)
export default CottageType
