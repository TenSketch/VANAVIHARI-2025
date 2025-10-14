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

// Using backend data instead of local JSON
import { useEffect, useRef, useState } from "react";
import { usePermissions } from '@/lib/AdminProvider'
// Removed small modals (edit & confirm disable)
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  disabled?: boolean;
}


// (Export function moved into component so it can use fetched reservations)

export default function ReservationTable() {
  const tableRef = useRef(null);
  const apiUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';
  const perms = usePermissions()
  const permsRef = useRef(perms)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'view'|'edit'>('view')
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isConfirmDisableOpen, setIsConfirmDisableOpen] = useState(false)
  const [disablingReservation, setDisablingReservation] = useState<Reservation | null>(null)
  const [disabledReservations, setDisabledReservations] = useState<Set<string>>(new Set());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const reservationsRef = useRef<Reservation[]>([])

  // keep ref in sync so non-react handlers can access latest data
  useEffect(() => { reservationsRef.current = reservations }, [reservations])

  // edit form state for side sheet
  const [editForm, setEditForm] = useState<Partial<Reservation> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // populate edit form when selection changes
  useEffect(() => {
    if (selectedReservation) {
      setEditForm({ ...selectedReservation })
    } else {
      setEditForm(null)
    }
  }, [selectedReservation])

  // keep perms ref up-to-date for event handlers attached to document
  useEffect(() => { permsRef.current = perms }, [perms])

  const handleEditChange = (field: keyof Reservation, value: any) => {
    setEditForm(prev => ({ ...(prev || {}), [field]: value }))
  }

  const saveChanges = async () => {
    if (!permsRef.current.canEdit) return
    if (!editForm || !selectedReservation) return
    setIsSaving(true)
    // optimistic local update
    const updatedLocal: Reservation = { ...(selectedReservation), ...(editForm as any) }
    setReservations(prev => prev.map(r => r.id === selectedReservation.id ? updatedLocal : r))
    setSelectedReservation(updatedLocal)

    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(selectedReservation.id))
      if (!isObjectId) {
        alert('Demo data - changes saved locally only')
        setIsSaving(false)
        return
      }

      const payload: any = { ...editForm }
      // normalize some fields
      if (payload.noOfDays) delete payload.noOfDays
      if (payload.totalGuests) delete payload.totalGuests

      const token = localStorage.getItem('admin_token')
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${apiUrl}/api/reservations/${selectedReservation.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      })

      const text = await res.text()
      let parsed: any = null
      try { parsed = text ? JSON.parse(text) : null } catch(e) { parsed = text }
      if (!res.ok) {
        throw new Error(parsed?.error || parsed?.message || res.statusText)
      }

      // update with server response if provided
      const server = parsed?.reservation || parsed
      if (server) {
        const mapped = {
          id: String(server._id || server.id || selectedReservation.id),
          fullName: server.fullName || updatedLocal.fullName,
          phone: server.phone || updatedLocal.phone,
          email: server.email || updatedLocal.email,
          checkIn: server.checkIn ? new Date(server.checkIn).toISOString().slice(0,10) : updatedLocal.checkIn,
          checkOut: server.checkOut ? new Date(server.checkOut).toISOString().slice(0,10) : updatedLocal.checkOut,
          guests: Number(server.guests) || updatedLocal.guests,
          children: Number(server.children) || updatedLocal.children,
          extraGuests: Number(server.extraGuests) || updatedLocal.extraGuests,
          rooms: Number(server.numberOfRooms || server.rooms) || updatedLocal.rooms,
          totalGuests: (Number(server.guests)||0)+(Number(server.extraGuests)||0)+(Number(server.children)||0),
          noOfDays: (server.checkIn && server.checkOut) ? Math.max(1, Math.round((new Date(server.checkOut).getTime() - new Date(server.checkIn).getTime())/(1000*60*60*24))) : updatedLocal.noOfDays,
          noOfFoods: Number(server.noOfFoods) || updatedLocal.noOfFoods,
          resort: server.resort || updatedLocal.resort,
          roomTypes: server.roomTypes || (server.room ? [server.room] : updatedLocal.roomTypes),
          bookingId: server.bookingId || updatedLocal.bookingId,
          status: server.status || updatedLocal.status,
          reservationDate: server.reservationDate ? new Date(server.reservationDate).toISOString().slice(0,10) : updatedLocal.reservationDate,
          paymentStatus: server.paymentStatus || updatedLocal.paymentStatus,
          refundPercent: server.refundPercentage != null ? String(server.refundPercentage) : (server.refundPercent || updatedLocal.refundPercent),
          disabled: Boolean(server.disabled || updatedLocal.disabled),
        }

        setReservations(prev => prev.map(r => r.id === mapped.id ? mapped : r))
        setSelectedReservation(mapped)
      }

      setIsSaving(false)
      setSheetMode('view')
    } catch (err: any) {
      console.error('Save failed', err)
      alert('Failed to save: ' + (err?.message || String(err)))
      // simple revert: reload to get authoritative data
      window.location.reload()
      setIsSaving(false)
    }
  }

  // Export to CSV (uses current reservations)
  const exportToExcel = () => {
    const headers = [
      "Full Name", "Phone", "Email", "Check In", "Check Out", "Guests",
      "Children", "Extra Guests", "Rooms", "Total Guests", "No. of Days",
      "No. of Foods", "Resort", "Room Types", "Booking ID", "Status",
      "Reservation Date", "Payment Status", "Refund %"
    ];

    const csvContent = [
      headers.join(","),
      ...reservationsRef.current.map(row => [
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
  // Removed edit & disable confirmation logic; actions now happen directly

  // Toggle/disable a reservation (mirrors cottage-type pattern)
  const disableReservation = async (reservation: Reservation | null) => {
    if (!permsRef.current.canDisable) return
    if (!reservation) return
    const target = !Boolean(reservation.disabled)

    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(String(reservation.id))
      if (!isObjectId) {
        // demo/local only
        setReservations(prev => prev.map(r => r.id === reservation.id ? { ...r, disabled: target } : r))
        setDisabledReservations(prev => {
          const copy = new Set(prev)
          if (target) copy.add(reservation.id); else copy.delete(reservation.id)
          return copy
        })
        alert('This is demo data; changes are local only.')
        return
      }

      const token = localStorage.getItem('admin_token')
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const res = await fetch(`${apiUrl}/api/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ disabled: target }),
      })

      if (!res.ok) {
        const data = await res.json().catch(()=>null)
        const msg = data?.error || data?.message || res.statusText
        throw new Error(msg || 'Failed to update')
      }

      const data = await res.json()
      const server = data?.reservation || data
      if (server) {
        const mapped: Reservation = {
          id: String(server._id || server.id || reservation.id),
          fullName: server.fullName || reservation.fullName,
          phone: server.phone || reservation.phone,
          email: server.email || reservation.email,
          checkIn: server.checkIn ? new Date(server.checkIn).toISOString().slice(0,10) : reservation.checkIn,
          checkOut: server.checkOut ? new Date(server.checkOut).toISOString().slice(0,10) : reservation.checkOut,
          guests: Number(server.guests) || reservation.guests,
          children: Number(server.children) || reservation.children,
          extraGuests: Number(server.extraGuests) || reservation.extraGuests,
          rooms: Number(server.numberOfRooms || server.rooms) || reservation.rooms,
          totalGuests: (Number(server.guests)||0)+(Number(server.extraGuests)||0)+(Number(server.children)||0),
          noOfDays: (server.checkIn && server.checkOut) ? Math.max(1, Math.round((new Date(server.checkOut).getTime() - new Date(server.checkIn).getTime())/(1000*60*60*24))) : reservation.noOfDays,
          noOfFoods: Number(server.noOfFoods) || reservation.noOfFoods,
          resort: server.resort || reservation.resort,
          roomTypes: server.roomTypes || (server.room ? [server.room] : reservation.roomTypes),
          bookingId: server.bookingId || reservation.bookingId,
          status: server.status || reservation.status,
          reservationDate: server.reservationDate ? new Date(server.reservationDate).toISOString().slice(0,10) : reservation.reservationDate,
          paymentStatus: server.paymentStatus || reservation.paymentStatus,
          refundPercent: server.refundPercentage != null ? String(server.refundPercentage) : (server.refundPercent || reservation.refundPercent),
          disabled: Boolean(server.disabled),
        }

        setReservations(prev => prev.map(r => r.id === mapped.id ? mapped : r))
        if (selectedReservation && selectedReservation.id === mapped.id) setSelectedReservation(mapped)
        setDisabledReservations(prev => {
          const copy = new Set(prev)
          if (mapped.disabled) copy.add(mapped.id); else copy.delete(mapped.id)
          return copy
        })
      }
    } catch (err:any) {
      console.error('Toggle disabled error', err)
      alert('Error updating reservation: ' + (err?.message || String(err)))
      // no optimistic update was applied for server case; nothing to revert here
    }
  }

  // Row click opens view-only details
  const handleRowClick = (reservation: Reservation) => {
    if (!reservation) return
    setSelectedReservation(reservation)
    setSheetMode('view')
    setIsDetailSheetOpen(true)
  }

  const confirmDisable = async () => {
    if (!disablingReservation) return
    await disableReservation(disablingReservation)
    setIsConfirmDisableOpen(false)
    setDisablingReservation(null)
  }

  const cancelDisable = () => {
    setIsConfirmDisableOpen(false)
    setDisablingReservation(null)
  }

  useEffect(() => {
    // fetch reservations and setup table event listeners/styles
    const fetchReservations = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/reservations`)
        const contentType = res.headers.get('content-type') || ''
        let data: any = null
        if (contentType.includes('application/json')) data = await res.json()
        else {
          const text = await res.text()
          try { data = text ? JSON.parse(text) : null } catch(e){ data = text }
        }

        if (!res.ok) throw new Error(data?.error || res.statusText)

        const raw = data.reservations || data || []
        const mapped: Reservation[] = raw.map((r: any) => {
          const checkIn = r.checkIn ? new Date(r.checkIn).toISOString().slice(0,10) : ''
          const checkOut = r.checkOut ? new Date(r.checkOut).toISOString().slice(0,10) : ''
          const noOfDays = (r.checkIn && r.checkOut) ? Math.max(1, Math.round((new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime())/(1000*60*60*24))) : 0
          const totalGuests = (Number(r.guests) || 0) + (Number(r.extraGuests) || 0) + (Number(r.children) || 0)
          return {
            id: String(r._id || r.id || ''),
            fullName: r.fullName || r.existingGuest || '',
            phone: r.phone || r.altPhone || '',
            email: r.email || '',
            checkIn,
            checkOut,
            guests: Number(r.guests) || 0,
            children: Number(r.children) || 0,
            extraGuests: Number(r.extraGuests) || 0,
            rooms: Number(r.numberOfRooms || r.rooms) || 0,
            totalGuests,
            noOfDays,
            noOfFoods: Number(r.noOfFoods) || 0,
            resort: r.resort || '',
            roomTypes: r.roomTypes || (r.room ? [r.room] : []),
            bookingId: r.bookingId || '',
            status: r.status || '',
            reservationDate: r.reservationDate ? new Date(r.reservationDate).toISOString().slice(0,10) : '',
            paymentStatus: r.paymentStatus || '',
            refundPercent: r.refundPercentage != null ? String(r.refundPercentage) : (r.refundPercent || ''),
            disabled: Boolean(r.disabled),
          }
        })

        setReservations(mapped)
        const disabledSet = new Set(mapped.filter(r=>r.disabled).map(r=>r.id))
        setDisabledReservations(disabledSet)
      } catch (err) {
        console.error('Failed to load reservations', err)
      }
    }

    fetchReservations()
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
      /* Disabled row styling - subtle fade */
      table.dataTable tbody tr.disabled-row {
        background-color: #fbfbfb !important;
        opacity: 0.55 !important;
        filter: grayscale(0.08) brightness(0.98) !important;
        transition: background-color 0.15s ease, opacity 0.15s ease, filter 0.15s ease;
      }
      table.dataTable tbody tr.disabled-row td {
        color: rgba(0,0,0,0.65) !important;
      }
      table.dataTable tbody tr.disabled-row:hover {
        background-color: #f6f6f6 !important;
        opacity: 0.65 !important;
        filter: grayscale(0.03) brightness(1) !important;
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
      // support clicks on inner text/nodes by finding the closest button
      const btn = target.closest('.edit-btn, .disable-btn') as HTMLElement | null;
      if (!btn) return;

      // Stop propagation to prevent row click when button is clicked
      event.stopPropagation();

      const reservationId = btn.getAttribute('data-id');
      const reservation = reservationsRef.current.find(r => r.id === reservationId);
      if (!reservation) return;

      if (btn.classList.contains('edit-btn')) {
        if (!permsRef.current.canEdit) return
        // Open detail sheet in edit mode
        setSelectedReservation(reservation);
        setSheetMode('edit')
        setIsDetailSheetOpen(true);
      } else if (btn.classList.contains('disable-btn')) {
        if (!permsRef.current.canDisable) return
        setDisablingReservation(reservation)
        setIsConfirmDisableOpen(true)
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
        const reservation = reservationsRef.current[rowIndex];
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
      if (style.parentElement) style.parentElement.removeChild(style);
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
            ${perms.canEdit ? `
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
            ` : ''}
            ${perms.canDisable ? `
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
            ` : ''}
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
          onClick={() => perms.canViewDownload ? exportToExcel() : null}
          className={`inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${perms.canViewDownload ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-gray-300 cursor-not-allowed'}`}
          disabled={!perms.canViewDownload}
          title={perms.canViewDownload ? 'Export to Excel' : 'You do not have permission to download/export'}
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

  {/* Removed edit & confirmation dialogs */}

      {/* Confirm Disable Dialog */}
      <Dialog open={isConfirmDisableOpen} onOpenChange={setIsConfirmDisableOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Disable</DialogTitle>
            <DialogDescription>
              Are you sure you want to disable this reservation record?
            </DialogDescription>
          </DialogHeader>
          {disablingReservation && (
            <div className="py-4 space-y-2 text-sm text-gray-700">
              <p><strong>Reservation ID:</strong> {disablingReservation.id}</p>
              <p><strong>Booking ID:</strong> {disablingReservation.bookingId}</p>
              <p><strong>Name:</strong> {disablingReservation.fullName}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={cancelDisable}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDisable}>Yes, Disable</Button>
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
                        {sheetMode === 'edit' ? (
                          <Input className="mt-1" value={editForm?.fullName || ''} onChange={(e)=>handleEditChange('fullName', e.target.value)} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                            <span className="text-sm text-gray-900">{selectedReservation.fullName}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Phone</Label>
                        {sheetMode === 'edit' ? (
                          <Input className="mt-1" value={editForm?.phone || ''} onChange={(e)=>handleEditChange('phone', e.target.value)} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                            <span className="text-sm text-gray-900">{selectedReservation.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Email</Label>
                        {sheetMode === 'edit' ? (
                          <Input className="mt-1" value={editForm?.email || ''} onChange={(e)=>handleEditChange('email', e.target.value)} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                            <span className="text-sm text-gray-900">{selectedReservation.email}</span>
                          </div>
                        )}
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
                        {sheetMode === 'edit' ? (
                          <Input className="mt-1" type="date" value={editForm?.checkIn || ''} onChange={(e)=>handleEditChange('checkIn', e.target.value)} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                            <span className="text-sm text-gray-900">{selectedReservation.checkIn}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Check Out</Label>
                        {sheetMode === 'edit' ? (
                          <Input className="mt-1" type="date" value={editForm?.checkOut || ''} onChange={(e)=>handleEditChange('checkOut', e.target.value)} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                            <span className="text-sm text-gray-900">{selectedReservation.checkOut}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">No. of Days</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                          <span className="text-sm text-gray-900">{selectedReservation.noOfDays}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Resort</Label>
                        {sheetMode === 'edit' ? (
                          <Input className="mt-1" value={editForm?.resort || ''} onChange={(e)=>handleEditChange('resort', e.target.value)} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                            <span className="text-sm text-gray-900">{selectedReservation.resort}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Guest Details */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Guests</Label>
                        {sheetMode === 'edit' ? (
                          <Input className="mt-1 text-center" type="number" value={String(editForm?.guests ?? 0)} onChange={(e)=>handleEditChange('guests', parseInt(e.target.value)||0)} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border text-center">
                            <span className="text-sm text-gray-900">{selectedReservation.guests}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Children</Label>
                        {sheetMode === 'edit' ? (
                          <Input className="mt-1 text-center" type="number" value={String(editForm?.children ?? 0)} onChange={(e)=>handleEditChange('children', parseInt(e.target.value)||0)} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border text-center">
                            <span className="text-sm text-gray-900">{selectedReservation.children}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Extra Guests</Label>
                        {sheetMode === 'edit' ? (
                          <Input className="mt-1 text-center" type="number" value={String(editForm?.extraGuests ?? 0)} onChange={(e)=>handleEditChange('extraGuests', parseInt(e.target.value)||0)} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border text-center">
                            <span className="text-sm text-gray-900">{selectedReservation.extraGuests}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Total Guests</Label>
                        <div className="mt-1 p-3 bg-blue-50 rounded-md border border-blue-200 text-center">
                          <span className="text-lg font-bold text-blue-900">{(Number(editForm?.guests||0)+Number(editForm?.children||0)+Number(editForm?.extraGuests||0))}</span>
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
                        {sheetMode === 'edit' ? (
                          <Input className="mt-1 text-center" type="number" value={String(editForm?.rooms ?? 0)} onChange={(e)=>handleEditChange('rooms', parseInt(e.target.value)||0)} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border text-center">
                            <span className="text-sm text-gray-900">{selectedReservation.rooms}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">No. of Foods</Label>
                        {sheetMode === 'edit' ? (
                          <Input className="mt-1 text-center" type="number" value={String(editForm?.noOfFoods ?? 0)} onChange={(e)=>handleEditChange('noOfFoods', parseInt(e.target.value)||0)} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border text-center">
                            <span className="text-sm text-gray-900">{selectedReservation.noOfFoods}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Room Types (comma separated)</Label>
                        {sheetMode === 'edit' ? (
                          <Input className="mt-2" value={(editForm?.roomTypes || []).join(', ')} onChange={(e)=>handleEditChange('roomTypes', e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean))} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                            <span className="text-sm text-gray-900">{selectedReservation.roomTypes.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Status Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Reservation Status</Label>
                        {sheetMode === 'edit' ? (
                          <Input className="mt-1" value={editForm?.status || ''} onChange={(e)=>handleEditChange('status', e.target.value)} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                            <span className="text-sm text-gray-900">{selectedReservation.status}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
                        {sheetMode === 'edit' ? (
                          <Input className="mt-1" value={editForm?.paymentStatus || ''} onChange={(e)=>handleEditChange('paymentStatus', e.target.value)} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                            <span className="text-sm text-gray-900">{selectedReservation.paymentStatus}</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Refund Percentage</Label>
                        {sheetMode === 'edit' ? (
                          <Input className="mt-1" value={editForm?.refundPercent || ''} onChange={(e)=>handleEditChange('refundPercent', e.target.value)} />
                        ) : (
                          <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                            <span className="text-sm text-gray-900">{selectedReservation.refundPercent}</span>
                          </div>
                        )}
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
                {sheetMode === 'view' ? (
                  <>
                    <Button 
                      onClick={() => {
                        if (!perms.canEdit) return
                        setSheetMode('edit')
                        setEditForm({ ...(selectedReservation as Reservation) })
                      }}
                      className="flex-1"
                      disabled={disabledReservations.has(selectedReservation.id) || !perms.canEdit}
                      title={!perms.canEdit ? 'You do not have permission to edit' : undefined}
                    >
                      Edit Reservation
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        if (!perms.canDisable) return
                        setIsDetailSheetOpen(false)
                        setDisablingReservation(selectedReservation)
                        setIsConfirmDisableOpen(true)
                      }}
                      disabled={disabledReservations.has(selectedReservation.id) || !perms.canDisable}
                      title={!perms.canDisable ? 'You do not have permission to disable' : undefined}
                    >
                      Disable
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => { setSheetMode('view') }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={saveChanges}
                      disabled={isSaving || !perms.canEdit}
                      title={!perms.canEdit ? 'You do not have permission to update' : undefined}
                    >
                      {isSaving ? 'Saving...' : 'Update'}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
