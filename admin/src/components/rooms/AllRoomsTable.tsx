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

interface Room {
  id: string;
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

const roomsData: Room[] = AllRoomTypes;

export default function RoomsTable() {
  const tableRef = useRef(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmDisableOpen, setIsConfirmDisableOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [disablingRoom, setDisablingRoom] = useState<Room | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [disabledRooms, setDisabledRooms] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Partial<Room>>({});

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({ ...room });
    setIsEditOpen(true);
  };

  const handleDisable = (room: Room) => {
    setDisablingRoom(room);
    setIsConfirmDisableOpen(true);
  };

  const handleRowClick = (room: Room) => {
    setSelectedRoom(room);
    setIsDetailSheetOpen(true);
  };

  const confirmDisable = () => {
    if (disablingRoom) {
      console.log('Disabling room:', disablingRoom.id);
      setDisabledRooms(prev => new Set([...prev, disablingRoom.id]));
      setIsConfirmDisableOpen(false);
      setDisablingRoom(null);
    }
  };

  const cancelDisable = () => {
    setIsConfirmDisableOpen(false);
    setDisablingRoom(null);
  };

  const handleUpdate = () => {
    if (editingRoom && formData) {
      console.log('Updating room:', formData);
      setIsEditOpen(false);
      setEditingRoom(null);
      setFormData({});
    }
  };

  const handleCancel = () => {
    setIsEditOpen(false);
    setEditingRoom(null);
    setFormData({});
  };

  const handleInputChange = (field: keyof Room, value: string | number) => {
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
      const room = roomsData.find(r => r.id === roomId);
      
      if (room) {
        // Stop propagation to prevent row click when button is clicked
        event.stopPropagation();
        
        if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
          handleEdit(room);
        } else if (target.classList.contains('disable-btn') || target.closest('.disable-btn')) {
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
        const room = roomsData[rowIndex];
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
        <h2 className="text-xl font-semibold text-slate-800">Rooms Table</h2>
      </div>

      <div ref={tableRef} className="w-full">
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Make changes to the room details below.
            </DialogDescription>
          </DialogHeader>
          
          {formData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  value={formData.roomName || ''}
                  onChange={(e) => handleInputChange('roomName', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  value={formData.roomId || ''}
                  onChange={(e) => handleInputChange('roomId', e.target.value)}
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
                <Label htmlFor="cottageType">Cottage Type</Label>
                <Input
                  id="cottageType"
                  value={formData.cottageType || ''}
                  onChange={(e) => handleInputChange('cottageType', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="weekdayRate">Weekday Rate</Label>
                <Input
                  id="weekdayRate"
                  type="number"
                  value={formData.weekdayRate || ''}
                  onChange={(e) => handleInputChange('weekdayRate', Number(e.target.value))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="weekendRate">Weekend Rate</Label>
                <Input
                  id="weekendRate"
                  type="number"
                  value={formData.weekendRate || ''}
                  onChange={(e) => handleInputChange('weekendRate', Number(e.target.value))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="guests">Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  value={formData.guests || ''}
                  onChange={(e) => handleInputChange('guests', Number(e.target.value))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="extraGuests">Extra Guests</Label>
                <Input
                  id="extraGuests"
                  type="number"
                  value={formData.extraGuests || ''}
                  onChange={(e) => handleInputChange('extraGuests', Number(e.target.value))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="bedChargeWeekday">Bed Charge (Weekday)</Label>
                <Input
                  id="bedChargeWeekday"
                  type="number"
                  value={formData.bedChargeWeekday || ''}
                  onChange={(e) => handleInputChange('bedChargeWeekday', Number(e.target.value))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="bedChargeWeekend">Bed Charge (Weekend)</Label>
                <Input
                  id="bedChargeWeekend"
                  type="number"
                  value={formData.bedChargeWeekend || ''}
                  onChange={(e) => handleInputChange('bedChargeWeekend', Number(e.target.value))}
                />
              </div>
              
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="roomImage">Room Image URL</Label>
                <Input
                  id="roomImage"
                  value={formData.roomImage || ''}
                  onChange={(e) => handleInputChange('roomImage', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="id">ID</Label>
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
              Are you sure you want to disable this room? This action will hide the record from the database.
            </DialogDescription>
          </DialogHeader>
          
          {disablingRoom && (
            <div className="py-4">
              <p className="text-sm text-gray-600">
                <strong>Room ID:</strong> {disablingRoom.id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {disablingRoom.roomName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Resort:</strong> {disablingRoom.resort}
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
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                      <span className="text-sm text-gray-900">{selectedRoom.roomName}</span>
                    </div>
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Weekday Rate</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm text-gray-900">₹{selectedRoom.weekdayRate.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Weekend Rate</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm text-gray-900">₹{selectedRoom.weekendRate.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Guests</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm text-gray-900">{selectedRoom.guests}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Extra Guests</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm text-gray-900">{selectedRoom.extraGuests}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Bed Charge (Weekday)</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm text-gray-900">₹{selectedRoom.bedChargeWeekday.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Bed Charge (Weekend)</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                        <span className="text-sm text-gray-900">₹{selectedRoom.bedChargeWeekend.toLocaleString()}</span>
                      </div>
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
              <div className="flex-shrink-0 flex gap-2 p-6 pt-4 border-t bg-white">
                <Button 
                  onClick={() => {
                    setIsDetailSheetOpen(false);
                    handleEdit(selectedRoom);
                  }}
                  className="flex-1"
                  disabled={disabledRooms.has(selectedRoom.id)}
                >
                  Edit Room
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setIsDetailSheetOpen(false);
                    handleDisable(selectedRoom);
                  }}
                  disabled={disabledRooms.has(selectedRoom.id)}
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
