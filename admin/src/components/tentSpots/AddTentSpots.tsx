import { useState} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Interfaces
interface TentSpotFormData {
  spotName: string;
  location: string;
  contactPerson: string;
  contactNo: string;
  email: string;
  rules: string;
  accommodation: string;
  foodAvailable: string;
  kidsStay: string;
  womenStay: string;
  checkIn: string;
  checkOut: string;
}

const AddSpots = () => {
  const [formData, setFormData] = useState<TentSpotFormData>({
    spotName: "",
    location: "",
    contactPerson: "",
    contactNo: "",
    email: "",
    rules: "",
    accommodation: "",
    foodAvailable: "",
    kidsStay: "",
    womenStay: "",
    checkIn: "",
    checkOut: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) return;

    // Basic validation (keep same required fields as the UI)
    if (!formData.spotName || !formData.location || !formData.contactPerson || !formData.contactNo || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const submitData = {
      id: `spot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...formData,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('tentSpotsDemo') || '[]');
      existing.push(submitData);
      localStorage.setItem('tentSpotsDemo', JSON.stringify(existing));
      console.log('Saved tent spot (frontend-only):', submitData);
      alert('Tent spot saved locally (frontend-only).');
      handleReset();
    } catch (err) {
      console.error('Failed to save locally', err);
      alert('Failed to save locally: ' + String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      spotName: "",
      location: "",
      contactPerson: "",
      contactNo: "",
      email: "",
      rules: "",
      accommodation: "",
      foodAvailable: "",
      kidsStay: "",
      womenStay: "",
      checkIn: "",
      checkOut: "",
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">Add New Tent Spot</h1>
          <p className="text-slate-600">Fill in the details to add a tent spot</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="spotName" className="text-sm font-medium text-slate-700">Spot Name <span className="text-red-500">*</span></Label>
              <Input
                id="spotName"
                name="spotName"
                value={formData.spotName}
                onChange={handleChange}
                required
                placeholder="e.g., Mountain View Tent Area"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-slate-700">Location <span className="text-red-500">*</span></Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Himachal Pradesh"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
          </div>

          {/* Contact Information */}
          <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contactPerson" className="text-sm font-medium text-slate-700">Contact Person <span className="text-red-500">*</span></Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required
                placeholder="e.g., John Doe"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNo" className="text-sm font-medium text-slate-700">Contact Number <span className="text-red-500">*</span></Label>
              <Input
                id="contactNo"
                name="contactNo"
                type="tel"
                value={formData.contactNo}
                onChange={handleChange}
                required
                placeholder="e.g., +91 9876543210"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="e.g., contact@tentspot.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
          </div>

          {/* Facilities Information */}
          <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Facilities & Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="accommodation" className="text-sm font-medium text-slate-700">Accommodation <span className="text-red-500">*</span></Label>
              <Input
                id="accommodation"
                name="accommodation"
                value={formData.accommodation}
                onChange={handleChange}
                required
                placeholder="e.g., Tents, Sleeping Bags"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foodAvailable" className="text-sm font-medium text-slate-700">Food Available <span className="text-red-500">*</span></Label>
              <select
                id="foodAvailable"
                name="foodAvailable"
                value={formData.foodAvailable}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              >
                <option value="">-- Select Option --</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="On Request">On Request</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kidsStay" className="text-sm font-medium text-slate-700">Kids Stay <span className="text-red-500">*</span></Label>
              <select
                id="kidsStay"
                name="kidsStay"
                value={formData.kidsStay}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              >
                <option value="">-- Select Option --</option>
                <option value="Allowed">Allowed</option>
                <option value="Not Allowed">Not Allowed</option>
                <option value="With Supervision">With Supervision</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="womenStay" className="text-sm font-medium text-slate-700">Women Stay <span className="text-red-500">*</span></Label>
              <select
                id="womenStay"
                name="womenStay"
                value={formData.womenStay}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              >
                <option value="">-- Select Option --</option>
                <option value="Allowed">Allowed</option>
                <option value="Not Allowed">Not Allowed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="rules" className="text-sm font-medium text-slate-700">Rules & Regulations</Label>
              <textarea
                id="rules"
                name="rules"
                value={formData.rules}
                onChange={handleChange}
                rows={4}
                placeholder="Enter rules and regulations for the tent spot..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50 resize-vertical"
              />
            </div>
          </div>

          {/* Check-in/Check-out Information */}
          <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Check-in & Check-out</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="checkIn" className="text-sm font-medium text-slate-700">Check-in Time <span className="text-red-500">*</span></Label>
              <Input
                id="checkIn"
                name="checkIn"
                type="time"
                value={formData.checkIn}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut" className="text-sm font-medium text-slate-700">Check-out Time <span className="text-red-500">*</span></Label>
              <Input
                id="checkOut"
                name="checkOut"
                type="time"
                value={formData.checkOut}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-3 bg-slate-800 text-white hover:bg-slate-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
              disabled={isSubmitting}
              className="px-8 py-3 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSpots;