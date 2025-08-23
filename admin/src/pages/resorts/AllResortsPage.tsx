import { useEffect, useState } from "react";
import ResortCard from "@/components/resorts/ResortCard";
import ResortDetailPanel from "@/components/resorts/ResortDetailPanel";

interface ResortData {
  id: string;
  name: string;
  imageUrl: string;
  address: string;
  phone: string;
  email: string;
  resortName: string;
  slug: string;
  contactPersonName: string;
  contactNumber: string;
  addressLine1: string;
  addressLine2: string;
  cityDistrict: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  logo?: string | null;
  website: string;
  termsAndConditions: string;
  upiId: string;
  qrFile?: string | null;
  foodProviding: string;
  foodDetails: string;
  roomIdPrefix: string;
  extraGuestCharges: string;
  supportNumber: string;
}

const AllResortsPage = () => {
  const [selectedResort, setSelectedResort] = useState<ResortData | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [resorts, setResorts] = useState<ResortData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000'

  useEffect(() => {
    let mounted = true
    const fetchResorts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${apiBase}/api/resorts`)
        if (!res.ok) throw new Error(`Failed to load resorts: ${res.status} ${res.statusText}`)
        const data = await res.json()
        // map backend shape to the local ResortData shape
        const mapped: ResortData[] = (data.resorts || []).map((r: any) => ({
          id: r._id || r.id || String(Math.random()),
          name: r.resortName || "",
          imageUrl: (r.logo && r.logo.url) || '/images/Vanavihari-reception.jpg',
          address: [r.address?.line1, r.address?.line2, r.address?.cityDistrict, r.address?.stateProvince, r.address?.postalCode, r.address?.country].filter(Boolean).join(', '),
          phone: r.contactNumber || r.contact || '',
          email: r.email || '',
          resortName: r.resortName || '',
          slug: r.slug || '',
          contactPersonName: r.contactPersonName || '',
          contactNumber: r.contactNumber || '',
          addressLine1: r.address?.line1 || '',
          addressLine2: r.address?.line2 || '',
          cityDistrict: r.address?.cityDistrict || '',
          stateProvince: r.address?.stateProvince || '',
          postalCode: r.address?.postalCode || '',
          country: r.address?.country || '',
          logo: (r.logo && r.logo.url) || null,
          website: r.website || '',
          termsAndConditions: r.termsAndConditions || '',
          upiId: r.upiId || '',
          qrFile: r.qrFile || null,
          foodProviding: r.foodProviding || '',
          foodDetails: r.foodDetails || '',
          roomIdPrefix: r.roomIdPrefix || '',
          extraGuestCharges: r.extraGuestCharges ? String(r.extraGuestCharges) : '',
          supportNumber: r.supportNumber || '',
        }))

        if (mounted) setResorts(mapped)
      } catch (err: any) {
        console.error(err)
        if (mounted) setError(err.message || 'Unknown error')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchResorts()
    return () => { mounted = false }
  }, [apiBase])

  const handleResortClick = (resort: ResortData) => {
    setSelectedResort(resort)
    setIsDetailPanelOpen(true)
  }

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false)
    setSelectedResort(null)
  }

  return (
    <div className="relative">
      <div className="p-4">
        {loading && <div className="text-sm text-slate-600">Loading resorts...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="grid gap-[1px] grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 mt-3">
          {resorts.map((resort) => (
            <ResortCard
              key={resort.id}
              name={resort.name}
              imageUrl={resort.imageUrl}
              address={resort.address}
              phone={resort.phone}
              email={resort.email}
              onClick={() => handleResortClick(resort)}
            />
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedResort && (
        <ResortDetailPanel
          resort={selectedResort}
          isOpen={isDetailPanelOpen}
          onClose={handleCloseDetailPanel}
        />
      )}
    </div>
  )
}

export default AllResortsPage