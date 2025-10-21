import { useState, useEffect, useMemo } from "react";
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
import { MultiSelect } from "@/components/ui/multi-select";
import { format } from "date-fns";

interface Resort {
  _id: string;
  resortName: string;
  slug: string;
}

interface CottageType {
  _id: string;
  name: string;
  resort: string | { _id: string; resortName?: string; name?: string };
}

interface Room {
  _id: string;
  roomNumber: string;
  roomId?: string;
  roomName?: string;
  cottageType: string | { _id: string; name?: string };
  resort: string | { _id: string; resortName?: string };
  price?: number;
  weekdayRate?: number;
  weekendRate?: number;
  guests?: number;
  extraGuests?: number;
  children?: number;
}

export default function AddReservationForm() {
  const [formData, setFormData] = useState({
    resort: "",
    cottageTypes: [] as string[],
    rooms: [] as string[],
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

  const [resorts, setResorts] = useState<Resort[]>([]);
  const [cottageTypes, setCottageTypes] = useState<CottageType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState({
    resorts: false,
    cottageTypes: false,
    rooms: false,
  });

  const apiUrl =
    (import.meta.env && import.meta.env.VITE_API_URL) ||
    "http://localhost:5000";

  // Calculate maximum allowed guests based on selected rooms
  const guestLimits = useMemo(() => {
    if (formData.rooms.length === 0) {
      return { maxGuests: 0, maxExtraGuests: 0, maxChildren: 0 };
    }

    const selectedRooms = rooms.filter((room) =>
      formData.rooms.includes(room._id)
    );

    const maxGuests = selectedRooms.reduce(
      (sum, room) => sum + (room.guests || 0),
      0
    );
    const maxExtraGuests = selectedRooms.reduce(
      (sum, room) => sum + (room.extraGuests || 0),
      0
    );
    const maxChildren = selectedRooms.reduce(
      (sum, room) => sum + (room.children || 0),
      0
    );

    return { maxGuests, maxExtraGuests, maxChildren };
  }, [formData.rooms, rooms]);

  // Auto-generate booking ID when resort is selected
  useEffect(() => {
    const generateBookingId = async () => {
      if (!formData.resort) {
        setFormData(prev => ({ ...prev, bookingId: "" }));
        return;
      }

      try {
        // Get resort details
        const selectedResort = resorts.find(r => r._id === formData.resort);
        if (!selectedResort) return;

        // Get resort initials (first letter of each word)
        const resortInitials = selectedResort.resortName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase())
          .join('');

        // Get current date/time
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, '0');

        // Fetch last booking serial from backend
        const res = await fetch(`${apiUrl}/api/reservations/next-serial`);
        const data = await res.json();
        const serial = String(data.serial || 1).padStart(3, '0');

        // Generate booking ID: BB2109072510008
        const bookingId = `${resortInitials}${day}${hour}${minute}${year}${month}${serial}`;
        
        setFormData(prev => ({ ...prev, bookingId }));
      } catch (err) {
        console.error('Error generating booking ID:', err);
      }
    };

    generateBookingId();
  }, [formData.resort, resorts, apiUrl]);

  // Auto-update number of rooms based on selected rooms
  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      numberOfRooms: String(formData.rooms.length) 
    }));
  }, [formData.rooms]);

  // Fetch all resorts on mount
  useEffect(() => {
    const fetchResorts = async () => {
      setLoading((prev) => ({ ...prev, resorts: true }));
      try {
        const res = await fetch(`${apiUrl}/api/resorts`);
        const data = await res.json();
        if (data.resorts) {
          setResorts(data.resorts);
        }
      } catch (err) {
        console.error("Error fetching resorts:", err);
      } finally {
        setLoading((prev) => ({ ...prev, resorts: false }));
      }
    };
    fetchResorts();
  }, []);

  // Fetch cottage types when resort changes
  useEffect(() => {
    if (!formData.resort) {
      setCottageTypes([]);
      setRooms([]);
      return;
    }

    const fetchCottageTypes = async () => {
      setLoading((prev) => ({ ...prev, cottageTypes: true }));
      try {
        const res = await fetch(`${apiUrl}/api/cottage-types`);
        const data = await res.json();
        if (data.cottageTypes) {
          // Filter cottage types by selected resort
          // Handle both populated (object) and unpopulated (string) resort field
          const filtered = data.cottageTypes.filter((ct: CottageType) => {
            const resortId =
              typeof ct.resort === "string" ? ct.resort : ct.resort?._id;
            return resortId === formData.resort;
          });
          console.log("Selected resort:", formData.resort);
          console.log("All cottage types:", data.cottageTypes);
          console.log("Filtered cottage types:", filtered);
          setCottageTypes(filtered);
        }
      } catch (err) {
        console.error("Error fetching cottage types:", err);
      } finally {
        setLoading((prev) => ({ ...prev, cottageTypes: false }));
      }
    };
    fetchCottageTypes();
  }, [formData.resort]);

  // Fetch rooms when cottage types change
  useEffect(() => {
    if (!formData.cottageTypes || formData.cottageTypes.length === 0) {
      setRooms([]);
      return;
    }

    const fetchRooms = async () => {
      setLoading((prev) => ({ ...prev, rooms: true }));
      try {
        const res = await fetch(`${apiUrl}/api/rooms`);
        const data = await res.json();
        if (data.rooms) {
          // Filter rooms by selected cottage types (multiple)
          // Handle both populated (object) and unpopulated (string) cottageType field
          const filtered = data.rooms.filter((room: Room) => {
            const cottageTypeId =
              typeof room.cottageType === "string"
                ? room.cottageType
                : room.cottageType?._id;
            return formData.cottageTypes.includes(cottageTypeId);
          });
          console.log("Selected cottage types:", formData.cottageTypes);
          console.log("Filtered rooms:", filtered);
          setRooms(filtered);
        }
      } catch (err) {
        console.error("Error fetching rooms:", err);
      } finally {
        setLoading((prev) => ({ ...prev, rooms: false }));
      }
    };
    fetchRooms();
  }, [apiUrl, formData.cottageTypes]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Validate guest limits
    if (name === "guests" || name === "extraGuests" || name === "children") {
      const numValue = parseInt(value) || 0;

      if (name === "guests" && numValue > guestLimits.maxGuests) {
        alert(
          `Maximum ${guestLimits.maxGuests} guests allowed for selected rooms`
        );
        return;
      }
      if (name === "extraGuests" && numValue > guestLimits.maxExtraGuests) {
        alert(
          `Maximum ${guestLimits.maxExtraGuests} extra guests allowed for selected rooms`
        );
        return;
      }
      if (name === "children" && numValue > guestLimits.maxChildren) {
        alert(
          `Maximum ${guestLimits.maxChildren} children allowed for selected rooms`
        );
        return;
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSelect = (name: string, value: string) => {
    // Reset dependent fields when parent selection changes
    if (name === "resort") {
      setFormData({ ...formData, resort: value, cottageTypes: [], rooms: [] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleMultiSelect = (name: string, values: string[]) => {
    if (name === "cottageTypes") {
      setFormData({
        ...formData,
        cottageTypes: values,
        rooms: [],
        guests: "",
        extraGuests: "",
        children: "",
      });
    } else if (name === "rooms") {
      // Clear guest counts when rooms change to avoid invalid values
      setFormData({
        ...formData,
        rooms: values,
        guests: "",
        extraGuests: "",
        children: "",
      });
    }
  };

  const handleReset = () => {
    setFormData({
      resort: "",
      cottageTypes: [],
      rooms: [],
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
    setCottageTypes([]);
    setRooms([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // send to backend
    (async () => {
      try {
        const apiUrl =
          (import.meta.env && import.meta.env.VITE_API_URL) ||
          "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/reservations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const contentType = res.headers.get("content-type") || "";
        let data: { error?: string } | null = null;
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          // if server returns HTML (e.g. index.html) or plain text, capture it for debugging
          const text = await res.text();
          throw new Error(
            `Unexpected response from server: ${text.slice(0, 200)}`
          );
        }
        if (!res.ok)
          throw new Error(data?.error || "Failed to save reservation");
        // simple feedback
        alert("Reservation saved successfully");
        // reset form
        setFormData({
          resort: "",
          cottageTypes: [],
          rooms: [],
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
      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        alert("Error saving reservation: " + errorMessage);
      }
    })();
  };

  return (
    <div className="min-h-screen p-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            Add Reservation
          </h1>
          <p className="text-slate-600">
            Please fill in all the required details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800">Room Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Select Resort
                </Label>
                <Select
                  value={formData.resort}
                  onValueChange={(value) => handleSelect("resort", value)}
                >
                  <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50">
                    <SelectValue
                      placeholder={
                        loading.resorts ? "Loading..." : "Choose Resort"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {resorts.map((resort) => (
                      <SelectItem key={resort._id} value={resort._id}>
                        {resort.resortName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Cottage Type
                </Label>
                <MultiSelect
                  options={cottageTypes.map((ct) => ({
                    label: ct.name,
                    value: ct._id,
                  }))}
                  selected={formData.cottageTypes}
                  onChange={(values) =>
                    handleMultiSelect("cottageTypes", values)
                  }
                  placeholder={
                    !formData.resort
                      ? "Select Resort First"
                      : loading.cottageTypes
                      ? "Loading..."
                      : cottageTypes.length === 0
                      ? "No Cottage Types"
                      : "Choose Cottage Types"
                  }
                  disabled={!formData.resort}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Choose Rooms
                </Label>
                <MultiSelect
                  options={rooms.map((room) => ({
                    label: room.roomName || room.roomId || room.roomNumber,
                    value: room._id,
                  }))}
                  selected={formData.rooms}
                  onChange={(values) => handleMultiSelect("rooms", values)}
                  placeholder={
                    formData.cottageTypes.length === 0
                      ? "Select Cottage Type First"
                      : loading.rooms
                      ? "Loading..."
                      : rooms.length === 0
                      ? "No Rooms Available"
                      : "Choose Rooms"
                  }
                  disabled={formData.cottageTypes.length === 0}
                />
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-800">
              Booking Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Check In
                </Label>
                <Input
                  type="date"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Check Out
                </Label>
                <Input
                  type="date"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Guests{" "}
                  {formData.rooms.length > 0 && (
                    <span className="text-slate-500">
                      (Max: {guestLimits.maxGuests})
                    </span>
                  )}
                </Label>
                <Input
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  min="0"
                  max={guestLimits.maxGuests || undefined}
                  disabled={formData.rooms.length === 0}
                  placeholder={
                    formData.rooms.length === 0
                      ? "Select rooms first"
                      : "Enter guests"
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Extra Guests{" "}
                  {formData.rooms.length > 0 && (
                    <span className="text-slate-500">
                      (Max: {guestLimits.maxExtraGuests})
                    </span>
                  )}
                </Label>
                <Input
                  type="number"
                  name="extraGuests"
                  value={formData.extraGuests}
                  onChange={handleChange}
                  min="0"
                  max={guestLimits.maxExtraGuests || undefined}
                  disabled={formData.rooms.length === 0}
                  placeholder={
                    formData.rooms.length === 0
                      ? "Select rooms first"
                      : "Enter extra guests"
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Children (under 5){" "}
                  {formData.rooms.length > 0 && (
                    <span className="text-slate-500">
                      (Max: {guestLimits.maxChildren})
                    </span>
                  )}
                </Label>
                <Input
                  type="number"
                  name="children"
                  value={formData.children}
                  onChange={handleChange}
                  min="0"
                  max={guestLimits.maxChildren || undefined}
                  disabled={formData.rooms.length === 0}
                  placeholder={
                    formData.rooms.length === 0
                      ? "Select rooms first"
                      : "Enter children"
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelect("status", value)}
                >
                  <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50">
                    <SelectValue placeholder="Choose Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="pre-reserved">Pre-Reserved</SelectItem>
                    <SelectItem value="not-reserved">Not Reserved</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Booking ID
                </Label>
                <Input
                  name="bookingId"
                  value={formData.bookingId}
                  readOnly
                  placeholder="Auto-generated"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-100 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Reservation Date
                </Label>
                <Input
                  type="date"
                  name="reservationDate"
                  value={formData.reservationDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  No. of Rooms
                </Label>
                <Input
                  type="number"
                  name="numberOfRooms"
                  value={formData.numberOfRooms}
                  readOnly
                  placeholder="Auto-counted"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-100 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Refund %
                </Label>
                <Input
                  type="number"
                  name="refundPercentage"
                  value={formData.refundPercentage}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Payment Status
                </Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) =>
                    handleSelect("paymentStatus", value)
                  }
                >
                  <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
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
                <Label className="text-sm font-medium text-slate-700">
                  Add Existing Guest
                </Label>
                <Select
                  onValueChange={(value) =>
                    handleSelect("existingGuest", value)
                  }
                >
                  <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50">
                    <SelectValue placeholder="Select Guest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Guest1">Guest 1</SelectItem>
                    <SelectItem value="Guest2">Guest 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Full Name
                </Label>
                <Input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Phone
                </Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Alternate Phone
                </Label>
                <Input
                  name="altPhone"
                  value={formData.altPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Address Line 1
                </Label>
                <Input
                  name="address1"
                  value={formData.address1}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Address Line 2
                </Label>
                <Input
                  name="address2"
                  value={formData.address2}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  City / District
                </Label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  State / Province
                </Label>
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Postal Code
                </Label>
                <Input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Country
                </Label>
                <Select
                  onValueChange={(value) => handleSelect("country", value)}
                >
                  <SelectTrigger className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors bg-slate-50">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
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
                <Label className="text-sm font-medium text-slate-700">
                  Room Price
                </Label>
                <p className="text-sm text-slate-800 mt-1 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50">
                  {formData.roomPrice}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Grand Total
                </Label>
                <p className="text-sm text-slate-800 mt-1 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50">
                  {formData.totalPayable}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Submit
            </Button>
            <Button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
