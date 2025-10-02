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
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<TentSpot | null>(null);
  const [tentSpots, setTentSpots] = useState<TentSpot[]>([]);

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

  // Dummy initial data
  useEffect(() => {
    setTentSpots([
      {
        id: "1",
        sno: 1,
        spotName: "Vanavihari",
        location: "Maredumilli",
        contactPerson: "Mrs. Anusha",
        contactNo: "9876543210",
        email: "anusha@example.com",
        rules:
          "Smoking & consumption of alcohol is strictly prohibited.\nPlease carry valid identity proof.\nTent damage will be fined.\n* No extra persons allowed.",
        accommodation: "Only men can",
        foodAvailable: "No",
        kidsStay: "No",
        womenStay: "No",
        checkIn: "10:00 AM",
        checkOut: "9:00 AM",
        isActive: true,
      },
      {
        id: "2",
        sno: 2,
        spotName: "Karthikavanam",
        location:
          "Doolapally Rd, Maisamma Gudem, Dulapally, Hyderabad, Telangana 500014",
        contactPerson: "Mrs. Anusha",
        contactNo: "9876543211",
        email: "anusha.k@example.com",
        rules:
          "Smoking & consumption of alcohol is strictly prohibited.\nPlease carry valid identity proof.\nTent damage will be fined.\n* No extra persons allowed.",
        accommodation: "Both men and women",
        foodAvailable: "No",
        kidsStay: "No",
        womenStay: "Yes",
        checkIn: "10:00 AM",
        checkOut: "9:00 AM",
        isActive: false,
      },
    ]);
  }, []);

  const handleEdit = (spot: TentSpot) => {
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
    setIsDetailSheetOpen(true);
  };

  const toggleActiveStatus = (spot: TentSpot) => {
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
      const spotId =
        target.getAttribute("data-id") ||
        target.closest("button")?.getAttribute("data-id");
      const spot = tentSpots.find((t) => t.id === spotId);

      if (spot) {
        if (target.classList.contains("edit-btn")) {
          handleEdit(spot);
        } else if (target.classList.contains("disable-btn")) {
          toggleActiveStatus(spot);
        }
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [tentSpots]);

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden py-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4 flex-shrink-0">
        Tent Spots
      </h2>

      <div ref={tableRef} className="flex-1 overflow-hidden">
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
                  <Input
                    value={editSpotName}
                    onChange={(e) => setEditSpotName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Location & Map</Label>
                  <Input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={editContactPerson}
                    onChange={(e) => setEditContactPerson(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Contact No</Label>
                  <Input
                    value={editContactNo}
                    onChange={(e) => setEditContactNo(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Rules</Label>
                  <textarea
                    rows={4}
                    value={editRules}
                    onChange={(e) => setEditRules(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-slate-50"
                  />
                </div>

                <div>
                  <Label>Accommodation</Label>
                  <Input
                    value={editAccommodation}
                    onChange={(e) => setEditAccommodation(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Food Availability</Label>
                  <Input
                    value={editFoodAvailable}
                    onChange={(e) => setEditFoodAvailable(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Kids Stay</Label>
                  <Input
                    value={editKidsStay}
                    onChange={(e) => setEditKidsStay(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Women Stay</Label>
                  <Input
                    value={editWomenStay}
                    onChange={(e) => setEditWomenStay(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Check-In</Label>
                  <Input
                    value={editCheckIn}
                    onChange={(e) => setEditCheckIn(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Check-Out</Label>
                  <Input
                    value={editCheckOut}
                    onChange={(e) => setEditCheckOut(e.target.value)}
                  />
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
                <Button
                  className="flex-1"
                  onClick={() => {
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
                    setIsDetailSheetOpen(false);
                  }}
                >
                  Save
                </Button>
                <Button
                  variant={selectedSpot.isActive ? "destructive" : "default"}
                  onClick={() => toggleActiveStatus(selectedSpot)}
                >
                  {selectedSpot.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailSheetOpen(false)}
                >
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
