import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";

// Required plugins (kept minimal to match other tables)
import "datatables.net-buttons";
import "datatables.net-buttons/js/buttons.colVis.js";

// Styles
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-buttons-dt/css/buttons.dataTables.css";

import staticSeed from "./allTouristSpots.json";
import { useEffect, useRef, useState } from "react";
import { usePermissions } from '@/lib/AdminProvider'

DataTable.use(DT);

interface TouristSpot {
  id: string;
  _id?: string;
  name: string;
  category?: string;
  entryFees?: number;
  parking2W?: number;
  parking4W?: number;
  cameraFees?: number;
  description?: string;
  address?: string;
  mapEmbed?: string;
  images?: Array<string | { url: string }>;
}

export default function AllTouristSpots() {
  const tableRef = useRef(null);
  const perms = usePermissions();
  const [spots, setSpots] = useState<TouristSpot[]>(staticSeed as any);
  const [loading, setLoading] = useState(true);
  const spotsRef = useRef(spots);
  useEffect(() => { spotsRef.current = spots }, [spots])

  const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/touristspots`);
        const data = await res.json().catch(() => null);
        if (res.ok && data && Array.isArray(data.touristSpots)) {
          const mapped = data.touristSpots.map((s: any, idx: number) => ({
            id: s._id || String(idx + 1),
            _id: s._id,
            name: s.name || s.title || `Spot ${idx + 1}`,
            category: s.category || s.type || '—',
            entryFees: s.entryFees ?? s.fees ?? 0,
            parking2W: s.parking2W ?? s.parking?.twoWheeler ?? 0,
            parking4W: s.parking4W ?? s.parking?.fourWheeler ?? 0,
            cameraFees: s.cameraFees ?? s.cameraFee ?? 0,
            description: s.description || s.desc || '',
            address: s.address || s.location || '',
            mapEmbed: s.mapEmbed || s.map || '',
            images: Array.isArray(s.images) ? s.images.map((i: any) => (typeof i === 'string' ? i : i.url || i.path || '')) : [],
          }));
          setSpots(mapped);
        }
      } catch (e) {
        console.warn('Failed to load tourist spots; using static seed');
      } finally {
        setLoading(false);
      }
    })();

    const style = document.createElement('style');
    style.innerHTML = `
      .dataTables_wrapper .dataTables_filter { display: inline-flex; gap: 8px; margin-bottom: 1rem; }
      .dataTables_wrapper .dataTables_length { margin-bottom: 1rem; }
      .dataTables_wrapper .dataTables_scrollBody { overflow-y: auto !important; max-height: 420px !important; border: 1px solid #ddd; border-radius: 0.5rem; }
      table.dataTable thead tr th, table.dataTable thead tr td { font-weight: 700 !important; }
      table.dataTable tbody tr { cursor: pointer !important; transition: background-color 0.15s ease !important; }
      table.dataTable tbody tr:hover { background-color: #f8fafc !important; }
    `;
    document.head.appendChild(style);

    return () => { document.head.removeChild(style); };
  }, []);

  const columns = [
    { data: 'id', title: 'ID' },
    { data: 'name', title: 'Tourist Spot Name' },
    { data: 'category', title: 'Category' },
    {
      data: 'images',
      title: 'Thumbnail',
      orderable: false,
      render: (data: any, _type: any, row: TouristSpot) => {
        const img = Array.isArray(data) && data.length > 0 ? (typeof data[0] === 'string' ? data[0] : (data[0].url || '')) : '';
        const src = img || '/img/placeholder.jpg';
        return `<img src="${src}" alt="${row.name}" style="width:64px;height:48px;object-fit:cover;border-radius:4px;"/>`;
      }
    },
    {
      data: 'entryFees',
      title: 'Entry Fees',
      render: (d: number) => `₹${(d || 0).toLocaleString()}`,
    },
    {
      data: 'parking2W',
      title: '2 Wheeler Parking',
      render: (d: number) => `₹${(d || 0).toLocaleString()}`,
    },
    {
      data: 'parking4W',
      title: '4 Wheelers Parking',
      render: (d: number) => `₹${(d || 0).toLocaleString()}`,
    },
    {
      data: 'cameraFees',
      title: 'Camera Fees',
      render: (d: number) => d ? `₹${d.toLocaleString()}` : '—',
    },
    {
      data: 'description',
      title: 'Description',
      render: (d: string) => d ? (d.length > 120 ? d.slice(0, 117) + '…' : d) : '—'
    },
    { data: 'address', title: 'Address' },
    {
      data: 'mapEmbed',
      title: 'Map',
      orderable: false,
      render: (d: string) => d ? `<a href="${d}" target="_blank" rel="noreferrer">Open map</a>` : '—'
    },
    {
      data: null,
      title: 'Actions',
      orderable: false,
      searchable: false,
      render: (_: any, _2: any, row: TouristSpot) => {
        return `
          <div style="display:flex;gap:8px;align-items:center;">
            ${perms.canEdit ? `<button class="edit-btn" data-id="${row.id}" style="background:#3b82f6;color:white;border:none;padding:6px 10px;border-radius:6px;font-size:12px;">Edit</button>` : ''}
            ${perms.canDisable ? `<button class="disable-btn" data-id="${row.id}" style="background:#dc2626;color:white;border:none;padding:6px 10px;border-radius:6px;font-size:12px;">Disable</button>` : ''}
          </div>
        `;
      }
    }
  ];

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Tourist Spots</h2>
      </div>

      <div ref={tableRef} className="w-full">
        {loading && <div className="p-4 text-sm text-gray-500">Loading tourist spots...</div>}
        <DataTable
          data={spots}
          columns={columns}
          className="display nowrap w-full border border-gray-400"
          options={{
            pageLength: 10,
            lengthMenu: [5, 10, 25, 50, 100],
            order: [[0, 'asc']],
            searching: true,
            paging: true,
            info: true,
            scrollX: true,
            scrollCollapse: true,
            scrollY: '420px',
            layout: { topStart: 'buttons', bottom1Start: 'pageLength' },
            buttons: [ { extend: 'colvis', text: 'Column Visibility' } ],
          }}
        />
      </div>
    </div>
  );
}
