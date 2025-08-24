import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import 'datatables.net-buttons-dt/css/buttons.dataTables.css';
import 'datatables.net-buttons';
import 'datatables.net-buttons/js/buttons.colVis.js';
import 'datatables.net-columncontrol-dt';
import 'datatables.net-columncontrol-dt/css/columnControl.dataTables.css';

import "datatables.net-fixedcolumns";
import "datatables.net-fixedcolumns-dt/css/fixedColumns.dataTables.css";

import { useEffect, useRef, useState } from "react";

DataTable.use(DT);

interface LogEntry {
  _id?: string;
  bookingId: string;
  username: string;
  logType: string;
  logMessage: string;
  logEntryDate: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
}

export default function LogsTable() {
  const tableRef = useRef(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch logs from API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiBase}/api/logs`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch logs: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        if (data.success && Array.isArray(data.logs)) {
          setLogs(data.logs);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .dt-button-collection {
        position: fixed !important;
        z-index: 9999 !important;
        background: white !important;
        border: 1px solid #ddd !important;
        border-radius: 4px !important;
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
        background: #ddd;
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
    `;
    document.head.appendChild(style);

    const handleScroll = () => {
      const collection = document.querySelector(".dt-button-collection");
      if (collection && (collection as HTMLElement).style.display !== "none") {
        (collection as HTMLElement).style.display = "none";
      }
    };

    const scrollContainer = document.querySelector(".dataTables_scrollBody");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      document.head.removeChild(style);
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const columns = [
    {
      title: "S.No",
      data: null,
      render: (_data: any, _type: any, _row: any, meta: any) => {
        return meta.row + 1 + meta.settings._iDisplayStart;
      },
      orderable: false,
      searchable: false
    },
    { data: "username", title: "Username" },
    { data: "bookingId", title: "Booking ID" },
    { data: "logType", title: "Log Type" },
    { data: "logMessage", title: "Log Message" },
    {
      data: "logEntryDate",
      title: "Log Entry Date",
      render: (data: string) => {
        const date = new Date(data);
        return date.toLocaleString();
      }
    }
  ];

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      <div className="flex-shrink-0 px-6 py-4">
        <h2 className="text-xl font-semibold text-slate-800">Logs Table</h2>
      </div>
      <div className="flex-1 px-3 py-4 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-600">Loading logs...</div>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-600">Error: {error}</div>
          </div>
        )}
        {!loading && !error && (
          <div ref={tableRef} className="h-full">
            <DataTable
              data={logs}
              columns={columns}
              className="display nowrap w-full"
              options={{
                pageLength: 10,
                lengthMenu: [5, 10, 25, 50, 100],
                order: [[5, 'desc']], // Order by log entry date (index 5)
                searching: true,
                paging: true,
                info: true,
                scrollX: true,
                scrollY: "400px",
                scrollCollapse: true,
                layout: {
                  topStart: 'buttons',
                  topEnd: 'search',
                  bottomStart: 'pageLength',
                  bottomEnd: 'paging'
                },
                buttons: [
                  {
                    extend: 'colvis',
                    text: 'Column Visibility',
                    collectionLayout: 'fixed two-column'
                  }
                ],
                columnControl: ['order', ['orderAsc', 'orderDesc', 'spacer', 'search']],
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
