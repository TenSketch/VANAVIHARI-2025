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

interface Guest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  registrationDate: string;
  emailVerificationToken: string;
  accessToken: string;
  disabled?: boolean;
}


export default function GuestTable() {
  const tableRef = useRef(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const guestsRef = useRef<Guest[]>([]);
  // fetch guests
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_ADMIN_API || ''
    const url = apiUrl ? `${apiUrl}/api/guests` : '/api/guests'
    fetch(url).then(res => res.json()).then((data) => {
      if (data && data.success && Array.isArray(data.guests)) {
        const mapped: Guest[] = data.guests.map((g: any) => ({
          id: String(g._id || g.id || ''),
          fullName: g.fullName || '',
          phone: g.phone || '',
          email: g.email || '',
          address: [g.addressLine1, g.addressLine2, g.city, g.state, g.postalCode, g.country].filter(Boolean).join(', '),
          registrationDate: g.registrationDate ? new Date(g.registrationDate).toISOString().slice(0,10) : '',
          emailVerificationToken: '',
          accessToken: '',
          disabled: !!g.disabled,
        }))
        guestsRef.current = mapped
        setGuests(mapped)
        // initialize disabled set from data
        const initialDisabled = new Set<string>(mapped.filter(m => m.disabled).map(m => m.id))
        setDisabledGuests(initialDisabled)
      }
    }).catch(err => console.warn('Failed to load guests', err))
  }, [])

  // keep ref in sync
  useEffect(() => { guestsRef.current = guests }, [guests])

  const exportToExcel = () => {
    const headers = ["S.No","Guest ID","Full Name","Phone","Email","Address","Reg. Date"]
    const csvContent = [
      headers.join(','),
      ...guests.map((row, idx) => [
        idx + 1,
        `"${row.id}"`,
        `"${row.fullName}"`,
        `"${row.phone}"`,
        `"${row.email}"`,
        `"${(row.address||'').replace(/"/g,'""')}"`,
        `"${row.registrationDate}"`
      ].join(','))
    ].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', 'Guest_Records.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmDisableOpen, setIsConfirmDisableOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [disablingGuest, setDisablingGuest] = useState<Guest | null>(null);
  const [disabledGuests, setDisabledGuests] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Partial<Guest>>({});

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({ ...guest });
    setIsEditOpen(true);
  };

  const handleDisable = (guest: Guest) => {
    setDisablingGuest(guest);
    setIsConfirmDisableOpen(true);
  };

  const confirmDisable = () => {
    if (!disablingGuest) return;
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_ADMIN_API || ''
    const url = apiUrl ? `${apiUrl}/api/guests/${disablingGuest.id}` : `/api/guests/${disablingGuest.id}`
    fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disabled: true })
    }).then(res => res.json()).then((data) => {
      // optimistic UI update
      setDisabledGuests(prev => new Set([...Array.from(prev), disablingGuest.id]));
      setGuests(prev => prev.map(g => g.id === disablingGuest.id ? { ...g, disabled: true } : g));
      setIsConfirmDisableOpen(false);
      setDisablingGuest(null);
    }).catch(err => {
      console.warn('Failed to disable guest', err);
      setIsConfirmDisableOpen(false);
      setDisablingGuest(null);
    })
  };

  const cancelDisable = () => {
    setIsConfirmDisableOpen(false);
    setDisablingGuest(null);
  };

  const handleUpdate = () => {
    if (!editingGuest || !formData) return;
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_ADMIN_API || ''
    const url = apiUrl ? `${apiUrl}/api/guests/${editingGuest.id}` : `/api/guests/${editingGuest.id}`
    // build payload - map address into addressLine1 to keep backend simple
    const payload: any = {
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      registrationDate: formData.registrationDate,
      addressLine1: (formData.address as string) || undefined,
    }
    fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => res.json()).then((data) => {
      // update local state
      const updatedGuests = guests.map(g => g.id === editingGuest.id ? ({ ...g, ...payload }) : g)
      guestsRef.current = updatedGuests
      setGuests(updatedGuests)
      setIsEditOpen(false)
      setEditingGuest(null)
      setFormData({})
    }).catch(err => {
      console.warn('Failed to update guest', err)
      setIsEditOpen(false)
      setEditingGuest(null)
      setFormData({})
    })
  };

  const handleCancel = () => {
    setIsEditOpen(false);
    setEditingGuest(null);
    setFormData({});
  };

  const handleInputChange = (field: keyof Guest, value: string) => {
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
    `;
    document.head.appendChild(style);

    const handleButtonClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const guestId = target.getAttribute('data-id') || target.closest('button')?.getAttribute('data-id');
      const guest = guestsRef.current.find(g => g.id === guestId);
      
      if (guest) {
        if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
          handleEdit(guest);
        } else if (target.classList.contains('disable-btn') || target.closest('.disable-btn')) {
          handleDisable(guest);
        }
      }
    };

    document.addEventListener('click', handleButtonClick);

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
    <div className="flex flex-col h-full max-h-screen overflow-hidden p-3 py-6">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-slate-800">Guest Records</h2>
        <button
          onClick={exportToExcel}
          className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to Excel
        </button>
      </div>

      <div ref={tableRef} className="flex-1 overflow-hidden">
        <DataTable
          data={guests}
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
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
            <DialogDescription>
              Make changes to the guest details below.
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
    </div>
  );
}
