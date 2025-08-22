import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { format } from "date-fns";

interface GuestFormData {
  fullName: string;
  phone: string;
  email: string;
  profileImage: File | null;
  dateOfBirth: string;
  nationality: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  registrationDate: string;
  registerThrough: string;
  emailVerification: "verified" | "unverified";
}

const countries = ["India", "United States", "United Kingdom", "Australia", "Canada"];

const AddGuestForm = () => {
  const [formData, setFormData] = useState<GuestFormData>({
    fullName: "",
    phone: "",
    email: "",
    profileImage: null,
    dateOfBirth: "",
    nationality: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    registrationDate: format(new Date(), "yyyy-MM-dd"),
    registerThrough: "",
    emailVerification: "unverified",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, profileImage: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Guest data submitted:", formData);
    // TODO: Submit data to API
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      profileImage: null,
      dateOfBirth: "",
      nationality: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      registrationDate: format(new Date(), "yyyy-MM-dd"),
      registerThrough: "",
      emailVerification: "unverified",
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            Add New Guest
          </h1>
          <p className="text-slate-600">Please fill in all the required details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality" className="text-sm font-medium text-slate-700">Nationality</Label>
              <Input
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
          </div>

          {/* Profile and Date Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="profileImage" className="text-sm font-medium text-slate-700">Profile Image</Label>
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                  placeholder="Upload profile image"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium text-slate-700">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationDate" className="text-sm font-medium text-slate-700">Registration Date</Label>
              <Input
                id="registrationDate"
                name="registrationDate"
                type="date"
                value={formData.registrationDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registerThrough" className="text-sm font-medium text-slate-700">Register Through</Label>
              <Input
                id="registerThrough"
                name="registerThrough"
                value={formData.registerThrough}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
          </div>

          {/* Address Information */}
          <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="addressLine1" className="text-sm font-medium text-slate-700">Address Line 1</Label>
              <Input
                id="addressLine1"
                name="addressLine1"
                placeholder="Address Line 1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2" className="text-sm font-medium text-slate-700">Address Line 2</Label>
              <Input
                id="addressLine2"
                name="addressLine2"
                placeholder="Address Line 2"
                value={formData.addressLine2}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-slate-700">City / District</Label>
              <Input
                id="city"
                name="city"
                placeholder="City / District"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium text-slate-700">State / Province</Label>
              <Input
                id="state"
                name="state"
                placeholder="State / Province"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm font-medium text-slate-700">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-slate-700">Country</Label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Registration & Verification Information */}
          <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Registration & Verification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="emailVerification" className="text-sm font-medium text-slate-700">Email Verification Status</Label>
              <select
                id="emailVerification"
                name="emailVerification"
                value={formData.emailVerification}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              >
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Email Verification</Label>
              <Button
                type="button"
                onClick={() => {
                  // Handle email verification send logic here
                  console.log("Sending verification email...");
                }}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Send Verification Link
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <Button 
              type="submit" 
              className="px-8 py-3 bg-slate-800 text-white hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              Add Guest
            </Button>
            <Button
              type="button"
              onClick={handleReset}
              variant="outline"
              className="px-8 py-3 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors"
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGuestForm;
