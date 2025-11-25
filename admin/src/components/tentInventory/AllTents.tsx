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
import { Download } from "lucide-react";
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

DataTable.use(DT);

interface Tent {
  id: string;
  sno: number;
  tentSpot: string;
  tentSize: 2 | 4;
  tentId: string;
  rate: number;
  imageName: string | null;
}

export default function AllTentsTable() {
  const tableRef = useRef(null);
  const perms = usePermissions()
  const permsRef = useRef(perms)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'view'|'edit'>('view')
  const [selectedTent, setSelectedTent] = useState<Tent | null>(null);
  const [tents, setTents] = useState<Tent[]>([]);
  const tentsRef = useRef<Tent[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Editable fields
  const [editTentSpot, setEditTentSpot] = useState("");
  const [editTentSize, setEditTentSize] = useState<2 | 4>(2);
  const [editRate, setEditRate] = useState<number>(0);

  // Load tents from localStorage (since we're using local storage for demo)
  useEffect(() => {
    const loadTents = () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        let stored = localStorage.getItem('tentsDemo') || '[]';
        let list = JSON.parse(stored);
        
        // Add sample data if no tents exist
        if (list.length === 0) {
          const sampleTents = [
            {
              id: 'tent-sample-1',
              sno: 1,
              resort: 'Vanavihari',
              tentSize: 4,
              tentId: 'V-T4',
              rate: 3500,
            },
            {
              id: 'tent-sample-2',
              sno: 2,
              resort: 'Vanavihari',
              tentSize: 2,
              tentId: 'V-T2',
              rate: 2000,
            },
            {
              id: 'tent-sample-3',
              sno: 3,
              resort: 'Karthikavanam',
              tentSize: 4,
              tentId: 'K-T4',
              rate: 3500,
            },
            {
              id: 'tent-sample-4',
              sno: 4,
              resort: 'Karthikavanam',
              tentSize: 2,
              tentId: 'K-T2',
              rate: 2000,
            },
            {
              id: 'tent-sample-5',
              sno: 5,
              resort: 'Vanavihari',
              tentSize: 4,
              tentId: 'V-T4',
              rate: 3500,
            }
          ];
          localStorage.setItem('tentsDemo', JSON.stringify(sampleTents));
          list = sampleTents;
        }
        
        const mapped = list.map((t: any, idx: number) => {
          // Auto-assign sno if missing or invalid, ensuring sequential numbering
          let autoSno = t.sno;
          if (!autoSno || typeof autoSno !== 'number' || autoSno <= 0) {
            autoSno = idx + 1;
          }
          
          return {
            id: t.id || `tent-${idx}`,
            sno: autoSno,
            tentSpot: t.resort || 'Vanavihari',
            tentSize: t.tentSize || 2,
            tentId: t.tentId || '',
            rate: t.rate || 0,
            imageName: t.imageName || null,
          };
        });
        
        // Ensure all sno values are unique and sequential
        const sortedMapped = mapped.sort((a: Tent, b: Tent) => a.sno - b.sno);
        const reindexed = sortedMapped.map((tent: Tent, index: number) => ({
          ...tent,
          sno: index + 1
        }));
        
        setTents(reindexed);
      } catch (err: any) {
        console.error('Failed to load tents', err);
        setLoadError(err.message || 'Failed to load tents');
      } finally {
        setIsLoading(false);
      }
    };

    loadTents();
  }, []);

  useEffect(()=>{ tentsRef.current = tents }, [tents])
  useEffect(()=>{ permsRef.current = perms }, [perms])

  const exportToExcel = () => {
    const headers = [
      "S.No",
      "Tent Spot",
      "Tent Type",
      "Tent ID",
      "Rate (₹)",
      "Image"
    ];

    const csvContent = [
      headers.join(","),
      ...tents.map((tent) => {
        return [
          tent.sno,
          `"${tent.tentSpot}"`,
          `"${tent.tentSize} Person"`,
          `"${tent.tentId}"`,
          tent.rate,
          `"${tent.imageName || 'No image'}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Tents_Records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openForView = (tent: Tent) => {
    setSelectedTent(tent);
    setEditTentSpot(tent.tentSpot);
    setEditTentSize(tent.tentSize);
    setEditRate(tent.rate);
    setSheetMode('view')
    setIsDetailSheetOpen(true);
  };

  const handleEdit = (tent: Tent) => {
    if (!permsRef.current.canEdit) return
    openForView(tent)
    setSheetMode('edit')
  };

  const columns = [
    { data: "sno", title: "S.No" },
    { data: "tentSpot", title: "Tent Spot" },
    { 
      data: "tentSize", 
      title: "Tent Type",
      render: (data: number) => `${data} Person`
    },
    { data: "tentId", title: "Tent ID" },
    { 
      data: "rate", 
      title: "Rate (₹)",
      render: (data: number) => `₹${data.toLocaleString()}`
    },
    {
      data: "imageName",
      title: "Image",
      render: () => "",
    },
    {
      data: null,
      title: "Actions",
      orderable: false,
      searchable: false,
      render: (_data: any, _type: any, row: Tent) => {
        return `
          <div style="display: flex; gap: 8px; align-items: center;">
            ${perms.canEdit ? `
            <button 
              class="edit-btn" 
              data-id="${row.id}"
              style="background: #3b82f6; color: white; border: none; padding: 6px 12px;
                border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;"
              title="Edit Tent"
            >
              Edit
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
      if (button?.classList.contains('edit-btn')) {
        event.stopPropagation()
        const tentId = button.getAttribute('data-id') || ''
        const tent = tentsRef.current.find(t => t.id === tentId)
        if (!tent) return
        if (!permsRef.current.canEdit) return
        handleEdit(tent)
        return
      }

      // Row click opens view-only detail
      const row = target.closest('tr')
      if (row && row.parentElement?.tagName === 'TBODY') {
        const rowIndex = Array.from(row.parentElement.children).indexOf(row as any)
        const tent = tentsRef.current[rowIndex]
        if (tent) openForView(tent)
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleSaveEdit = () => {
    if (!perms.canEdit || !selectedTent) return;
    
    const updatedTents = tents.map((t) =>
      t.id === selectedTent.id
        ? {
            ...t,
            tentSpot: editTentSpot,
            tentSize: editTentSize,
            rate: editRate,
          }
        : t
    );
    
    // Reindex sno to ensure sequential numbering
    const reindexedTents = updatedTents
      .sort((a, b) => a.sno - b.sno)
      .map((tent, index) => ({ ...tent, sno: index + 1 }));
    
    setTents(reindexedTents);
    
    // Update localStorage with proper sno assignment
    try {
      const dataToSave = updatedTents
        .sort((a, b) => a.sno - b.sno)
        .map((t, index) => ({
          id: t.id,
          sno: index + 1, // Ensure sequential sno
          resort: t.tentSpot,
          tentSize: t.tentSize,
          tentId: t.tentId,
          rate: t.rate,
          imageName: t.imageName,
        }));
      localStorage.setItem('tentsDemo', JSON.stringify(dataToSave));
    } catch (err) {
      console.error('Failed to update localStorage', err);
    }
    
    setSheetMode('view');
    setIsDetailSheetOpen(false);
  };

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden py-6">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-slate-800">
          All Tents
        </h2>
        <Button
          onClick={() => perms.canViewDownload ? exportToExcel() : null}
          className={`inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg ${
            perms.canViewDownload 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}
          disabled={!perms.canViewDownload}
          title={perms.canViewDownload ? 'Export to Excel' : 'You do not have permission to download/export'}
        >
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      <div ref={tableRef} className="flex-1 overflow-hidden">
        {isLoading && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-blue-800 mb-3">Loading tents...</div>
        )}
        {loadError && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-md text-red-800 mb-3">{loadError}</div>
        )}
        <DataTable
          data={tents}
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
              { targets: 1, width: '120px' }, // Tent Spot
              { targets: 2, width: '100px' }, // Tent Type
              { targets: 3, width: '100px' }, // Tent ID
              { targets: 4, width: '100px' }, // Rate
              { targets: 5, width: '80px' }, // Image
              { targets: 6, width: '160px', orderable: false, searchable: false }, // Actions
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
            <SheetTitle>Tent Details</SheetTitle>
            <SheetDescription>
              Complete information about the selected tent
            </SheetDescription>
          </SheetHeader>

          {selectedTent && (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <div>
                  <Label>S.No</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    {selectedTent.sno}
                  </div>
                </div>

                <div>
                  <Label>Tent Spot</Label>
                  {sheetMode === 'edit' ? (
                    <select
                      value={editTentSpot}
                      onChange={(e) => setEditTentSpot(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-slate-50"
                    >
                      <option value="Vanavihari">Vanavihari</option>
                      <option value="Karthikavanam">Karthikavanam</option>
                    </select>
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedTent.tentSpot}</div>
                  )}
                </div>

                <div>
                  <Label>Tent Type</Label>
                  {sheetMode === 'edit' ? (
                    <select
                      value={editTentSize}
                      onChange={(e) => setEditTentSize(Number(e.target.value) as 2 | 4)}
                      className="w-full px-3 py-2 border rounded-md bg-slate-50"
                    >
                      <option value={2}>2 Person</option>
                      <option value={4}>4 Person</option>
                    </select>
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedTent.tentSize} Person</div>
                  )}
                </div>

                <div>
                  <Label>Tent ID</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">{selectedTent.tentId}</div>
                </div>

                <div>
                  <Label>Rate (₹)</Label>
                  {sheetMode === 'edit' ? (
                    <Input
                      type="number"
                      value={editRate}
                      onChange={(e) => setEditRate(Number(e.target.value))}
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md border">₹{selectedTent.rate.toLocaleString()}</div>
                  )}
                </div>

                <div>
                  <Label>Image</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                    {selectedTent.imageName ? (
                      <span className="text-green-600">✓ {selectedTent.imageName}</span>
                    ) : (
                      <span className="text-red-600">✗ No image uploaded</span>
                    )}
                  </div>
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
                    <Button variant="outline" onClick={() => setIsDetailSheetOpen(false)}>Close</Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setSheetMode('view')}>Cancel</Button>
                    <Button
                      onClick={handleSaveEdit}
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