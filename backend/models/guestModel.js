import mongoose from 'mongoose'

const guestSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  email: String,
  profileImage: {
    url: String,
    public_id: String,
  },
  dateOfBirth: Date,
  nationality: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  registrationDate: Date,
  registerThrough: String,
  emailVerification: { type: String, enum: ['verified','unverified'], default: 'unverified' },
  disabled: { type: Boolean, default: false },
  rawSource: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true })

const Guest = mongoose.models.Guest || mongoose.model('Guest', guestSchema)
export default Guest
