import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";

// Required plugins
import "datatables.net-buttons";
import "datatables.net-buttons/js/buttons.colVis.js";
import "datatables.net-columncontrol-dt";

// Styles
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";
import "datatables.net-columncontrol-dt/css/columnControl.dataTables.css";

import "datatables.net-fixedcolumns";
import "datatables.net-fixedcolumns-dt/css/fixedColumns.dataTables.css";

import AllRoomTypes from "./allrooms.json";
import { useEffect, useRef, useState } from "react";
import { usePermissions } from '@/lib/AdminProvider'
// Removed Dialog imports (edit & confirm modals eliminated)
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
// Removed Input import (no inline edit modal now)
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

DataTable.use(DT);

interface Room {
  id: string;
  _id?: string; // backend mongo id (if data loaded from API)
  resort: string;
  cottageType: string;
  roomId: string;
  roomName: string;
  roomImage: string;
  weekdayRate: number;
  weekendRate: number;
  guests: number;
  extraGuests: number;
  bedChargeWeekday: number;
  bedChargeWeekend: number;
}

// Seed static rooms until API loads
const staticSeedRooms: Room[] = AllRoomTypes as any;

export default function RoomsTable() {
  const tableRef = useRef(null);
  const perms = usePermissions()
  const permsRef = useRef(perms)
  // Removed separate edit & confirm disable dialogs
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'view'|'edit'>('view')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [disabledRooms, setDisabledRooms] = useState<Set<string>>(new Set());
  const [roomsData, setRoomsData] = useState<Room[]>(staticSeedRooms);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);
  // keep a ref to always have latest rooms list for event listeners
  const roomsDataRef = useRef<Room[]>(roomsData);
  useEffect(() => { roomsDataRef.current = roomsData; }, [roomsData]);
  useEffect(() => { permsRef.current = perms }, [perms])
  const [editData, setEditData] = useState<Partial<Room>>({});
  const [saving, setSaving] = useState(false);
  const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
  
  const handleEdit = (room: Room) => {
    if (!permsRef.current.canEdit) return
    setSelectedRoom(room);
    setEditData({ ...room });
    setSheetMode('edit')
    setIsDetailSheetOpen(true);
  };

  const handleDisable = (room: Room) => {
    if (!permsRef.current.canDisable) return
    // Directly disable without confirmation modal
    setDisabledRooms(prev => new Set([...prev, room.id]));
  };

  const handleRowClick = (room: Room) => {
    setSelectedRoom(room);
    setIsDetailSheetOpen(true);
    setEditData({ ...room });
    setSheetMode('view')
  };

  const handleFieldChange = (field: keyof Room, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!permsRef.current.canEdit) return
    if (!selectedRoom) return;
    if (!selectedRoom._id) {
      alert('This room exists only in static seed data. Create it in backend first to enable saving.');
      return;
    }
    const idForApi = selectedRoom._id; // use real Mongo _id
    const payload: any = {
      roomName: editData.roomName ?? '',
      roomId: editData.roomId ?? '',
  weekdayRate: editData.weekdayRate ?? undefined,
  weekendRate: editData.weekendRate ?? undefined,
  guests: editData.guests ?? undefined,
  extraGuests: editData.extraGuests ?? undefined,
  bedChargeWeekday: editData.bedChargeWeekday ?? undefined,
  bedChargeWeekend: editData.bedChargeWeekend ?? undefined,
    };
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token')
      const res = await fetch(`${apiBase}/api/rooms/${idForApi}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error((data && data.error) || res.statusText);
      // Update local selectedRoom & editData
      if (data && data.room) {
        const srv = data.room;
        // map server room back to UI shape (keep existing resort / cottageType display strings if server returns ids)
        const mapped: Partial<Room> = {
          _id: srv._id,
          roomId: srv.roomId || srv.roomNumber || selectedRoom.roomId,
          roomName: srv.roomName || selectedRoom.roomName,
          weekdayRate: srv.weekdayRate ?? selectedRoom.weekdayRate,
          weekendRate: srv.weekendRate ?? selectedRoom.weekendRate,
          guests: srv.guests ?? selectedRoom.guests,
          extraGuests: srv.extraGuests ?? selectedRoom.extraGuests,
          bedChargeWeekday: srv.bedChargeWeekday ?? selectedRoom.bedChargeWeekday,
          bedChargeWeekend: srv.bedChargeWeekend ?? selectedRoom.bedChargeWeekend,
        };
        setSelectedRoom(prev => prev ? { ...prev, ...mapped } : prev);
        setEditData(prev => ({ ...prev, ...mapped }));
        // update DataTable data array
        setRoomsData(prev => prev.map(r => (r._id === srv._id ? { ...r, ...mapped } as Room : r)));
      }
      alert('Saved');
      setSheetMode('view')
    } catch (e: any) {
      console.error(e);
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // Removed update/cancel/confirmation & form handlers

  useEffect(() => {
    // fetch real rooms
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/rooms`);
        const data = await res.json().catch(() => null);
        if (res.ok && data && Array.isArray(data.rooms)) {
          const mapped: Room[] = data.rooms.map((r: any, idx: number) => ({
            id: r._id || String(idx + 1),
            _id: r._id,
            resort: (r.resort && (r.resort.resortName || r.resort.name)) || r.resortName || '—',
            cottageType: (r.cottageType && r.cottageType.name) || r.cottageTypeName || '—',
            roomId: r.roomId || r.roomNumber || '',
            roomName: r.roomName || r.roomNumber || r.roomId || `Room ${idx + 1}`,
            roomImage: (r.images && r.images[0] && r.images[0].url) || '/img/placeholder.jpg',
            weekdayRate: r.weekdayRate || r.price || 0,
            weekendRate: r.weekendRate || r.price || 0,
            guests: r.guests || r.noOfGuests || 0,
            extraGuests: r.extraGuests || 0,
            bedChargeWeekday: r.bedChargeWeekday || r.chargesPerBedWeekDays || 0,
            bedChargeWeekend: r.bedChargeWeekend || r.chargesPerBedWeekEnd || 0,
          }));
          setRoomsData(mapped);
        }
      } catch (e) {
        console.warn('Failed to load rooms; using static data');
      } finally {
        setLoadingRooms(false);
      }
    })();
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
        max-height: 400px !important;
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
      /* Bold table headers */
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
      const roomId = target.getAttribute('data-id') || target.closest('button')?.getAttribute('data-id');
      const room = roomsDataRef.current.find(r => r.id === roomId);
      
      if (room) {
        // Stop propagation to prevent row click when button is clicked
        event.stopPropagation();
        
        if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
          if (!permsRef.current.canEdit) return
          handleEdit(room);
        } else if (target.classList.contains('disable-btn') || target.closest('.disable-btn')) {
          if (!permsRef.current.canDisable) return
          handleDisable(room);
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
        const room = roomsDataRef.current[rowIndex];
        if (room) {
          handleRowClick(room);
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
  { data: "id", title: "ID" },
    { data: "resort", title: "Resort" },
    { data: "cottageType", title: "Cottage Type" },
    { data: "roomId", title: "Room ID" },
    { data: "roomName", title: "Room Name" },
    {
      data: "roomImage",
      title: "Room Image",
      render: (data: string, _type: string, row: Room) =>
        `<img src="${data}" alt="${row.roomName}" 
              style="width: 64px; height: 48px; object-fit: cover; border-radius: 4px;" />`,
    },
    {
      data: "weekdayRate",
      title: "Weekday Rate",
      render: (data: number) => `₹${data.toLocaleString()}`,
    },
    {
      data: "weekendRate",
      title: "Weekend Rate",
      render: (data: number) => `₹${data.toLocaleString()}`,
    },
    { data: "guests", title: "Guests" },
    { data: "extraGuests", title: "Extra Guests" },
    {
      data: "bedChargeWeekday",
      title: "Bed Charge (WD)",
      render: (data: number) => `₹${data.toLocaleString()}`,
    },
    {
      data: "bedChargeWeekend",
      title: "Bed Charge (WE)",
      render: (data: number) => `₹${data.toLocaleString()}`,
    },
    {
      data: null,
      title: "Actions",
      orderable: false,
      searchable: false,
      render: (_data: any, _type: any, row: Room) => {
        const isDisabled = disabledRooms.has(row.id);
        return `
          <div style="display: flex; gap: 8px; align-items: center;">
            ${perms.canEdit ? `
            <button 
              class="edit-btn" 
              data-id="${row.id}" 
              title="Edit Room"
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
            </button>` : ''}
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
            </button>` : ''}
          </div>
        `;
      },
    },
  ];

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Rooms Table</h2>
      </div>

      <div ref={tableRef} className="w-full">
  {loadingRooms && <div className="p-4 text-sm text-gray-500">Loading rooms...</div>}
  <DataTable
          data={roomsData}
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
              if (disabledRooms.has(data.id)) {
                row.classList.add('disabled-row');
              } else {
                row.classList.remove('disabled-row');
              }
              return row;
            },
          }}
        />
      </div>

      {/* Room Details Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[700px] lg:w-[800px] flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Room Details</SheetTitle>
            <SheetDescription>
              Complete information about the selected room
            </SheetDescription>
          </SheetHeader>
          
          {selectedRoom && (
            <>
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Room ID</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                      <span className="text-sm text-gray-900">{selectedRoom.id}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Room Name</Label>
                    <input
                      className="mt-1 w-full p-2 bg-white rounded-md border text-sm"
                      value={editData.roomName || ''}
                      onChange={(e) => handleFieldChange('roomName', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Resort</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                      <span className="text-sm text-gray-900">{selectedRoom.resort}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Cottage Type</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                      <span className="text-sm text-gray-900">{selectedRoom.cottageType}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Room Image</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                      <img 
                        src={selectedRoom.roomImage} 
                        alt={selectedRoom.roomName}
                        className="w-full h-48 object-cover rounded-md"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Image editing not yet supported.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Weekday Rate</Label>
                      <input
                        type="number"
                        className="mt-1 w-full p-2 bg-white rounded-md border text-sm"
                        value={editData.weekdayRate ?? ''}
                        onChange={(e) => handleFieldChange('weekdayRate', Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Weekend Rate</Label>
                      <input
                        type="number"
                        className="mt-1 w-full p-2 bg-white rounded-md border text-sm"
                        value={editData.weekendRate ?? ''}
                        onChange={(e) => handleFieldChange('weekendRate', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Guests</Label>
                      <input
                        type="number"
                        className="mt-1 w-full p-2 bg-white rounded-md border text-sm"
                        value={editData.guests ?? ''}
                        onChange={(e) => handleFieldChange('guests', Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Extra Guests</Label>
                      <input
                        type="number"
                        className="mt-1 w-full p-2 bg-white rounded-md border text-sm"
                        value={editData.extraGuests ?? ''}
                        onChange={(e) => handleFieldChange('extraGuests', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Bed Charge (Weekday)</Label>
                      <input
                        type="number"
                        className="mt-1 w-full p-2 bg-white rounded-md border text-sm"
                        value={editData.bedChargeWeekday ?? ''}
                        onChange={(e) => handleFieldChange('bedChargeWeekday', Number(e.target.value))}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Bed Charge (Weekend)</Label>
                      <input
                        type="number"
                        className="mt-1 w-full p-2 bg-white rounded-md border text-sm"
                        value={editData.bedChargeWeekend ?? ''}
                        onChange={(e) => handleFieldChange('bedChargeWeekend', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <div className="mt-1">
                      <Badge 
                        variant={disabledRooms.has(selectedRoom.id) ? "destructive" : "default"}
                        className="px-2 py-1"
                      >
                        {disabledRooms.has(selectedRoom.id) ? "Disabled" : "Active"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Fixed Action Buttons */}
              <div className="flex-shrink-0 flex gap-3 justify-end p-6 pt-4 border-t bg-white">
                {sheetMode === 'view' ? (
                  <>
                    <Button
                      onClick={() => { if (!perms.canEdit) return; setSheetMode('edit') }}
                      disabled={!perms.canEdit}
                      title={!perms.canEdit ? 'You do not have permission to edit' : undefined}
                    >
                      Edit Room
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => { if (!perms.canDisable) return; handleDisable(selectedRoom) }}
                      disabled={disabledRooms.has(selectedRoom.id) || !perms.canDisable}
                      title={!perms.canDisable ? 'You do not have permission to disable' : undefined}
                    >
                      {disabledRooms.has(selectedRoom.id) ? 'Disabled' : 'Disable'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsDetailSheetOpen(false)} disabled={saving}>Close</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setSheetMode('view')} disabled={saving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving || !perms.canEdit} title={!perms.canEdit ? 'You do not have permission to update' : undefined}>
                      {saving ? 'Saving...' : 'Update'}
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
