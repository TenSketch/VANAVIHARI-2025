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

import { useEffect, useRef, useState } from "react";

DataTable.use(DT);

interface ApiRoom {
  _id: string;
  roomNumber?: string;
  roomId?: string;
  status?: string;
  price?: number;
  resort?: any;
  cottageType?: any;
  images?: Array<{ url?: string }>;
  createdAt?: string;
}

export default function RoomsTable() {
  const tableRef = useRef(null);
  const [roomsData, setRoomsData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
    setLoading(true);
    fetch(apiBase + "/api/rooms")
      .then(async (res) => {
        const text = await res.text();
        try {
          return text ? JSON.parse(text) : null;
        } catch {
          return null;
        }
      })
      .then((data) => {
        if (!data || !Array.isArray(data.rooms)) {
          throw new Error("Invalid response from server")
        }

        const mapped = data.rooms.map((r: ApiRoom) => ({
          id: r._id,
          // Resort model uses `resortName`; fallback to `name` or raw value
          resort: r.resort?.resortName || r.resort?.name || r.resort || "-",
          cottageType: r.cottageType?.name || r.cottageType || "-",
          roomId: r.roomId || r.roomNumber || "-",
          roomName: (r as any).roomName || "",
          roomImage: r.images && r.images.length ? r.images[0].url : "/img/peacock/img-1.jpg",
          price: r.price || 0,
          status: r.status || "available",
          createdAt: r.createdAt || "",
        }));

        setRoomsData(mapped);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to load rooms");
      })
      .finally(() => setLoading(false));
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
      render: (data: string, _type: string, row: any) =>
        `<img src="${data}" alt="${row.roomName || row.roomId}" 
              style="width: 64px; height: 48px; object-fit: cover; border-radius: 4px;" />`,
    },
    {
      data: "price",
      title: "Price",
      render: (data: number) => `₹${(data || 0).toLocaleString()}`,
    },
    { data: "status", title: "Status" },
    { data: "createdAt", title: "Created At" },
  ];

  return (
    <div className="p-3 w-full max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Rooms Table</h2>
      </div>

      <div ref={tableRef} className="w-full">
        {loading && <div className="p-4">Loading rooms...</div>}
        {error && <div className="p-4 text-red-600">Error: {error}</div>}
        {!loading && !error && (
          <DataTable
            data={roomsData}
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
            }}
          />
        )}
      </div>
    </div>
  );
}
