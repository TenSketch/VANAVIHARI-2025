import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Interfaces
interface TentBookingFormData {
  // Customer Information
  fullName: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  // Booking Details
  bookingId: string;
  tentType: string;
  tentTypeName: string;
  numberOfTents: string;
  reservedFrom: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  children: string;
  noOfDays: string;
  totalGuests: string;
  
  // Payment Information
  amountPayable: string;
  paymentStatus: string;
  amountPaid: string;
  paymentTransactionId: string;
  
  // Cancellation & Refund
  cancelBookingReason: string;
  cancellationMessage: string;
  refundableAmount: string;
  amountRefunded: string;
  dateOfRefund: string;
  
  // Booking Status
  status: string;
}

const AddTentBookings = () => {
  const [formData, setFormData] = useState<TentBookingFormData>({
    // Customer Information
    fullName: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    
    // Booking Details
    bookingId: "",
    tentType: "",
    tentTypeName: "",
    numberOfTents: "1",
    reservedFrom: "Admin",
    checkIn: "",
    checkOut: "",
    guests: "1",
    children: "0",
    noOfDays: "",
    totalGuests: "",
    
    // Payment Information
    amountPayable: "",
    paymentStatus: "Pending",
    amountPaid: "0",
    paymentTransactionId: "",
    
    // Cancellation & Refund
    cancelBookingReason: "",
    cancellationMessage: "",
    refundableAmount: "0",
    amountRefunded: "0",
    dateOfRefund: "",
    
    // Booking Status
    status: "Pending",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateBookingId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TENT-${timestamp}-${random}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) return;
    
    // Basic validation
    if (!formData.fullName || !formData.phone || !formData.email || !formData.address1 || !formData.postalCode || !formData.country || !formData.tentType || !formData.city || !formData.state || !formData.checkIn || !formData.checkOut) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (new Date(formData.checkOut) <= new Date(formData.checkIn)) {
      alert('Check-out date must be after check-in date');
      return;
    }
    
    setIsSubmitting(true);
    
    // Get token for authentication (for future API integration)
    const token = localStorage.getItem('admin_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Prepare submission data
    const submitData = {
      ...formData,
      bookingId: formData.bookingId || generateBookingId(),
      numberOfTents: parseInt(formData.numberOfTents) || 1,
      guests: parseInt(formData.guests) || 1,
      children: parseInt(formData.children) || 0,
      noOfDays: parseInt(formData.noOfDays) || 0,
      totalGuests: parseInt(formData.totalGuests) || 0,
      amountPayable: parseFloat(formData.amountPayable) || 0,
      amountPaid: parseFloat(formData.amountPaid) || 0,
      refundableAmount: parseFloat(formData.refundableAmount) || 0,
      amountRefunded: parseFloat(formData.amountRefunded) || 0,
      reservationDate: new Date().toISOString().split('T')[0],
      paymentTransactionDateTime: formData.paymentTransactionId ? new Date().toISOString() : '',
      refundRequestedDateTime: formData.dateOfRefund ? new Date().toISOString() : '',
    };

    // For demo purposes, we'll just log the data and show success
    console.log('Tent Booking Data:', submitData);
    
    setTimeout(() => {
      alert('Tent booking created successfully!');
      handleReset();
      setIsSubmitting(false);
    }, 1000);
  };

  const handleReset = () => {
    setFormData({
      // Customer Information
      fullName: "",
      phone: "",
      email: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      
      // Booking Details
      bookingId: "",
      tentType: "",
      tentTypeName: "",
      numberOfTents: "1",
      reservedFrom: "Admin",
      checkIn: "",
      checkOut: "",
      guests: "1",
      children: "0",
      noOfDays: "",
      totalGuests: "",
      
      // Payment Information
      amountPayable: "",
      paymentStatus: "Pending",
      amountPaid: "0",
      paymentTransactionId: "",
      
      // Cancellation & Refund
      cancelBookingReason: "",
      cancellationMessage: "",
      refundableAmount: "0",
      amountRefunded: "0",
      dateOfRefund: "",
      
      // Booking Status
      status: "Pending",
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">Add New Tent Booking</h1>
          <p className="text-slate-600">Fill in the details to create a tent booking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="e.g., John Doe"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="e.g., +91-9876543210"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="e.g., john@example.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address1" className="text-sm font-medium text-slate-700">Address Line 1 <span className="text-red-500">*</span></Label>
              <Input
                id="address1"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                required
                placeholder="e.g., 123 Main Street"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address2" className="text-sm font-medium text-slate-700">Address Line 2</Label>
              <Input
                id="address2"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                placeholder="e.g., Apartment, Suite, etc."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-slate-700">City <span className="text-red-500">*</span></Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="e.g., Mumbai"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium text-slate-700">State <span className="text-red-500">*</span></Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="e.g., Maharashtra"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm font-medium text-slate-700">Postal Code <span className="text-red-500">*</span></Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
                placeholder="e.g., 400001"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-slate-700">Country <span className="text-red-500">*</span></Label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              >
                <option value="">-- Select Country --</option>
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>

          {/* Booking Details */}
          <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Booking Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bookingId" className="text-sm font-medium text-slate-700">Booking ID <span className="text-red-500">*</span></Label>
              <Input
                id="bookingId"
                name="bookingId"
                value={formData.bookingId}
                onChange={handleChange}
                required
                placeholder="e.g., TENT-2025-001"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tentType" className="text-sm font-medium text-slate-700">Tent Type ID <span className="text-red-500">*</span></Label>
              <Input
                id="tentType"
                name="tentType"
                value={formData.tentType}
                onChange={handleChange}
                required
                placeholder="e.g., tt-001"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tentTypeName" className="text-sm font-medium text-slate-700">Tent Type Name <span className="text-red-500">*</span></Label>
              <select
                id="tentTypeName"
                name="tentTypeName"
                value={formData.tentTypeName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              >
                <option value="">-- Select Tent Type --</option>
                <option value="2 Person">2 Person</option>
                <option value="4 Person">4 Person</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfTents" className="text-sm font-medium text-slate-700">Number of Tents <span className="text-red-500">*</span></Label>
              <Input
                id="numberOfTents"
                name="numberOfTents"
                type="number"
                min="1"
                max="10"
                value={formData.numberOfTents}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservedFrom" className="text-sm font-medium text-slate-700">Reserved From <span className="text-red-500">*</span></Label>
              <select
                id="reservedFrom"
                name="reservedFrom"
                value={formData.reservedFrom}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              >
                <option value="">-- Select Source --</option>
                <option value="Admin">Admin</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkIn" className="text-sm font-medium text-slate-700">Check-in Date <span className="text-red-500">*</span></Label>
              <Input
                id="checkIn"
                name="checkIn"
                type="date"
                value={formData.checkIn}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut" className="text-sm font-medium text-slate-700">Check-out Date <span className="text-red-500">*</span></Label>
              <Input
                id="checkOut"
                name="checkOut"
                type="date"
                value={formData.checkOut}
                onChange={handleChange}
                required
                min={formData.checkIn || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests" className="text-sm font-medium text-slate-700">Adults <span className="text-red-500">*</span></Label>
              <Input
                id="guests"
                name="guests"
                type="number"
                min="1"
                max="20"
                value={formData.guests}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="children" className="text-sm font-medium text-slate-700">Children</Label>
              <Input
                id="children"
                name="children"
                type="number"
                min="0"
                max="10"
                value={formData.children}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-slate-700">Booking Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="noOfDays" className="text-sm font-medium text-slate-700">Number of Days <span className="text-red-500">*</span></Label>
              <Input
                id="noOfDays"
                name="noOfDays"
                type="number"
                min="1"
                value={formData.noOfDays}
                onChange={handleChange}
                required
                placeholder="e.g., 3"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalGuests" className="text-sm font-medium text-slate-700">Total Guests <span className="text-red-500">*</span></Label>
              <Input
                id="totalGuests"
                name="totalGuests"
                type="number"
                min="1"
                value={formData.totalGuests}
                onChange={handleChange}
                required
                placeholder="e.g., 4"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
          </div>

          {/* Payment Information */}
          <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="amountPayable" className="text-sm font-medium text-slate-700">Amount Payable (₹) <span className="text-red-500">*</span></Label>
              <Input
                id="amountPayable"
                name="amountPayable"
                type="number"
                min="0"
                step="0.01"
                value={formData.amountPayable}
                onChange={handleChange}
                required
                placeholder="e.g., 5000"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentStatus" className="text-sm font-medium text-slate-700">Payment Status</Label>
              <select
                id="paymentStatus"
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountPaid" className="text-sm font-medium text-slate-700">Amount Paid (₹)</Label>
              <Input
                id="amountPaid"
                name="amountPaid"
                type="number"
                min="0"
                step="0.01"
                value={formData.amountPaid}
                onChange={handleChange}
                placeholder="e.g., 5000"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTransactionId" className="text-sm font-medium text-slate-700">Payment Transaction ID</Label>
              <Input
                id="paymentTransactionId"
                name="paymentTransactionId"
                value={formData.paymentTransactionId}
                onChange={handleChange}
                placeholder="e.g., TXN123456789"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
          </div>

          {/* Cancellation & Refund Information */}
          <h3 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">Cancellation & Refund</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cancelBookingReason" className="text-sm font-medium text-slate-700">Cancel Booking Reason</Label>
              <Input
                id="cancelBookingReason"
                name="cancelBookingReason"
                value={formData.cancelBookingReason}
                onChange={handleChange}
                placeholder="e.g., Weather conditions"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refundableAmount" className="text-sm font-medium text-slate-700">Refundable Amount (₹)</Label>
              <Input
                id="refundableAmount"
                name="refundableAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.refundableAmount}
                onChange={handleChange}
                placeholder="e.g., 4000"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amountRefunded" className="text-sm font-medium text-slate-700">Amount Refunded (₹)</Label>
              <Input
                id="amountRefunded"
                name="amountRefunded"
                type="number"
                min="0"
                step="0.01"
                value={formData.amountRefunded}
                onChange={handleChange}
                placeholder="e.g., 4000"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfRefund" className="text-sm font-medium text-slate-700">Date of Refund</Label>
              <Input
                id="dateOfRefund"
                name="dateOfRefund"
                type="date"
                value={formData.dateOfRefund}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cancellationMessage" className="text-sm font-medium text-slate-700">Cancellation Message</Label>
              <textarea
                id="cancellationMessage"
                name="cancellationMessage"
                value={formData.cancellationMessage}
                onChange={handleChange}
                rows={4}
                placeholder="Enter detailed cancellation message..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50 resize-vertical"
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
              {isSubmitting ? 'Creating Booking...' : 'Submit'}
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

export default AddTentBookings;