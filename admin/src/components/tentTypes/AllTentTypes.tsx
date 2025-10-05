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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

DataTable.use(DT);

interface TentType {
  id: string;
  sno: number;
  tentType: string;
  dimensions: string;
  brand: string;
  features: string;
  price: number;
  amenities: string;
  isActive: boolean;
}

export default function AllTentTypesTable() {
  const tableRef = useRef(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedTent, setSelectedTent] = useState<TentType | null>(null);
  const [tentTypes, setTentTypes] = useState<TentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editTentType, setEditTentType] = useState("");
  const [editDimensions, setEditDimensions] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editFeatures, setEditFeatures] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editAmenities, setEditAmenities] = useState("");

  // Fetch tent types from backend
  useEffect(() => {
    const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
    const fetchTentTypes = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${apiBase}/api/tent-types`);
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || `Failed to fetch tent types (status ${res.status})`);
        }
        const data = await res.json();
        // Expected shape: { tentTypes: [ ... ] }
        const list = Array.isArray(data.tentTypes) ? data.tentTypes : [];
        // Map server objects to UI TentType shape
        const mapped = list.map((t: any, idx: number) => ({
          id: t._id,
          sno: idx + 1,
          tentType: t.tentType || '',
          dimensions: t.dimensions || '',
          brand: t.brand || '',
          features: t.features || '',
          price: t.pricePerDay || t.price || 0,
          amenities: Array.isArray(t.amenities) ? t.amenities.join(', ') : (t.amenities || ''),
          isActive: !t.isDisabled,
        }));
        setTentTypes(mapped);
      } catch (err: any) {
        console.error('Failed to load tent types', err);
        setLoadError(err.message || 'Failed to load tent types');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTentTypes();
  }, []);

  const handleEdit = (tent: TentType) => {
    setSelectedTent(tent);
    setEditTentType(tent.tentType);
    setEditDimensions(tent.dimensions);
    setEditBrand(tent.brand);
    setEditFeatures(tent.features);
    setEditPrice(String(tent.price));
    setEditAmenities(tent.amenities);
    setIsDetailSheetOpen(true);
  };

  const toggleActiveStatus = (tent: TentType) => {
    setTentTypes((prev) =>
      prev.map((t) =>
        t.id === tent.id ? { ...t, isActive: !t.isActive } : t
      )
    );
    if (selectedTent && selectedTent.id === tent.id) {
      setSelectedTent({ ...tent, isActive: !tent.isActive });
    }
  };

  const columns = [
    { data: "sno", title: "S.No" },
    { data: "tentType", title: "Tent Type" },
    { data: "dimensions", title: "Dimensions" },
    { data: "brand", title: "Brand" },
    {
      data: "features",
      title: "Features",
      render: (data: string) => `<div style="white-space:pre-wrap; max-width:300px">${data}</div>`,
    },
    {
      data: "price",
      title: "Price (₹)",
      render: (data: number) => `₹${data.toLocaleString()}`,
    },
    {
      data: "amenities",
      title: "Amenities",
      render: (data: string) => `<div style="white-space:pre-wrap; max-width:300px">${data}</div>`,
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
      render: (_data: any, _type: any, row: TentType) => {
        const isDisabled = !row.isActive;
        return `
          <div style="display: flex; gap: 8px; align-items: center;">
            <button 
              class="edit-btn" 
              data-id="${row.id}"
              style="background: #3b82f6; color: white; border: none; padding: 6px 12px;
                border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;"
            >
              Edit
            </button>
            <button 
              class="disable-btn" 
              data-id="${row.id}"
              style="background: ${isDisabled ? "#6b7280" : "#dc2626"}; color: white;
                border: none; padding: 6px 12px; border-radius: 6px;
                font-size: 12px; font-weight: 500; cursor: pointer;"
            >
              ${isDisabled ? "Inactive" : "Deactivate"}
            </button>
          </div>
        `;
      },
    },
  ];

  // Handle button clicks in table
  useEffect(() => {
    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const tentId =
        target.getAttribute("data-id") ||
        target.closest("button")?.getAttribute("data-id");
      const tent = tentTypes.find((t) => t.id === tentId);

      if (tent) {
        if (target.classList.contains("edit-btn")) {
          handleEdit(tent);
        } else if (target.classList.contains("disable-btn")) {
          toggleActiveStatus(tent);
        }
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [tentTypes]);

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden py-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 flex-shrink-0">
        Tent Types
      </h2>

      <div ref={tableRef} className="flex-1 overflow-hidden">
        {isLoading && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-800 mb-3">Loading tent types...</div>
        )}
        {loadError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-md text-red-800 mb-3">{loadError}</div>
        )}
          <DataTable
          data={tentTypes}
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
                collection: {
                    // 👇 this is the fix
                    appendTo: "body",
                },
                },
            ],
            columnControl: [
                "order",
            ],
            columnDefs: [
                { targets: "_all", visible: true },
            ],
            }}

        />
      </div>

      {/* Detail Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[600px] lg:w-[800px] flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Tent Details</SheetTitle>
            <SheetDescription>
              Complete information about the selected tent type
            </SheetDescription>
          </SheetHeader>

          {selectedTent && (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div>
                  <Label>S.No</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">{selectedTent.sno}</div>
                </div>

                <div>
                  <Label>Tent Type</Label>
                  <Input value={editTentType} onChange={(e) => setEditTentType(e.target.value)} />
                </div>

                <div>
                  <Label>Dimensions</Label>
                  <Input value={editDimensions} onChange={(e) => setEditDimensions(e.target.value)} />
                </div>

                <div>
                  <Label>Brand name</Label>
                  <Input value={editBrand} onChange={(e) => setEditBrand(e.target.value)} />
                </div>

                <div>
                  <Label>Features</Label>
                  <textarea rows={4} value={editFeatures} onChange={(e) => setEditFeatures(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-slate-50" />
                </div>

                <div>
                  <Label>Price</Label>
                  <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                </div>

                <div>
                  <Label>Amenities</Label>
                  <textarea rows={3} value={editAmenities} onChange={(e) => setEditAmenities(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-slate-50" />
                </div>

                <div>
                  <Label>Status</Label>
                  <Badge variant={selectedTent.isActive ? "default" : "destructive"}>{selectedTent.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              </div>

              <div className="flex-shrink-0 flex gap-2 p-6 border-t bg-white">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setTentTypes((prev) =>
                      prev.map((t) =>
                        t.id === selectedTent.id
                          ? {
                              ...t,
                              tentType: editTentType,
                              dimensions: editDimensions,
                              brand: editBrand,
                              features: editFeatures,
                              price: Number(editPrice),
                              amenities: editAmenities,
                            }
                          : t
                      )
                    );
                    setIsDetailSheetOpen(false);
                  }}
                >
                  Save
                </Button>
                <Button
                  variant={selectedTent.isActive ? "destructive" : "default"}
                  onClick={() => toggleActiveStatus(selectedTent)}
                >
                  {selectedTent.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button variant="outline" onClick={() => setIsDetailSheetOpen(false)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
