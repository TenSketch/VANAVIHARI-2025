import mongoose from "mongoose";

const tentSpotSchema = new mongoose.Schema(
  {
    spotName: { type: String, required: true },
    location: { type: String, required: true },
    contactPerson: { type: String, required: true },
    contactNo: { type: String, required: true },
    email: { type: String, required: true },
    rules: { type: String, default: "" },
    accommodation: { type: String, required: true },
    foodAvailable: { 
      type: String, 
      enum: ['Yes', 'No', 'On Request'],
      required: true 
    },
    kidsStay: { 
      type: String, 
      enum: ['Allowed', 'Not Allowed', 'With Supervision'],
      required: true 
    },
    womenStay: { 
      type: String, 
      enum: ['Allowed', 'Not Allowed'],
      required: true 
    },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    isDisabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TentSpot = mongoose.models.TentSpot || mongoose.model("TentSpot", tentSpotSchema);
export default TentSpot;
