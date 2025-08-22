import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

export default function AddReservationForm() {
  const [formData, setFormData] = useState({
    resort: "",
    cottageType: "",
    room: "",
    checkIn: "",
    checkOut: "",
    guests: "",
    extraGuests: "",
    children: "",
    status: "reserved",
    bookingId: "",
    reservationDate: format(new Date(), "yyyy-MM-dd"),
    numberOfRooms: "",
    totalPayable: "₹0",
    paymentStatus: "Paid",
    refundPercentage: "",
    existingGuest: "",
    fullName: "",
    phone: "",
    altPhone: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    roomPrice: "₹0",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelect = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleReset = () => {
    window.location.reload();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="min-h-screen p-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            Add Reservation
          </h1>
          <p className="text-slate-600">Please fill in all the required details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

      {/* Room Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800">Room Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Select Resort</Label>
            <Select onValueChange={(value) => handleSelect("resort", value)}>
              <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"><SelectValue placeholder="Choose Resort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Resort1">Resort 1</SelectItem>
                <SelectItem value="Resort2">Resort 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Cottage Type</Label>
            <Select onValueChange={(value) => handleSelect("cottageType", value)}>
              <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"><SelectValue placeholder="Choose Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Deluxe">Deluxe</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Choose Room</Label>
            <Select onValueChange={(value) => handleSelect("room", value)}>
              <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"><SelectValue placeholder="Choose Room" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Room101">Room 101</SelectItem>
                <SelectItem value="Room102">Room 102</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800">Booking Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Check In</Label><Input type="date" name="checkIn" value={formData.checkIn} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Check Out</Label><Input type="date" name="checkOut" value={formData.checkOut} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Guests</Label><Input type="number" name="guests" value={formData.guests} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Extra Guests</Label><Input type="number" name="extraGuests" value={formData.extraGuests} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Children (under 5)</Label><Input type="number" name="children" value={formData.children} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Status</Label>
            <Select onValueChange={(value) => handleSelect("status", value)}>
              <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"><SelectValue placeholder="Choose Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="unreserved">Unreserved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Booking ID</Label><Input name="bookingId" value={formData.bookingId} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Reservation Date</Label><Input type="date" name="reservationDate" value={formData.reservationDate} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">No. of Rooms</Label><Input type="number" name="numberOfRooms" value={formData.numberOfRooms} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Refund %</Label><Input type="number" name="refundPercentage" value={formData.refundPercentage} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Payment Status</Label>
            <Select onValueChange={(value) => handleSelect("paymentStatus", value)}>
              <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Not Paid">Not Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Guest Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800">User Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Add Existing Guest</Label>
            <Select onValueChange={(value) => handleSelect("existingGuest", value)}>
              <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"><SelectValue placeholder="Select Guest" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Guest1">Guest 1</SelectItem>
                <SelectItem value="Guest2">Guest 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Full Name</Label><Input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Phone</Label><Input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Alternate Phone</Label><Input name="altPhone" value={formData.altPhone} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Email</Label><Input name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Address Line 1</Label><Input name="address1" value={formData.address1} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Address Line 2</Label><Input name="address2" value={formData.address2} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">City / District</Label><Input name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">State / Province</Label><Input name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2"><Label className="text-sm font-medium text-slate-700">Postal Code</Label><Input name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50" /></div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Country</Label>
            <Select onValueChange={(value) => handleSelect("country", value)}>
              <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"><SelectValue placeholder="Select Country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="India">India</SelectItem>
                <SelectItem value="USA">USA</SelectItem>
                <SelectItem value="UK">UK</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-800">Room Amount</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Room Price</Label>
            <p className="text-sm text-slate-800 mt-1 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50">{formData.roomPrice}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Grand Total</Label>
            <p className="text-sm text-slate-800 mt-1 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50">{formData.totalPayable}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6">
        <Button type="submit" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg">Submit</Button>
        <Button type="button" onClick={handleReset} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-3 px-4 rounded-lg transition-colors">Reset</Button>
      </div>
        </form>
      </div>
    </div>
  );
}
