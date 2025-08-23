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

interface CottageType {
  id: string;
  cottageName: string;
  resort: string;
  description: string;
  roomAmenities: string[];
}

// live data from backend
const useCottageTypes = () => {
  const [cottageTypes, setCottageTypes] = useState<CottageType[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000'
        const res = await fetch(apiBase + '/api/cottage-types')
        if (!res.ok) throw new Error('Failed to fetch cottage types')
        const json = await res.json()
        const list = (json && (json.cottageTypes || json.cottage_types || json.data)) || []

        const mapped = list.map((ct: any) => ({
          id: ct._id || ct.id,
          cottageName: ct.name || ct.cottageName || '',
          resort: ct.resort && (typeof ct.resort === 'string' ? ct.resort : (ct.resort.resortName || ct.resort.name || ct.resort.resortName || '')) || '',
          description: ct.description || '',
          roomAmenities: Array.isArray(ct.amenities) ? ct.amenities : (ct.roomAmenities || []),
        }))

        setCottageTypes(mapped)
      } catch (e) {
        console.warn('Could not load cottage types', e)
      }
    }

    load()
  }, [])

  return cottageTypes
}

export default function CottageDataTable() {
  const tableRef = useRef(null);
  const cottageTypes = useCottageTypes()
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmDisableOpen, setIsConfirmDisableOpen] = useState(false);
  const [editingCottage, setEditingCottage] = useState<CottageType | null>(null);
  const [disablingCottage, setDisablingCottage] = useState<CottageType | null>(null);
  const [disabledCottages, setDisabledCottages] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Partial<CottageType>>({});

  const handleEdit = (cottage: CottageType) => {
    setEditingCottage(cottage);
    setFormData({ ...cottage });
    setIsEditOpen(true);
  };

  const handleDisable = (cottage: CottageType) => {
    setDisablingCottage(cottage);
    setIsConfirmDisableOpen(true);
  };

  const confirmDisable = () => {
    if (disablingCottage) {
      console.log('Disabling cottage:', disablingCottage.id);
      setDisabledCottages(prev => new Set([...prev, disablingCottage.id]));
      
      setIsConfirmDisableOpen(false);
      setDisablingCottage(null);
    }
  };

  const cancelDisable = () => {
    setIsConfirmDisableOpen(false);
    setDisablingCottage(null);
  };

  const handleUpdate = () => {
    if (editingCottage && formData) {
      console.log('Updating cottage:', formData);
      setIsEditOpen(false);
      setEditingCottage(null);
      setFormData({});
    }
  };

  const handleCancel = () => {
    setIsEditOpen(false);
    setEditingCottage(null);
    setFormData({});
  };

  const handleInputChange = (field: keyof CottageType, value: string | string[]) => {
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
      const cottageId = target.getAttribute('data-id') || target.closest('button')?.getAttribute('data-id');
      const cottage = cottageTypes.find(c => c.id === cottageId);
      
      if (cottage) {
        if (target.classList.contains('edit-btn') || target.closest('.edit-btn')) {
          handleEdit(cottage);
        } else if (target.classList.contains('disable-btn') || target.closest('.disable-btn')) {
          handleDisable(cottage);
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
      searchable: false,
    },
    { data: "cottageName", title: "Cottage Name" },
    {
      data: "resort",
      title: "Resort",
      render: (data: string) => data.split(",")[0],
    },
    {
      data: "description",
      title: "Description",
      render: (data: string) =>
        `<div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${data}">${data}</div>`,
    },
    {
      data: "roomAmenities",
      title: "Amenities",
      render: (data: string[]) =>
        `<div style="display: flex; flex-wrap: wrap; gap: 4px;">
          ${data
            .map(
              (item) => `
                <span style="
                  background: #dbeafe;
                  color: #1e3a8a;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-size: 10px;
                  white-space: nowrap;
                  max-width: 100px;
                  overflow: hidden;
                  text-overflow: ellipsis;
                ">${item}</span>`
            )
            .join("")}
        </div>`,
    },
    {
      data: null,
      title: "Actions",
      orderable: false,
      searchable: false,
      render: (_data: any, _type: any, row: CottageType) => {
        const isDisabled = disabledCottages.has(row.id);
        return `
          <div style="display: flex; gap: 8px; align-items: center;">
            <button 
              class="edit-btn" 
              data-id="${row.id}" 
              title="Edit Cottage"
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
    <div className="flex flex-col h-full max-h-screen overflow-hidden p-3 py-8">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Cottage Types</h2>
      <div ref={tableRef} className="flex-1 overflow-hidden">
        <DataTable
          data={cottageTypes}
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
              },
            ],
            columnControl: ["order", ["orderAsc", "orderDesc", "spacer", "search"]],
            rowCallback: (row: any, data: any) => {
              if (disabledCottages.has(data.id)) {
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
            <DialogTitle>Edit Cottage Type</DialogTitle>
            <DialogDescription>
              Make changes to the cottage type details below.
            </DialogDescription>
          </DialogHeader>
          
          {formData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cottageName">Cottage Name</Label>
                <Input
                  id="cottageName"
                  value={formData.cottageName || ''}
                  onChange={(e) => handleInputChange('cottageName', e.target.value)}
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
              
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="roomAmenities">Room Amenities (comma-separated)</Label>
                <Input
                  id="roomAmenities"
                  value={formData.roomAmenities?.join(', ') || ''}
                  onChange={(e) => handleInputChange('roomAmenities', e.target.value.split(',').map(s => s.trim()))}
                  placeholder="WiFi, AC, TV, Mini Fridge"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="id">Cottage ID</Label>
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
              Are you sure you want to disable this cottage type? This action will hide the record from the database.
            </DialogDescription>
          </DialogHeader>
          
          {disablingCottage && (
            <div className="py-4">
              <p className="text-sm text-gray-600">
                <strong>Cottage ID:</strong> {disablingCottage.id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {disablingCottage.cottageName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Resort:</strong> {disablingCottage.resort}
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
