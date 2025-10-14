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
import { usePermissions } from '@/lib/AdminProvider'
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

interface TentSpot {
  id: string;
  sno: number;
  spotName: string;
  location: string;
  contactPerson: string;
  contactNo: string;
  email: string;
  rules: string;
  accommodation: string;
  foodAvailable: string;
  kidsStay: string;
  womenStay: string;
  checkIn: string;
  checkOut: string;
  isActive: boolean;
}

export default function AllTentSpotsTable() {
  const tableRef = useRef(null);
  const perms = usePermissions()
  const permsRef = useRef(perms)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'view'|'edit'>('view')
  const [selectedSpot, setSelectedSpot] = useState<TentSpot | null>(null);
  const [tentSpots, setTentSpots] = useState<TentSpot[]>([]);
  const tentSpotsRef = useRef<TentSpot[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Editable fields
  const [editSpotName, setEditSpotName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editContactPerson, setEditContactPerson] = useState("");
  const [editContactNo, setEditContactNo] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRules, setEditRules] = useState("");
  const [editAccommodation, setEditAccommodation] = useState("");
  const [editFoodAvailable, setEditFoodAvailable] = useState("");
  const [editKidsStay, setEditKidsStay] = useState("");
  const [editWomenStay, setEditWomenStay] = useState("");
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");

  // Fetch tent spots from backend
  useEffect(() => {
    const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
    const fetchTentSpots = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${apiBase}/api/tent-spots`);
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || `Failed to fetch tent spots (status ${res.status})`);
        }
        const data = await res.json();
        const list = Array.isArray(data.tentSpots) ? data.tentSpots : [];
        const mapped = list.map((t: any, idx: number) => ({
          id: t._id,
          sno: idx + 1,
          spotName: t.spotName || '',
          location: t.location || '',
          contactPerson: t.contactPerson || '',
          contactNo: t.contactNo || '',
          email: t.email || '',
          rules: t.rules || '',
          accommodation: t.accommodation || '',
          foodAvailable: t.foodAvailable || '',
          kidsStay: t.kidsStay || '',
          womenStay: t.womenStay || '',
          checkIn: t.checkIn || '',
          checkOut: t.checkOut || '',
          isActive: !t.isDisabled,
        }));
        setTentSpots(mapped);
      } catch (err: any) {
        console.error('Failed to load tent spots', err);
        setLoadError(err.message || 'Failed to load tent spots');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTentSpots();
  }, []);

  useEffect(()=>{ tentSpotsRef.current = tentSpots }, [tentSpots])
  useEffect(()=>{ permsRef.current = perms }, [perms])

  const openForView = (spot: TentSpot) => {
    setSelectedSpot(spot);
    setEditSpotName(spot.spotName);
    setEditLocation(spot.location);
    setEditContactPerson(spot.contactPerson);
    setEditContactNo(spot.contactNo);
    setEditEmail(spot.email);
    setEditRules(spot.rules);
    setEditAccommodation(spot.accommodation);
    setEditFoodAvailable(spot.foodAvailable);
    setEditKidsStay(spot.kidsStay);
    setEditWomenStay(spot.womenStay);
    setEditCheckIn(spot.checkIn);
    setEditCheckOut(spot.checkOut);
    setSheetMode('view')
    setIsDetailSheetOpen(true);
  };

  const handleEdit = (spot: TentSpot) => {
    if (!permsRef.current.canEdit) return
    openForView(spot)
    setSheetMode('edit')
  };

  const toggleActiveStatus = (spot: TentSpot) => {
    if (!permsRef.current.canDisable) return
    setTentSpots((prev) =>
      prev.map((t) =>
        t.id === spot.id ? { ...t, isActive: !t.isActive } : t
      )
    );
    if (selectedSpot && selectedSpot.id === spot.id) {
      setSelectedSpot({ ...spot, isActive: !spot.isActive });
    }
  };

  const columns = [
    { data: "sno", title: "S.No" },
    { data: "spotName", title: "Tent Spot Name" },
    {
      data: "location",
      title: "Location & Map",
      render: (data: string) => `<div class="dt-ellipsis" title="${data}">${data}</div>`,
    },
    { data: "contactPerson", title: "Contact Person" },
    { data: "contactNo", title: "Contact No." },
    { data: "email", title: "Email" },
    {
      data: "rules",
      title: "Rules",
      render: (data: string) =>
        `<div class="dt-ellipsis" title="${data}">${String(data).replace(/\n/g, ' ')}</div>`,
    },
    { data: "accommodation", title: "Accommodation (Gender)" },
    { data: "foodAvailable", title: "Food" },
    { data: "kidsStay", title: "Kids Stay" },
    { data: "womenStay", title: "Women Stay" },
    { data: "checkIn", title: "Check-in Time" },
    { data: "checkOut", title: "Check-out Time" },
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
      render: (_data: any, _type: any, row: TentSpot) => {
        const isDisabled = !row.isActive;
        return `
          <div style="display: flex; gap: 8px; align-items: center;">
            ${perms.canEdit ? `
            <button 
              class="edit-btn" 
              data-id="${row.id}"
              style="background: #3b82f6; color: white; border: none; padding: 6px 12px;
                border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;"
              title="Edit Tent Spot"
            >
              Edit
            </button>` : ''}
            ${perms.canDisable ? `
            <button 
              class="disable-btn" 
              data-id="${row.id}"
              style="background: ${isDisabled ? "#6b7280" : "#dc2626"}; color: white;
                border: none; padding: 6px 12px; border-radius: 6px;
                font-size: 12px; font-weight: 500; cursor: ${isDisabled ? 'not-allowed' : 'pointer'};"
              ${isDisabled ? 'disabled' : ''}
              title="${isDisabled ? 'Already inactive' : 'Deactivate'}"
            >
              ${isDisabled ? "Inactive" : "Deactivate"}
            </button>` : ''}
          </div>
        `;
      },
    },
  ];

  // Handle button clicks in table
  useEffect(() => {
    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button') as HTMLElement | null
      if (button?.classList.contains('edit-btn') || button?.classList.contains('disable-btn')) {
        event.stopPropagation()
        const spotId = button.getAttribute('data-id') || ''
        const spot = tentSpotsRef.current.find(t => t.id === spotId)
        if (!spot) return
        if (button.classList.contains('edit-btn')) {
          if (!permsRef.current.canEdit) return
          handleEdit(spot)
        } else if (button.classList.contains('disable-btn')) {
          if (!permsRef.current.canDisable) return
          toggleActiveStatus(spot)
        }
        return
      }

      // Row click opens view-only detail
      const row = target.closest('tr')
      if (row && row.parentElement?.tagName === 'TBODY') {
        const rowIndex = Array.from(row.parentElement.children).indexOf(row as any)
        const spot = tentSpotsRef.current[rowIndex]
        if (spot) openForView(spot)
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden py-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 flex-shrink-0">
        Tent Spots
      </h2>

      <div ref={tableRef} className="flex-1 overflow-hidden">
        {isLoading && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-800 mb-3">Loading tent spots...</div>
        )}
        {loadError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-md text-red-800 mb-3">{loadError}</div>
        )}
        <DataTable
          data={tentSpots}
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
                  appendTo: "body",
                },
              },
            ],
            columnControl: ["order"],
            columnDefs: [
              { targets: 0, width: '50px', className: 'dt-center' }, // S.No
              { targets: 1, width: '180px' }, // Spot Name
              { targets: 2, width: '260px' }, // Location
              { targets: 3, width: '140px' }, // Contact Person
              { targets: 4, width: '120px' }, // Contact No
              { targets: 5, width: '180px' }, // Email
              { targets: 6, width: '320px' }, // Rules
              { targets: 7, width: '160px' }, // Accommodation
              { targets: 8, width: '80px' }, // Food
              { targets: 9, width: '90px' }, // Kids
              { targets: 10, width: '110px' }, // Women
              { targets: 11, width: '110px' }, // Check-in
              { targets: 12, width: '110px' }, // Check-out
              { targets: 13, width: '100px' }, // Status
              { targets: 14, width: '180px', orderable: false, searchable: false }, // Actions
              { targets: '_all', visible: true },
            ],
          }}
        />
      </div>

      {/* small style for truncation/ellipsis */}
      <style>{`
        .dt-ellipsis{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block}
        .dt-center{text-align:center}
      `}</style>

      {/* Detail Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[600px] lg:w-[800px] flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Tent Spot Details</SheetTitle>
            <SheetDescription>
              Complete information about the selected tent spot
            </SheetDescription>
          </SheetHeader>

          {selectedSpot && (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <Label>S.No</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  {selectedSpot.sno}
                </div>

                <div>
                  <Label>Spot Name</Label>
                  {sheetMode === 'edit' ? (
                    <Input value={editSpotName} onChange={(e) => setEditSpotName(e.target.value)} />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedSpot.spotName}</div>
                  )}
                </div>

                <div>
                  <Label>Location & Map</Label>
                  {sheetMode === 'edit' ? (
                    <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedSpot.location}</div>
                  )}
                </div>

                <div>
                  <Label>Contact Person</Label>
                  {sheetMode === 'edit' ? (
                    <Input value={editContactPerson} onChange={(e) => setEditContactPerson(e.target.value)} />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedSpot.contactPerson}</div>
                  )}
                </div>

                <div>
                  <Label>Contact No</Label>
                  {sheetMode === 'edit' ? (
                    <Input value={editContactNo} onChange={(e) => setEditContactNo(e.target.value)} />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedSpot.contactNo}</div>
                  )}
                </div>

                <div>
                  <Label>Email</Label>
                  {sheetMode === 'edit' ? (
                    <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedSpot.email}</div>
                  )}
                </div>

                <div>
                  <Label>Rules</Label>
                  {sheetMode === 'edit' ? (
                    <textarea rows={4} value={editRules} onChange={(e) => setEditRules(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-slate-50" />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border whitespace-pre-wrap">{selectedSpot.rules}</div>
                  )}
                </div>

                <div>
                  <Label>Accommodation</Label>
                  {sheetMode === 'edit' ? (
                    <Input value={editAccommodation} onChange={(e) => setEditAccommodation(e.target.value)} />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedSpot.accommodation}</div>
                  )}
                </div>

                <div>
                  <Label>Food Availability</Label>
                  {sheetMode === 'edit' ? (
                    <Input value={editFoodAvailable} onChange={(e) => setEditFoodAvailable(e.target.value)} />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedSpot.foodAvailable}</div>
                  )}
                </div>

                <div>
                  <Label>Kids Stay</Label>
                  {sheetMode === 'edit' ? (
                    <Input value={editKidsStay} onChange={(e) => setEditKidsStay(e.target.value)} />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedSpot.kidsStay}</div>
                  )}
                </div>

                <div>
                  <Label>Women Stay</Label>
                  {sheetMode === 'edit' ? (
                    <Input value={editWomenStay} onChange={(e) => setEditWomenStay(e.target.value)} />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedSpot.womenStay}</div>
                  )}
                </div>

                <div>
                  <Label>Check-In</Label>
                  {sheetMode === 'edit' ? (
                    <Input value={editCheckIn} onChange={(e) => setEditCheckIn(e.target.value)} />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedSpot.checkIn}</div>
                  )}
                </div>

                <div>
                  <Label>Check-Out</Label>
                  {sheetMode === 'edit' ? (
                    <Input value={editCheckOut} onChange={(e) => setEditCheckOut(e.target.value)} />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedSpot.checkOut}</div>
                  )}
                </div>

                <div>
                  <Label>Status</Label>
                  <Badge
                    variant={selectedSpot.isActive ? "default" : "destructive"}
                  >
                    {selectedSpot.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="flex-shrink-0 flex gap-2 p-6 border-t bg-white">
                {sheetMode === 'view' ? (
                  <>
                    <Button
                      className="flex-1"
                      onClick={() => { if (!perms.canEdit) return; setSheetMode('edit') }}
                      disabled={!perms.canEdit}
                      title={!perms.canEdit ? 'You do not have permission to edit' : undefined}
                    >
                      Edit
                    </Button>
                    <Button
                      variant={selectedSpot.isActive ? "destructive" : "default"}
                      onClick={() => { if (!perms.canDisable) return; toggleActiveStatus(selectedSpot) }}
                      disabled={!perms.canDisable}
                      title={!perms.canDisable ? 'You do not have permission to change status' : undefined}
                    >
                      {selectedSpot.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsDetailSheetOpen(false)}>Close</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setSheetMode('view')}>Cancel</Button>
                    <Button
                      onClick={() => {
                        if (!perms.canEdit) return
                        setTentSpots((prev) =>
                          prev.map((t) =>
                            t.id === selectedSpot.id
                              ? {
                                  ...t,
                                  spotName: editSpotName,
                                  location: editLocation,
                                  contactPerson: editContactPerson,
                                  contactNo: editContactNo,
                                  email: editEmail,
                                  rules: editRules,
                                  accommodation: editAccommodation,
                                  foodAvailable: editFoodAvailable,
                                  kidsStay: editKidsStay,
                                  womenStay: editWomenStay,
                                  checkIn: editCheckIn,
                                  checkOut: editCheckOut,
                                }
                              : t
                          )
                        );
                        setSheetMode('view')
                        setIsDetailSheetOpen(false);
                      }}
                      disabled={!perms.canEdit}
                      title={!perms.canEdit ? 'You do not have permission to save' : undefined}
                    >
                      Save
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
