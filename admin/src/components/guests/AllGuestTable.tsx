import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import "datatables.net-buttons";
import "datatables.net-buttons/js/buttons.colVis.js";
import "datatables.net-columncontrol-dt";
import "datatables.net-columncontrol-dt/css/columnControl.dataTables.css";

import "datatables.net-fixedcolumns";
import "datatables.net-fixedcolumns-dt/css/fixedColumns.dataTables.css";

// Guests will be loaded from backend API (MongoDB)
import { useEffect, useRef, useState } from "react";
import { usePermissions } from '@/lib/AdminProvider'
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

interface Guest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  registrationDate: string;
  emailVerificationToken: string;
  accessToken: string;
}

// local guest list loaded from backend
const initialGuests: Guest[] = [];

const exportToExcel = (guestsParam: Guest[]) => {
  const headers = [
    "S.No",
    "Guest ID",
    "Full Name",
    "Phone",
    "Email",
    "Address",
    "Reg. Date",
    "Email Token",
    "Access Token",
  ];

  const csvContent = [
    headers.join(","),
  ...guestsParam.map((row, idx) => [
      idx + 1,
      `"${row.id}"`,
      `"${row.fullName}"`,
      `"${row.phone}"`,
      `"${row.email}"`,
      `"${row.address.replace(/"/g, '""')}"`,
      `"${row.registrationDate}"`,
      `"${row.emailVerificationToken}"`,
      `"${row.accessToken}"`
    ].join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "Guest_Records.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function GuestTable() {
  const tableRef = useRef(null);
  const perms = usePermissions()
  const permsRef = useRef(perms)
  // sheetMode toggles between viewing details and editing inside the sheet
  const [sheetMode, setSheetMode] = useState<'view' | 'edit'>('view');
  const [isConfirmDisableOpen, setIsConfirmDisableOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [disablingGuest, setDisablingGuest] = useState<Guest | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [disabledGuests, setDisabledGuests] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Partial<Guest>>({});
  const [guestsState, setGuestsState] = useState<Guest[]>(initialGuests);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guestsRef = useRef<Guest[]>(initialGuests);

  useEffect(() => {
    guestsRef.current = guestsState;
  }, [guestsState]);

  // keep perms ref up-to-date for event handlers attached to document
  useEffect(() => {
    permsRef.current = perms
  }, [perms])

  const handleEdit = (guest: Guest) => {
    // open the side sheet in edit mode
    setSelectedGuest(guest);
    setEditingGuest(guest);
    setFormData({ ...guest });
    setSheetMode('edit');
    setIsDetailSheetOpen(true);
  };

  const handleDisable = (guest: Guest) => {
    setDisablingGuest(guest);
    setIsConfirmDisableOpen(true);
  };

  const handleRowClick = (guest: Guest) => {
    // Always open in view mode when a row is clicked
    setSelectedGuest(guest);
    setEditingGuest(null);
    setSheetMode('view');
    setIsDetailSheetOpen(true);
  };

  const confirmDisable = async () => {
    if (disablingGuest) {
      try {
        const token = localStorage.getItem('admin_token')
        const headers: any = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        const response = await fetch(`/api/guests/${disablingGuest.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ disabled: true })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('Guest disabled:', disablingGuest.id);
            setDisabledGuests(prev => new Set([...prev, disablingGuest.id]));
            setIsConfirmDisableOpen(false);
            setDisablingGuest(null);
          } else {
            console.error('Disable failed:', result.error);
            alert('Failed to disable guest: ' + (result.error || 'Unknown error'));
          }
        } else {
          console.error('Disable request failed:', response.status);
          alert('Failed to disable guest. Please try again.');
        }
      } catch (err: any) {
        console.error('Disable error:', err);
        alert('Error disabling guest: ' + (err.message || 'Network error'));
      }
    }
  };

  const cancelDisable = () => {
    setIsConfirmDisableOpen(false);
    setDisablingGuest(null);
  };

  const handleUpdate = async () => {
    if (!permsRef.current.canEdit) {
      // extra guard: do nothing if user lacks edit permission
      return
    }
    if (editingGuest && formData) {
      try {
        const token = localStorage.getItem('admin_token')
        const headers: any = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`
        const response = await fetch(`/api/guests/${editingGuest.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Update local state with the updated guest
            setGuestsState(prev => prev.map(g => 
              g.id === editingGuest.id ? { ...g, ...formData } : g
            ));
            
            // Update selected guest to reflect changes in view mode
            setSelectedGuest({ ...editingGuest, ...formData } as Guest);
            
            // Close edit mode and reset
            setEditingGuest(null);
            setFormData({});
            setSheetMode('view');
          } else {
            console.error('Update failed:', result.error);
            alert('Failed to update guest: ' + (result.error || 'Unknown error'));
          }
        } else {
          console.error('Update request failed:', response.status);
          alert('Failed to update guest. Please try again.');
        }
      } catch (err: any) {
        console.error('Update error:', err);
        alert('Error updating guest: ' + (err.message || 'Network error'));
      }
    }
  };

  const handleCancel = () => {
    // cancel editing in sheet — revert form and go back to view or close
    if (selectedGuest) {
      setFormData({ ...selectedGuest });
    } else {
      setFormData({});
    }
    setEditingGuest(null);
    setSheetMode('view');
  };

  const handleInputChange = (field: keyof Guest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    // fetch guest data from backend
    const fetchGuests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('admin_token')
        const headers: any = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch('/api/guests', { headers });
        const json = await res.json();
        if (json && json.success && Array.isArray(json.guests)) {
          const mappedGuests = json.guests.map((g: any) => ({
            id: g._id || g.id,
            fullName: g.fullName || g.name || '',
            phone: g.phone || '',
            email: g.email || '',
            address: g.address || '',
            registrationDate: g.registrationDate ? new Date(g.registrationDate).toISOString().slice(0,10) : '',
            emailVerificationToken: g.emailVerificationToken || '',
            accessToken: g.accessToken || '',
          }));
          
          setGuestsState(mappedGuests);
          
          // Set disabled guests based on the disabled field from database
          const disabledIds = json.guests
            .filter((g: any) => g.disabled === true)
            .map((g: any) => g._id || g.id);
          setDisabledGuests(new Set(disabledIds));
        } else if (Array.isArray(json)) {
          const mappedGuests = json.map((g: any) => ({
            id: g._id || g.id,
            fullName: g.fullName || g.name || '',
            phone: g.phone || '',
            email: g.email || '',
            address: g.address || '',
            registrationDate: g.registrationDate ? new Date(g.registrationDate).toISOString().slice(0,10) : '',
            emailVerificationToken: g.emailVerificationToken || '',
            accessToken: g.accessToken || '',
          }));
          
          setGuestsState(mappedGuests);
          
          // Set disabled guests based on the disabled field from database
          const disabledIds = json
            .filter((g: any) => g.disabled === true)
            .map((g: any) => g._id || g.id);
          setDisabledGuests(new Set(disabledIds));
        } else {
          setError('Unexpected response from server')
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load guests')
      } finally {
        setLoading(false);
      }
    }
    fetchGuests();

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
      .dataTables_wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .dataTables_wrapper .dt-layout-row {
        flex-shrink: 0;
      }
      .dataTables_wrapper .dataTables_scroll {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      .dataTables_wrapper .dataTables_scrollHead {
        flex-shrink: 0;
        border-radius: 0.5rem 0.5rem 0 0;
        border: 1px solid #ddd;
        border-bottom: none;
        background: #f8f9fa;
      }
      .dataTables_wrapper .dataTables_scrollHeadInner {
        width: 100% !important;
      }
      .dataTables_wrapper .dataTables_scrollBody {
        flex: 1;
        overflow: auto !important;
        width: 100%;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 0.5rem 0.5rem;
        min-height: 300px;
        max-height: calc(100vh - 350px);
      }
      .dataTables_wrapper table {
        width: max-content !important;
        min-width: 100%;
        margin: 0 !important;
      }
      .dt-button-collection.dropdown-menu {
        transform: none !important;
      }
      .dataTables_wrapper .dt-buttons {
        margin-bottom: 1rem;
      }
      .dataTables_wrapper .dataTables_info,
      .dataTables_wrapper .dataTables_paginate {
        margin-top: 1rem;
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
      const guestId = target.getAttribute('data-id') || target.closest('button')?.getAttribute('data-id');
      const guest = guestsRef.current.find(g => g.id === guestId);
      
      if (guest) {
        // Stop propagation to prevent row click when button is clicked
        event.stopPropagation();
        
        if ((target.classList.contains('edit-btn') || target.closest('.edit-btn')) && permsRef.current.canEdit) {
          // double-check permission before opening edit
          handleEdit(guest);
        } else if ((target.classList.contains('disable-btn') || target.closest('.disable-btn')) && permsRef.current.canDisable) {
          handleDisable(guest);
        } else {
          // user clicked a button they lack permission for - ignore
          return;
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
        const guest = guestsRef.current[rowIndex];
        if (guest) {
          handleRowClick(guest);
        }
      }
    };

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
      render: (_data: any, _type: any, _row: any, meta: any) =>
        meta.row + 1 + meta.settings._iDisplayStart,
      orderable: false,
      searchable: false
    },
    { data: "fullName", title: "Full Name" },
    { data: "id", title: "Guest ID" },
    { data: "phone", title: "Phone" },
    { data: "email", title: "Email" },
    {
      data: "address",
      title: "Address",
      render: (data: string) =>
        `<div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${data}">${data}</div>`,
    },
    { data: "registrationDate", title: "Reg. Date" },
    { data: "emailVerificationToken", title: "Email Token" },
    { data: "accessToken", title: "Access Token" },
    {
      data: null,
      title: "Actions",
      orderable: false,
      searchable: false,
      render: (_data: any, _type: any, row: Guest) => {
        const isDisabled = disabledGuests.has(row.id);
        return `
          <div style="display: flex; gap: 8px; align-items: center;">
            ${perms.canEdit ? `
            <button 
              class="edit-btn" 
              data-id="${row.id}" 
              title="Edit Guest"
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
    <div className="flex flex-col h-full max-h-screen overflow-hidden py-6">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-slate-800">Guest Records</h2>
        <button
          onClick={() => perms.canViewDownload ? exportToExcel(guestsState) : null}
          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${perms.canViewDownload ? 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2' : 'bg-gray-200 text-gray-600 cursor-not-allowed'}`}
          disabled={loading || !perms.canViewDownload}
          title={perms.canViewDownload ? 'Export to Excel' : 'You do not have permission to download/export'}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to Excel
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading guests</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={tableRef} className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading guests...</span>
            </div>
          </div>
        ) : (
        <DataTable
          data={guestsState}
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
            scrollY: "calc(100vh - 350px)",
            scrollCollapse: true,
            layout: {
              topStart: "buttons",
              topEnd: "search",
              bottomStart: "pageLength",
              bottomEnd: "paging",
            },
            buttons: [
              {
                extend: "colvis",
                text: "Column Visibility",
                collectionLayout: "fixed two-column",
              }
            ],
            columnControl: ["order", ["orderAsc", "orderDesc", "spacer", "search"]],
            rowCallback: (row: any, data: any) => {
              if (disabledGuests.has(data.id)) {
                row.classList.add('disabled-row');
              } else {
                row.classList.remove('disabled-row');
              }
              return row;
            },
          }}
        />
        )}
      </div>

  {/* Edit Dialog removed — edit form now shown inside the Sheet when sheetMode === 'edit' */}
      {/* Confirmation Dialog for Disable Action */}
      <Dialog open={isConfirmDisableOpen} onOpenChange={setIsConfirmDisableOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Disable</DialogTitle>
            <DialogDescription>
              Are you sure you want to disable this guest record? This action will hide the record from the database.
            </DialogDescription>
          </DialogHeader>
          
          {disablingGuest && (
            <div className="py-4">
              <p className="text-sm text-gray-600">
                <strong>Guest ID:</strong> {disablingGuest.id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {disablingGuest.fullName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {disablingGuest.email}
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

      {/* Guest Details Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-[400px] sm:max-w-[600px] sm:w-[700px] lg:w-[800px] flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Guest Details</SheetTitle>
            <SheetDescription>
              Complete information about the selected guest
            </SheetDescription>
          </SheetHeader>
          
          {selectedGuest && (
            <>
              {/* Scrollable Content: either view or edit mode */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {sheetMode === 'view' ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Guest ID</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm text-gray-900">{selectedGuest.id}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm text-gray-900">{selectedGuest.fullName}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm text-gray-900">{selectedGuest.phone}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm text-gray-900">{selectedGuest.email}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Address</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border min-h-[80px]">
                        <span className="text-sm text-gray-900">{selectedGuest.address}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Registration Date</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm text-gray-900">{selectedGuest.registrationDate}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email Verification Token</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm text-gray-900 font-mono break-all">{selectedGuest.emailVerificationToken}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Access Token</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm text-gray-900 font-mono break-all">{selectedGuest.accessToken}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <div className="mt-1">
                        <Badge 
                          variant={disabledGuests.has(selectedGuest.id) ? "destructive" : "default"}
                          className="px-2 py-1"
                        >
                          {disabledGuests.has(selectedGuest.id) ? "Disabled" : "Active"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit form inside sheet
                  formData && (
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
                      <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2 md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={formData.address || ''}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="registrationDate">Registration Date</Label>
                        <Input
                          id="registrationDate"
                          type="date"
                          value={formData.registrationDate || ''}
                          onChange={(e) => handleInputChange('registrationDate', e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="id">Guest ID</Label>
                        <Input
                          id="id"
                          value={formData.id || ''}
                          onChange={(e) => handleInputChange('id', e.target.value)}
                          disabled
                          className="bg-gray-100"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Fixed Action Buttons */}
              <div className="flex-shrink-0 flex gap-2 p-6 pt-4 border-t bg-white">
                {sheetMode === 'view' ? (
                  <>
                    <Button 
                      onClick={() => {
                        if (!perms.canEdit) return
                        // switch to edit mode inside the same sheet
                        setSheetMode('edit');
                        setEditingGuest(selectedGuest);
                        setFormData({ ...selectedGuest });
                      }}
                      className="flex-1"
                      disabled={disabledGuests.has(selectedGuest.id) || !perms.canEdit}
                      title={!perms.canEdit ? 'You do not have permission to edit' : undefined}
                    >
                      Edit Guest
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        if (!perms.canDisable) return
                        setIsDetailSheetOpen(false);
                        handleDisable(selectedGuest);
                      }}
                      disabled={disabledGuests.has(selectedGuest.id) || !perms.canDisable}
                      title={!perms.canDisable ? 'You do not have permission to disable' : undefined}
                    >
                      Disable
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => { if (!perms.canEdit) return; handleUpdate(); }}
                      disabled={!perms.canEdit}
                      title={!perms.canEdit ? 'You do not have permission to update' : undefined}
                    >
                      Update
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
