import mongoose from 'mongoose'

const cottageTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  maxGuests: { type: Number, default: 2 },
  bedrooms: { type: Number, default: 1 },
  bathrooms: { type: Number, default: 1 },
  basePrice: { type: Number, required: true },
  // Tent related fields
  isTent: { type: Boolean, default: false },
  tentType: { type: String },
  // tentMeta stores resolved tent attributes like price, size, special rules
  tentMeta: {
    price: Number,
    size: String,
    notes: String,
    reservedFor: String, // e.g., 'males-only'
  },
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
