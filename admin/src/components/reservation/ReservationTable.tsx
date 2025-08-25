import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";

// Required plugins
import "datatables.net-buttons";
import "datatables.net-buttons/js/buttons.colVis.js";
import "datatables.net-columncontrol";

// Styles
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import "datatables.net-columncontrol-dt/css/columnControl.dataTables.css";

import "datatables.net-fixedcolumns";
import "datatables.net-fixedcolumns-dt/css/fixedColumns.dataTables.css";

import reservationdata from "./reservationtable.json";
import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

DataTable.use(DT);

interface Reservation {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  children: number;
  extraGuests: number;
  rooms: number;
  totalGuests: number;
  noOfDays: number;
  noOfFoods: number;
  resort: string;
  roomTypes: string[];
  bookingId: string;
  status: string;
  reservationDate: string;
  paymentStatus: string;
  refundPercent: string;
}

const reservations: Reservation[] = reservationdata;

// Export to CSV
const exportToExcel = () => {
  const headers = [
    "Full Name", "Phone", "Email", "Check In", "Check Out", "Guests",
    "Children", "Extra Guests", "Rooms", "Total Guests", "No. of Days",
    "No. of Foods", "Resort", "Room Types", "Booking ID", "Status",
    "Reservation Date", "Payment Status", "Refund %"
  ];

  const csvContent = [
    headers.join(","),
    ...reservations.map(row => [
      `"${row.fullName}"`,
      `"${row.phone}"`,
      `"${row.email}"`,
      `"${row.checkIn}"`,
      `"${row.checkOut}"`,
      row.guests,
      row.children,
      row.extraGuests,
      row.rooms,
      row.totalGuests,
      row.noOfDays,
      row.noOfFoods,
      `"${row.resort}"`,
      `"${row.roomTypes.join(', ')}"`,
      `"${row.bookingId}"`,
      `"${row.status}"`,
      `"${row.reservationDate}"`,
      `"${row.paymentStatus}"`,
      `"${row.refundPercent}"`
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "Guest_Reservations.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ReservationTable() {
  const tableRef = useRef(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmDisableOpen, setIsConfirmDisableOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [disablingReservation, setDisablingReservation] = useState<Reservation | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [disabledReservations, setDisabledReservations] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Partial<Reservation>>({});

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setFormData({ ...reservation });
    setIsEditOpen(true);
  };

  const handleDisable = (reservation: Reservation) => {
    setDisablingReservation(reservation);
    setIsConfirmDisableOpen(true);
  };

  const handleRowClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDetailSheetOpen(true);
  };

  const confirmDisable = () => {
    if (disablingReservation) {
      console.log('Disabling reservation:', disablingReservation.id);
      setDisabledReservations(prev => new Set([...prev, disablingReservation.id]));
      setIsConfirmDisableOpen(false);
      setDisablingReservation(null);
    }
  };

  const cancelDisable = () => {
    setIsConfirmDisableOpen(false);
    setDisablingReservation(null);
  };

  const handleUpdate = () => {
    if (editingReservation && formData) {
      console.log('Updating reservation:', formData);
      setIsEditOpen(false);
      setEditingReservation(null);
      setFormData({});
    }
  };

  const handleCancel = () => {
    setIsEditOpen(false);
    setEditingReservation(null);
    setFormData({});
  };

  const handleInputChange = (field: keyof Reservation, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .dt-button-collection {
        position: fixed !important;
        z-index: 9999 !important;
        background: white !important;
        border: 1px solid #ddd !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
      }
      .dataTables_wrapper .dataTables_filter {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 1rem;
      }
      .dataTables_wrapper .dataTables_length {
        margin-bottom: 1rem;
      }
      .dataTables_wrapper {
        width: 100%;
        overflow: visible;
      }
      /* Fixed header + scrollable body */
      .dataTables_wrapper .dataTables_scrollBody {
        overflow-y: auto !important;
        overflow-x: auto !important;
        border: 1px solid #ddd;
        border-radius: 0.5rem;
      }
      .dataTables_wrapper table {
        width: max-content !important;
        min-width: 100%;
        margin: 0 !important;
      }
      .dataTables_wrapper .dataTables_scrollHead {
        border-radius: 0.5rem 0.5rem 0 0;
        position: sticky;
        top: 0;
        z-index: 5;
      }
      .dataTables_wrapper .dataTables_scrollHeadInner {
        width: 100% !important;
      }
      table.dataTable thead tr th,
      table.dataTable thead tr td {
        font-weight: 700 !important;
      }
      /* Disabled row styling */
      table.dataTable tbody tr.disabled-row {
        background-color: #f5f5f5 !important;
        opacity: 0.6 !important;
        text-decoration: line-through !important;
      }
      table.dataTable tbody tr.disabled-row:hover {
        background-color: #eeeeee !important;
      }
      /* Action button styling */
      .edit-btn:active {
        transform: translateY(0) !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
      }
      .disable-btn:active:not([disabled]) {
        transform: translateY(0) !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
      }
      /* Clickable row styling */
      table.dataTable tbody tr {
        cursor: pointer !important;
        transition: background-color 0.2s ease !important;
      }
      table.dataTable tbody tr:hover:not(.disabled-row) {
        background-color: #f8fafc !important;
      }
      table.dataTable tbody tr:hover.disabled-row {
        background-color: #eeeeee !important;
      }
    `;
    document.head.appendChild(style);

    const handleButtonClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const reservationId = target.getAttribute('data-id');
      const reservation = reservations.find(r => r.id === reservationId);
      
      if (reservation) {
        // Stop propagation to prevent row click when button is clicked
        event.stopPropagation();
        
        if (target.classList.contains('edit-btn')) {
          handleEdit(reservation);
        } else if (target.classList.contains('disable-btn')) {
          if (!disabledReservations.has(reservation.id)) {
            handleDisable(reservation);
          }
        }
      }
    };

    const handleTableRowClick = (event: Event) => {
      const target = event.target as HTMLElement;
      
      // Don't trigger row click if a button was clicked
      if (target.closest('.edit-btn, .disable-btn')) {
        return;
      }
      
      const row = target.closest('tr');
      if (row && row.parentElement?.tagName === 'TBODY') {
        const rowIndex = Array.from(row.parentElement.children).indexOf(row);
        const reservation = reservations[rowIndex];
        if (reservation) {
          handleRowClick(reservation);
        }
      }
    };

    // Add event listener for edit and disable buttons
    document.addEventListener('click', handleButtonClick);
    document.addEventListener('click', handleTableRowClick);

    return () => {
      document.removeEventListener('click', handleButtonClick);
      document.removeEventListener('click', handleTableRowClick);
    };
  }, []);

  const columns = [
    {
      title: "S.No",
      data: null,
      render: (_data: any, _type: any, _row: any, meta: any) => {
        return meta.row + 1 + meta.settings._iDisplayStart;
      },
      orderable: false,
      searchable: false
    },
    { data: "fullName", title: "Full Name" },
    { data: "phone", title: "Phone" },
    { data: "email", title: "Email" },
    { data: "checkIn", title: "Check In" },
    { data: "checkOut", title: "Check Out" },
    { data: "guests", title: "Guests" },
    { data: "children", title: "Children" },
    { data: "extraGuests", title: "Extra Guests" },
    { data: "rooms", title: "Rooms" },
    { data: "totalGuests", title: "Total Guests" },
    { data: "noOfDays", title: "No. of Days" },
    { data: "noOfFoods", title: "No. of Foods" },
    { data: "resort", title: "Resort" },
    {
      data: "roomTypes",
      title: "Room Types",
      render: (data: string[]) => data.join(", "),
    },
    { data: "bookingId", title: "Booking ID" },
    { data: "status", title: "Status" },
    { data: "reservationDate", title: "Reservation Date" },
    { data: "paymentStatus", title: "Payment Status" },
    { data: "refundPercent", title: "Refund %" },
    {
      data: null,
      title: "Actions",
      orderable: false,
      searchable: false,
      render: (_data: any, _type: any, row: Reservation) => {
        const isDisabled = disabledReservations.has(row.id);
        return `
          <div style="display: flex; gap: 8px; align-items: center;">
            <button 
              class="edit-btn" 
              data-id="${row.id}" 
              title="Edit Reservation"
              style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                ${isDisabled ? 'opacity: 0.5;' : ''}
              "
              onmouseover="this.style.background='#2563eb'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 6px rgba(0, 0, 0, 0.15)'"
              onmouseout="this.style.background='#3b82f6'; this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0, 0, 0, 0.1)'"
            >
              Edit
            </button>
            <button 
              class="disable-btn" 
              data-id="${row.id}" 
              title="${isDisabled ? 'Already Disabled' : 'Disable Record'}"
              style="
                background: ${isDisabled ? '#6b7280' : '#dc2626'};
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
                transition: all 0.2s ease;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              "
              ${isDisabled ? 'disabled' : ''}
              onmouseover="${!isDisabled ? `this.style.background='#b91c1c'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 2px 6px rgba(0, 0, 0, 0.15)'` : ''}"
              onmouseout="${!isDisabled ? `this.style.background='#dc2626'; this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0, 0, 0, 0.1)'` : ''}"
            >
              ${isDisabled ? 'Disabled' : 'Disable'}
            </button>
          </div>
        `;
      },
    },
  ];


  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Reservations</h2>
        <button
          onClick={exportToExcel}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
        >
          ⬇ Export to Excel
        </button>
      </div>

      <div ref={tableRef} className="w-full">
        <DataTable
          data={reservations}
          columns={columns}
          className="display nowrap w-full border border-gray-400"
          options={{
            pageLength: 10,
            lengthMenu: [5, 10, 25, 50, 100],
            order: [[0, "asc"]],
            searching: true,
            paging: true,
            info: true,
            scrollX: true,
            scrollCollapse: true,
            scrollY: "400px",
            layout: {
              topStart: "buttons",
              bottom1Start: "pageLength",
            },
            buttons: [
              {
                extend: "colvis",
                text: "Column Visibility",
                collectionLayout: "fixed two-column",
              },
            ],
            columnControl: ["order", ["orderAsc", "orderDesc", "spacer", "search"]],
            rowCallback: (row: any, data: any) => {
              if (disabledReservations.has(data.id)) {
                row.classList.add('disabled-row');
              } else {
                row.classList.remove('disabled-row');
              }
              return row;
            },
          }}
        />
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Reservation</DialogTitle>
            <DialogDescription>
              Make changes to the reservation details below.
            </DialogDescription>
          </DialogHeader>
          
          {formData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="checkIn">Check In Date</Label>
                <Input
                  id="checkIn"
                  type="date"
                  value={formData.checkIn || ''}
                  onChange={(e) => handleInputChange('checkIn', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="checkOut">Check Out Date</Label>
                <Input
                  id="checkOut"
                  type="date"
                  value={formData.checkOut || ''}
                  onChange={(e) => handleInputChange('checkOut', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="guests">Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  value={formData.guests || 0}
                  onChange={(e) => handleInputChange('guests', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="children">Children</Label>
                <Input
                  id="children"
                  type="number"
                  value={formData.children || 0}
                  onChange={(e) => handleInputChange('children', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="extraGuests">Extra Guests</Label>
                <Input
                  id="extraGuests"
                  type="number"
                  value={formData.extraGuests || 0}
                  onChange={(e) => handleInputChange('extraGuests', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="rooms">Rooms</Label>
                <Input
                  id="rooms"
                  type="number"
                  value={formData.rooms || 0}
                  onChange={(e) => handleInputChange('rooms', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="resort">Resort</Label>
                <Input
                  id="resort"
                  value={formData.resort || ''}
                  onChange={(e) => handleInputChange('resort', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  value={formData.status || ''}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Input
                  id="paymentStatus"
                  value={formData.paymentStatus || ''}
                  onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Disable Action */}
      <Dialog open={isConfirmDisableOpen} onOpenChange={setIsConfirmDisableOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Disable</DialogTitle>
            <DialogDescription>
              Are you sure you want to disable this reservation? This action will hide the record from the database.
            </DialogDescription>
          </DialogHeader>
          
          {disablingReservation && (
            <div className="py-4">
              <p className="text-sm text-gray-600">
                <strong>Reservation ID:</strong> {disablingReservation.id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Guest:</strong> {disablingReservation.fullName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Booking ID:</strong> {disablingReservation.bookingId}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={cancelDisable}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDisable}>
              Yes, Disable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reservation Details Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[700px] lg:w-[800px] flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Reservation Details</SheetTitle>
            <SheetDescription>
              Complete information about the selected reservation
            </SheetDescription>
          </SheetHeader>
          
          {selectedReservation && (
            <>
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  {/* Guest Information */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                          <span className="text-sm text-gray-900">{selectedReservation.fullName}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Phone</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                          <span className="text-sm text-gray-900">{selectedReservation.phone}</span>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                          <span className="text-sm text-gray-900">{selectedReservation.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Booking Information */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Booking Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Booking ID</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                          <span className="text-sm text-gray-900 font-mono">{selectedReservation.bookingId}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Reservation Date</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                          <span className="text-sm text-gray-900">{selectedReservation.reservationDate}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Check In</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                          <span className="text-sm text-gray-900">{selectedReservation.checkIn}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Check Out</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                          <span className="text-sm text-gray-900">{selectedReservation.checkOut}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">No. of Days</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                          <span className="text-sm text-gray-900">{selectedReservation.noOfDays}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Resort</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                          <span className="text-sm text-gray-900">{selectedReservation.resort}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Guest Details */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Guests</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border text-center">
                          <span className="text-lg font-semibold text-gray-900">{selectedReservation.guests}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Children</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border text-center">
                          <span className="text-lg font-semibold text-gray-900">{selectedReservation.children}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Extra Guests</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border text-center">
                          <span className="text-lg font-semibold text-gray-900">{selectedReservation.extraGuests}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Total Guests</Label>
                        <div className="mt-1 p-3 bg-blue-50 rounded-md border border-blue-200 text-center">
                          <span className="text-lg font-bold text-blue-900">{selectedReservation.totalGuests}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Room & Food Information */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Room & Food Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Rooms</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border text-center">
                          <span className="text-lg font-semibold text-gray-900">{selectedReservation.rooms}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">No. of Foods</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border text-center">
                          <span className="text-lg font-semibold text-gray-900">{selectedReservation.noOfFoods}</span>
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Room Types</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedReservation.roomTypes.map((roomType, index) => (
                            <Badge key={index} variant="secondary" className="px-2 py-1 text-xs">
                              {roomType}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Status Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Reservation Status</Label>
                        <div className="mt-1">
                          <Badge 
                            variant={selectedReservation.status === 'Confirmed' ? "default" : "secondary"}
                            className="px-2 py-1"
                          >
                            {selectedReservation.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
                        <div className="mt-1">
                          <Badge 
                            variant={selectedReservation.paymentStatus === 'Paid' ? "default" : "destructive"}
                            className="px-2 py-1"
                          >
                            {selectedReservation.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Refund Percentage</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                          <span className="text-sm text-gray-900">{selectedReservation.refundPercent}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Record Status</Label>
                        <div className="mt-1">
                          <Badge 
                            variant={disabledReservations.has(selectedReservation.id) ? "destructive" : "default"}
                            className="px-2 py-1"
                          >
                            {disabledReservations.has(selectedReservation.id) ? "Disabled" : "Active"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Fixed Action Buttons */}
              <div className="flex-shrink-0 flex gap-2 p-6 pt-4 border-t bg-white">
                <Button 
                  onClick={() => {
                    setIsDetailSheetOpen(false);
                    handleEdit(selectedReservation);
                  }}
                  className="flex-1"
                  disabled={disabledReservations.has(selectedReservation.id)}
                >
                  Edit Reservation
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setIsDetailSheetOpen(false);
                    handleDisable(selectedReservation);
                  }}
                  disabled={disabledReservations.has(selectedReservation.id)}
                >
                  Disable
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
