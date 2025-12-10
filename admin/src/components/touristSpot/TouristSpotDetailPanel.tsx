import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TouristSpot {
  _id: string;
  name: string;
  category?: string;
  entryFees?: number;
  parking2W?: number;
  parking4W?: number;
  cameraFees?: number;
  description?: string;
  address?: string;
  mapEmbed?: string;
  images?: Array<string | { url?: string }>;
}

interface TouristSpotDetailPanelProps {
  spot: TouristSpot | null;
  isOpen: boolean;
  onClose: () => void;
  onSpotUpdated?: (spot: TouristSpot) => void;
  // if true, open the panel in editing mode immediately
  startEditing?: boolean;
  canEdit?: boolean;
}

const TouristSpotDetailPanel = ({ spot, isOpen, onClose, onSpotUpdated, startEditing, canEdit = true }: TouristSpotDetailPanelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(() => buildForm(spot));

  const apiBase = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    setFormData(buildForm(spot));
    // Reset editing state when spot/isOpen/startEditing changes — only enable if allowed
    setIsEditing(Boolean(startEditing && canEdit));
    setError(null);
  }, [spot, startEditing, isOpen, canEdit]);

  const heroImage = useMemo(() => {
    const first = spot?.images?.[0];
    if (!first) return "";
    return typeof first === "string" ? first : first.url || "";
  }, [spot]);

  if (!isOpen || !spot) return null;

  async function handleSave() {
    if (!canEdit) {
      setError("You do not have permission to edit this record");
      return;
    }
    if (!spot) {
      setError("No spot selected");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, any> = {
        name: formData.name,
        category: formData.category,
        entryFees: toNumber(formData.entryFees),
        parking2W: toNumber(formData.parking2W),
        parking4W: toNumber(formData.parking4W),
        cameraFees: toNumber(formData.cameraFees),
        description: formData.description,
        address: formData.address,
        mapEmbed: formData.mapEmbed,
      };

      const token = localStorage.getItem("admin_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/touristspots/${spot._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save");
      }

      const data = await res.json();
      if (data?.touristSpot && onSpotUpdated) onSpotUpdated(data.touristSpot);
      setIsEditing(false);
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="ml-auto h-full w-full max-w-[520px] bg-white shadow-xl overflow-y-auto relative z-50">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <p className="text-xs text-slate-500">Tourist Spot</p>
            <h2 className="text-lg font-semibold text-slate-800">{spot.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => canEdit ? setIsEditing(true) : null}
                disabled={!canEdit}
                title={canEdit ? undefined : "You do not have permission to edit"}
              >
                Edit
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {heroImage ? (
          <div className="p-4">
            <img
              src={heroImage}
              alt={spot.name}
              className="w-full h-48 object-cover rounded-lg border"
            />
          </div>
        ) : null}

        {error && <div className="mx-4 my-2 text-sm text-red-600">{error}</div>}

        <div className="px-4 pb-6 space-y-4">
          <Section title="Basic Info">
            {isEditing ? (
              <div className="space-y-3">
                <Field label="Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
                <Field label="Category" value={formData.category} onChange={(v) => setFormData({ ...formData, category: v })} />
              </div>
            ) : (
              <DefinitionList rows={[['Name', spot.name], ['Category', spot.category || '—']]} />
            )}
          </Section>

          <Section title="Pricing">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Entry Fees (₹)" value={formData.entryFees} onChange={(v) => setFormData({ ...formData, entryFees: v })} inputMode="numeric" />
                <Field label="2W Parking (₹)" value={formData.parking2W} onChange={(v) => setFormData({ ...formData, parking2W: v })} inputMode="numeric" />
                <Field label="4W Parking (₹)" value={formData.parking4W} onChange={(v) => setFormData({ ...formData, parking4W: v })} inputMode="numeric" />
                <Field label="Camera Fees (₹)" value={formData.cameraFees} onChange={(v) => setFormData({ ...formData, cameraFees: v })} inputMode="numeric" />
              </div>
            ) : (
              <DefinitionList
                rows={[
                  ['Entry Fees', formatCurrency(spot.entryFees)],
                  ['Parking 2W', formatCurrency(spot.parking2W)],
                  ['Parking 4W', formatCurrency(spot.parking4W)],
                  ['Camera Fees', formatCurrency(spot.cameraFees)],
                ]}
              />
            )}
          </Section>

          <Section title="Details">
            {isEditing ? (
              <textarea
                className="w-full border rounded-md p-2 text-sm"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            ) : (
              <p className="text-sm text-slate-700 whitespace-pre-line">{spot.description || '—'}</p>
            )}
          </Section>

          <Section title="Address & Map">
            {isEditing ? (
              <div className="space-y-3">
                <Field label="Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} />
                <Field label="Map Embed / Link" value={formData.mapEmbed} onChange={(v) => setFormData({ ...formData, mapEmbed: v })} />
              </div>
            ) : (
              <DefinitionList rows={[["Address", spot.address || "—"], ["Map", spot.mapEmbed || "—"]]} />
            )}
          </Section>
        </div>

        {isEditing && (
          <div className="px-4 py-3 border-t flex items-center justify-end gap-2 bg-white sticky bottom-0">
            <Button variant="ghost" onClick={() => { setIsEditing(false); setFormData(buildForm(spot)); }} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !canEdit} title={!canEdit ? "You do not have permission to edit" : undefined}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-md p-3">
      <h3 className="text-sm font-semibold text-slate-800 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function DefinitionList({ rows }: { rows: [string, string | number | undefined | null][] }) {
  return (
    <dl className="grid grid-cols-1 gap-2 text-sm text-slate-700">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-3">
          <dt className="text-slate-500 min-w-[120px]">{label}</dt>
          <dd className="text-right break-all flex-1">{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

function Field({ label, value, onChange, inputMode }: { label: string; value: string; onChange: (v: string) => void; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"] }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-500">{label}</label>
      <input
        className="border rounded-md px-2 py-1 text-sm"
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function buildForm(spot: TouristSpot | null | undefined) {
  return {
    name: spot?.name || "",
    category: spot?.category || "",
    entryFees: safeString(spot?.entryFees),
    parking2W: safeString(spot?.parking2W),
    parking4W: safeString(spot?.parking4W),
    cameraFees: safeString(spot?.cameraFees),
    description: spot?.description || "",
    address: spot?.address || "",
    mapEmbed: spot?.mapEmbed || "",
  };
}

function safeString(v: any): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return String(v);
  const num = Number(v);
  return Number.isNaN(num) ? "" : String(v);
}

function toNumber(v: any): number | undefined {
  const num = Number(v);
  return Number.isNaN(num) ? undefined : num;
}

function formatCurrency(v?: number) {
  if (v === null || v === undefined) return "—";
  const num = Number(v);
  if (Number.isNaN(num)) return "—";
  return `₹${num.toLocaleString()}`;
}

export default TouristSpotDetailPanel;
