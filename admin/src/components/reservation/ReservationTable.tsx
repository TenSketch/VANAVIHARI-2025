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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [disablingReservation, setDisablingReservation] = useState<Reservation | null>(null);
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
    `;
    document.head.appendChild(style);

    const handleButtonClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const reservationId = target.getAttribute('data-id');
      const reservation = reservations.find(r => r.id === reservationId);
      
      if (reservation) {
        if (target.classList.contains('edit-btn')) {
          handleEdit(reservation);
        } else if (target.classList.contains('disable-btn')) {
          if (!disabledReservations.has(reservation.id)) {
            handleDisable(reservation);
          }
        }
      }
    };

    // Add event listener for edit and disable buttons
    document.addEventListener('click', handleButtonClick);
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
    <div className="p-6 w-full max-w-full overflow-hidden">
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
          className="display nowrap w-full"
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
    </div>
  );
}
