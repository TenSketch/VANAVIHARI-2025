import { X, MoreVertical, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// Match backend data (flattened for existing component usage)
interface ResortDetailData {
  _id: string;
  resortName?: string;
  contactPersonName?: string;
  contactNumber?: string;
  email?: string;
  address?: {
    line1?: string;
    line2?: string;
    cityDistrict?: string;
    stateProvince?: string;
    postalCode?: string;
    country?: string;
  };
  website?: string;
  foodProviding?: string;
  foodDetails?: string;
  roomIdPrefix?: string;
  extraGuestCharges?: number;
  supportNumber?: string;
  logo?: { url?: string } | string | null;
}

interface ResortDetailPanelProps {
  resort: ResortDetailData;
  isOpen: boolean;
  onClose: () => void;
  onResortUpdated?: (resort: ResortDetailData) => void;
}
const ResortDetailPanel = ({ resort, isOpen, onClose, onResortUpdated }: ResortDetailPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(() => flatten(resort));

  const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

  // flatten nested address for form editing
  function flatten(r: ResortDetailData) {
    return {
      _id: r._id,
      resortName: r.resortName || '',
      contactPersonName: r.contactPersonName || '',
      contactNumber: r.contactNumber || '',
      email: r.email || '',
      addressLine1: r.address?.line1 || '',
      addressLine2: r.address?.line2 || '',
      cityDistrict: r.address?.cityDistrict || '',
      stateProvince: r.address?.stateProvince || '',
      postalCode: r.address?.postalCode || '',
      country: r.address?.country || '',
      website: r.website || '',
      foodProviding: r.foodProviding || '',
      foodDetails: r.foodDetails || '',
      roomIdPrefix: r.roomIdPrefix || '',
      extraGuestCharges: r.extraGuestCharges !== undefined && r.extraGuestCharges !== null ? String(r.extraGuestCharges) : '',
      supportNumber: r.supportNumber || '',
      logo: typeof r.logo === 'string' ? r.logo : r.logo?.url || '',
    }
  }

  function unflatten(fd: any): Partial<ResortDetailData> {
    return {
      resortName: fd.resortName,
      contactPersonName: fd.contactPersonName,
      contactNumber: fd.contactNumber,
      email: fd.email,
      address: {
        line1: fd.addressLine1,
        line2: fd.addressLine2,
        cityDistrict: fd.cityDistrict,
        stateProvince: fd.stateProvince,
        postalCode: fd.postalCode,
        country: fd.country,
      },
      website: fd.website,
      foodProviding: fd.foodProviding,
      foodDetails: fd.foodDetails,
      roomIdPrefix: fd.roomIdPrefix,
      extraGuestCharges: fd.extraGuestCharges ? Number(fd.extraGuestCharges) : undefined,
      supportNumber: fd.supportNumber,
    }
  }

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = unflatten(formData);
      const res = await fetch(`${apiBase}/api/resorts/${formData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      const data = await res.json();
      if (onResortUpdated) onResortUpdated(data.resort);
      setIsEditing(false);
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  const basicInfoData = [
    { field: "Resort Name", value: resort.resortName || '' },
    { field: "Contact Person Name", value: resort.contactPersonName || '' },
    { field: "Contact Number", value: resort.contactNumber || '' },
    { field: "Email", value: resort.email || '' },
    { field: "Website", value: resort.website || '' },
    { field: "Support Number", value: resort.supportNumber || '' },
    { field: "Room ID Prefix", value: resort.roomIdPrefix || '' },
  ];

  const addressData = [
    { field: "Address Line 1", value: resort.address?.line1 || '' },
    { field: "Address Line 2", value: resort.address?.line2 || '' },
    { field: "City / District", value: resort.address?.cityDistrict || '' },
    { field: "State / Province", value: resort.address?.stateProvince || '' },
    { field: "Postal Code", value: resort.address?.postalCode || '' },
    { field: "Country", value: resort.address?.country || '' },
  ];

  const foodData = [
    { field: "Food Providing", value: resort.foodProviding || '' },
    { field: "Extra Guest Charges", value: resort.extraGuestCharges != null ? String(resort.extraGuestCharges) : '' },
  ];

  const foodDetailsData = [
    { field: "Food Details", value: resort.foodDetails || '' },
  ];

  const infoColumns: ColumnDef<{ field: string; value: string }>[] = [
    {
      accessorKey: "field",
      header: "Field",
      cell: ({ row }) => (
        <div className="font-medium text-slate-700 min-w-[120px]">
          {row.getValue("field")}
        </div>
      ),
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue("value") as string;
        const field = row.getValue("field") as string;

        if (field === "Email") {
          return (
            <a
              href={`mailto:${value}`}
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {value}
            </a>
          );
        }

        if (field === "Website") {
          return (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {value}
            </a>
          );
        }

        return <div className="text-slate-600 break-words">{value}</div>;
      },
    },
  ];

  const textAreaColumns: ColumnDef<{ field: string; value: string }>[] = [
    {
      accessorKey: "field",
      header: "Field",
      cell: ({ row }) => (
        <div className="font-medium text-slate-700 min-w-[120px]">
          {row.getValue("field")}
        </div>
      ),
    },
    {
      accessorKey: "value",
      header: "Content",
      cell: ({ row }) => {
        const value = row.getValue("value") as string;
        return (
          <div className="text-slate-600 whitespace-pre-wrap break-words max-w-full">
            {value}
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* Main View Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-3/4 lg:w-1/2 bg-white shadow-xl overflow-y-auto border-l border-slate-200">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Resort Details</h2>
              <p className="text-sm text-slate-600">View resort information</p>
            </div>
            <Button variant="outline" size="icon" onClick={onClose} className="p-2">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {/* Basic Info with Action Menu */}
            <SectionHeader
              title="Basic Information"
              action={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
            <DataTable columns={infoColumns} data={basicInfoData} />

      {((typeof resort.logo === 'string' && resort.logo) || (typeof resort.logo === 'object' && resort.logo?.url)) && (
              <div className="flex flex-col space-y-2">
                <h4 className="text-sm font-medium text-slate-700">Resort Logo</h4>
                <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 w-fit">
                  <img
        src={typeof resort.logo === 'string' ? resort.logo : resort.logo?.url}
                    alt="Resort Logo"
                    className="max-w-32 max-h-32 object-contain"
                  />
                </div>
              </div>
            )}

            <SectionHeader title="Address Information" />
            <DataTable columns={infoColumns} data={addressData} />

            <SectionHeader title="Food Information" />
            <DataTable columns={infoColumns} data={foodData} />
            <DataTable columns={textAreaColumns} data={foodDetailsData} />
          </div>
        </div>
      </div>

      {/* Edit Overlay Panel */}
      {isEditing && (
        <div className="fixed inset-y-0 right-0 z-[60] w-full sm:w-3/4 lg:w-1/2 bg-white shadow-xl overflow-y-auto border-l border-slate-200">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">Edit Basic Information</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" disabled={saving} onClick={handleSave}>
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
              </div>
            </div>

            {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
            {saving && <div className="text-sm text-slate-500 mb-2">Saving...</div>}

            {/* Form Fields */}
            <div className="space-y-4">
              {Object.entries(formData).map(([key, value]) => {
                if (key === '_id') return null;
                if (typeof value !== 'string') return null;
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <Input
                      value={value}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResortDetailPanel;

/* Section Header with optional action button */
const SectionHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
    <h3 className="text-lg sm:text-xl font-semibold text-slate-800">{title}</h3>
    {action}
  </div>
);

/* Generic Data Table */
const DataTable = ({
  columns,
  data,
}: {
  columns: ColumnDef<any>[];
  data: any[];
}) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-3 py-3 text-left font-medium text-slate-700">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-100">
          {table.getRowModel().rows.map((row, index) => (
            <tr
              key={row.id}
              className={`hover:bg-slate-50 transition-colors ${
                index % 2 === 0 ? "bg-white" : "bg-slate-25"
              }`}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-3 align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
