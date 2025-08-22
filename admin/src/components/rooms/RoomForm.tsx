import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

// Interfaces
interface RoomFormData {
  resortId: string;
  cottageTypeId: string;
  roomId: string;
  roomName: string;
  roomImage: File | null;
  orderNumber: string;
  weekDaysRate: string;
  weekEndRate: string;
  noOfGuests: string;
  extraGuests: string;
  chargesPerBedWeekDays: string;
  chargesPerBedWeekEnd: string;
}

// dummy dropdown data
const resorts = [
  { id: "resort1", name: "Jungle Star" },
  { id: "resort2", name: "Vanavihari" },
];
//dummy cottage types
const cottageTypes = [
  { id: "cottage1", name: "Deluxe Cottage" },
  { id: "cottage2", name: "Premium Villa" },
];

const AddRoomForm = () => {
  const [formData, setFormData] = useState<RoomFormData>({
    resortId: "",
    cottageTypeId: "",
    roomId: "",
    roomName: "",
    roomImage: null,
    orderNumber: "",
    weekDaysRate: "",
    weekEndRate: "",
    noOfGuests: "",
    extraGuests: "",
    chargesPerBedWeekDays: "",
    chargesPerBedWeekEnd: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, roomImage: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Room Form Data:", formData);
    // Handle file upload and submit logic here
  };

  const handleReset = () => {
    setFormData({
      resortId: "",
      cottageTypeId: "",
      roomId: "",
      roomName: "",
      roomImage: null,
      orderNumber: "",
      weekDaysRate: "",
      weekEndRate: "",
      noOfGuests: "",
      extraGuests: "",
      chargesPerBedWeekDays: "",
      chargesPerBedWeekEnd: "",
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">Add New Room</h1>
          <p className="text-slate-600">Fill in the details to add a room</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="resortId" className="text-sm font-medium text-slate-700">Select Resort *</Label>
              <select
                id="resortId"
                name="resortId"
                value={formData.resortId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              >
                <option value="">-- Select Resort --</option>
                {resorts.map((resort) => (
                  <option key={resort.id} value={resort.id}>
                    {resort.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cottageTypeId" className="text-sm font-medium text-slate-700">Select Cottage Type *</Label>
              <select
                id="cottageTypeId"
                name="cottageTypeId"
                value={formData.cottageTypeId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              >
                <option value="">-- Select Cottage Type --</option>
                {cottageTypes.map((cottage) => (
                  <option key={cottage.id} value={cottage.id}>
                    {cottage.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomId" className="text-sm font-medium text-slate-700">Room ID *</Label>
              <Input
                id="roomId"
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                required
                placeholder="e.g., R101"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomName" className="text-sm font-medium text-slate-700">Room Name *</Label>
              <Input
                id="roomName"
                name="roomName"
                value={formData.roomName}
                onChange={handleChange}
                required
                placeholder="e.g., Sea View Room"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="roomImage" className="text-sm font-medium text-slate-700">Room Image</Label>
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  id="roomImage"
                  name="roomImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                  placeholder="Upload room image"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderNumber" className="text-sm font-medium text-slate-700">Order Number *</Label>
              <Input
                id="orderNumber"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
          </div>

          {/* Pricing Information */}
          <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Pricing Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weekDaysRate" className="text-sm font-medium text-slate-700">Weekdays Rate *</Label>
              <Input
                id="weekDaysRate"
                name="weekDaysRate"
                type="number"
                value={formData.weekDaysRate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekEndRate" className="text-sm font-medium text-slate-700">Weekend Rate *</Label>
              <Input
                id="weekEndRate"
                name="weekEndRate"
                type="number"
                value={formData.weekEndRate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chargesPerBedWeekDays" className="text-sm font-medium text-slate-700">Charges per Bed (Weekdays) *</Label>
              <Input
                id="chargesPerBedWeekDays"
                name="chargesPerBedWeekDays"
                type="number"
                value={formData.chargesPerBedWeekDays}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chargesPerBedWeekEnd" className="text-sm font-medium text-slate-700">Charges per Bed (Weekend) *</Label>
              <Input
                id="chargesPerBedWeekEnd"
                name="chargesPerBedWeekEnd"
                type="number"
                value={formData.chargesPerBedWeekEnd}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
          </div>

          {/* Guest Information */}
          <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Guest Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="noOfGuests" className="text-sm font-medium text-slate-700">No. of Guests *</Label>
              <Input
                id="noOfGuests"
                name="noOfGuests"
                type="number"
                value={formData.noOfGuests}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extraGuests" className="text-sm font-medium text-slate-700">Extra Guests *</Label>
              <Input
                id="extraGuests"
                name="extraGuests"
                type="number"
                value={formData.extraGuests}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <Button 
              type="submit" 
              className="px-8 py-3 bg-slate-800 text-white hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              Submit
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset}
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

export default AddRoomForm;
