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

import Amenitydata from "./amenitydata.json";
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

interface Amenity {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

const amenities: Amenity[] = Amenitydata;

export default function AllRoomAmenitiesTable() {
  const tableRef = useRef(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmDisableOpen, setIsConfirmDisableOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [disablingAmenity, setDisablingAmenity] = useState<Amenity | null>(null);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [disabledAmenities, setDisabledAmenities] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Partial<Amenity>>({});

  const handleEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setFormData({ ...amenity });
    setIsEditOpen(true);
  };

  const handleDisable = (amenity: Amenity) => {
    setDisablingAmenity(amenity);
    setIsConfirmDisableOpen(true);
  };

  const handleRowClick = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setIsDetailSheetOpen(true);
  };

  const confirmDisable = () => {
    if (disablingAmenity) {
      // Here you would typically make an API call to disable/hide the amenity
      console.log('Disabling amenity:', disablingAmenity.id);
      
      // Add the amenity to the disabled list for visual feedback
      setDisabledAmenities(prev => new Set([...prev, disablingAmenity.id]));
      
      setIsConfirmDisableOpen(false);
      setDisablingAmenity(null);
    }
  };

  const cancelDisable = () => {
    setIsConfirmDisableOpen(false);
    setDisablingAmenity(null);
  };

  const handleUpdate = () => {
    if (editingAmenity && formData) {
      console.log('Updating amenity:', formData);
      setIsEditOpen(false);
      setEditingAmenity(null);
      setFormData({});
    }
  };

  const handleCancel = () => {
    setIsEditOpen(false);
    setEditingAmenity(null);
    setFormData({});
  };

  const handleInputChange = (field: keyof Amenity, value: string | boolean) => {
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
      const amenityId = target.getAttribute('data-id') || target.closest('button')?.getAttribute('data-id');
      const amenity = amenities.find(a => a.id === amenityId);
      
      if (amenity) {
        // Stop propagation to prevent row click when button is clicked
        event.stopPropagation();
        
        if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
          handleEdit(amenity);
        } else if (target.classList.contains('disable-btn') || target.closest('.disable-btn')) {
          handleDisable(amenity);
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
        const amenity = amenities[rowIndex];
        if (amenity) {
          handleRowClick(amenity);
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
    { data: "name", title: "Amenity Name" },
    {
      data: "description",
      title: "Description",
      render: (data: string) =>
        `<div style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${data || ""}">
          ${data || ""}
        </div>`,
    },
    {
      data: "isActive",
      title: "Status",
      render: (data: boolean) => `
        <span style="padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: 500; 
        color: ${data ? "#15803d" : "#b91c1c"};
        background-color: ${data ? "#dcfce7" : "#fee2e2"};">
          ${data ? "Active" : "Inactive"}
        </span>`,
    },
    {
      data: null,
      title: "Actions",
      orderable: false,
      searchable: false,
      render: (_data: any, _type: any, row: Amenity) => {
        const isDisabled = disabledAmenities.has(row.id);
        return `
          <div style="display: flex; gap: 8px; align-items: center;">
            <button 
              class="edit-btn" 
              data-id="${row.id}" 
              title="Edit Amenity"
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
    <div className="flex flex-col h-full max-h-screen overflow-hidden py-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 flex-shrink-0">Room Amenities</h2>
      <div ref={tableRef} className="flex-1 overflow-hidden">
        <DataTable
          data={amenities}
          columns={columns}
          className="display nowrap w-full border border-gray-400"
          options={{
            pageLength: 10,
            lengthMenu: [5, 10, 25, 50],
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
              },
            ],
            columnControl: ["order", ["orderAsc", "orderDesc", "spacer", "search"]],
            rowCallback: (row: any, data: any) => {
              if (disabledAmenities.has(data.id)) {
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
            <DialogTitle>Edit Room Amenity</DialogTitle>
            <DialogDescription>
              Make changes to the room amenity details below.
            </DialogDescription>
          </DialogHeader>
          
          {formData && (
            <div className="grid grid-cols-1 gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Amenity Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Optional description"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="isActive">Status</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive || false}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
                    Active
                  </label>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="id">Amenity ID</Label>
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
              Are you sure you want to disable this room amenity? This action will hide the record from the database.
            </DialogDescription>
          </DialogHeader>
          
          {disablingAmenity && (
            <div className="py-4">
              <p className="text-sm text-gray-600">
                <strong>Amenity ID:</strong> {disablingAmenity.id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {disablingAmenity.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Status:</strong> {disablingAmenity.isActive ? 'Active' : 'Inactive'}
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

      {/* Amenity Details Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[600px] lg:w-[800px] flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Amenity Details</SheetTitle>
            <SheetDescription>
              Complete information about the selected room amenity
            </SheetDescription>
          </SheetHeader>
          
          {selectedAmenity && (
            <>
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Amenity ID</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                      <span className="text-sm text-gray-900">{selectedAmenity.id}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Amenity Name</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                      <span className="text-sm text-gray-900">{selectedAmenity.name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border min-h-[80px]">
                      <span className="text-sm text-gray-900">
                        {selectedAmenity.description || "No description provided"}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <div className="mt-1">
                      <Badge 
                        variant={selectedAmenity.isActive ? "default" : "destructive"}
                        className="px-2 py-1"
                      >
                        {selectedAmenity.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Record Status</Label>
                    <div className="mt-1">
                      <Badge 
                        variant={disabledAmenities.has(selectedAmenity.id) ? "destructive" : "default"}
                        className="px-2 py-1"
                      >
                        {disabledAmenities.has(selectedAmenity.id) ? "Disabled" : "Enabled"}
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
                    handleEdit(selectedAmenity);
                  }}
                  className="flex-1"
                  disabled={disabledAmenities.has(selectedAmenity.id)}
                >
                  Edit Amenity
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setIsDetailSheetOpen(false);
                    handleDisable(selectedAmenity);
                  }}
                  disabled={disabledAmenities.has(selectedAmenity.id)}
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
