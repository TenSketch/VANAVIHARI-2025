import { useState } from "react";
import ResortCard from "@/components/resorts/ResortCard";
import ResortDetailPanel from "@/components/resorts/ResortDetailPanel";

interface ResortData {
  id: string;
  name: string;
  imageUrl: string;
  address: string;
  phone: string;
  email: string;
  // Extended fields for detail view
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

  // Sample resort data - in real app, this would come from API
  const resorts: ResortData[] = [
    {
      id: "1",
      name: "Jungle Star, Valamuru",
      imageUrl: "/images/Jungle_Star-reception.jpg",
      address: "Jungle Nature Camp Site, Valamuru, Maredumilli, Andhra Pradesh, 533295, India",
      phone: "+91 7382151617",
      email: "junglestarecocamp@gmail.com",
      // Extended fields
      resortName: "Jungle Star, Valamuru",
      slug: "jungle-star-valamuru",
      contactPersonName: "Suresh Kumar",
      contactNumber: "+91 7382151617",
      addressLine1: "Jungle Nature Camp Site, Valamuru",
      addressLine2: "Maredumilli",
      cityDistrict: "East Godavari",
      stateProvince: "Andhra Pradesh",
      postalCode: "533295",
      country: "India",
      logo: "/images/Jungle_Star-reception.jpg", // Sample logo path
      website: "www.junglestar.com",
      termsAndConditions: `Check-in Time: 10:00 AM (After CIST)
    Check-out Time: The following morning (CIST)

    Weekday Stay (Monday – Thursday):
    - Each room accommodates 2 persons.
    - Extra guest charge: ₹1500 per night.
    - Maximum occupancy per room: 3 persons.
    - Extra bed includes a mattress and food.

    Weekend Stay (Friday – Sunday):
    - Each room accommodates 2 persons.
    - Extra guest charge: ₹1750 per night.
    - Maximum occupancy per room: 3 persons.
    - Extra bed includes a mattress and food.

    Note:
    - Accommodation includes all meals (breakfast, lunch, dinner).
    - Food served is traditional Andhra cuisine with vegetarian and non-vegetarian options.`,
      upiId: "junglestar@paytm",
      qrFile: "/images/Jungle_Star-reception.jpg", // Sample QR code path
      foodProviding: "Yes",
      foodDetails: "Traditional Andhra cuisine, vegetarian and non-vegetarian options available. Breakfast, lunch, and dinner served.",
      roomIdPrefix: "JS",
      extraGuestCharges: "₹500 per person per night",
      supportNumber: "+91 7382151617"
    },

    {
      id: "2",
      name: "Vanavihari, Maredumilli",
      imageUrl: "/images/Vanavihari-reception.jpg",
      address: "Co-Ordinator(Complex Manager), Community Based Eco Tourism, Maredumilli, Andhra Pradesh, 533295, India",
      phone: "+91 9494151617",
      email: "info@vanavihari.com",
      // Extended fields
      resortName: "Vanavihari, Maredumilli",
      slug: "vanavihari-maredumilli",
      contactPersonName: "Ramesh Babu",
      contactNumber: "+91 9494151617",
      addressLine1: "Community Based Eco Tourism",
      addressLine2: "Maredumilli Forest Area",
      cityDistrict: "East Godavari",
      stateProvince: "Andhra Pradesh",
      postalCode: "533295",
      country: "India",
      logo: "/images/Vanavihari-reception.jpg", // No logo for this resort
      website: "www.vanavihari.com",
      termsAndConditions: "Eco-tourism resort with sustainable practices. Check-in: 1:00 PM, Check-out: 12:00 PM. Forest entry permits required.",
      upiId: "vanavihari@gpay",
      qrFile: null, // No QR code for this resort
      foodProviding: "Yes",
      foodDetails: "Organic and locally sourced meals. Special tribal cuisine available on request. Vegetarian-friendly options.",
      roomIdPrefix: "VV",
      extraGuestCharges: "₹400 per person per night",
      supportNumber: "+91 9494151617"
    }
  ];

  const handleResortClick = (resort: ResortData) => {
    setSelectedResort(resort);
    setIsDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setSelectedResort(null);
  };

  return (
    <div className="relative">
      <div className="grid gap-[1px] grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 p-4">
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

      {/* Detail Panel */}
      {selectedResort && (
        <ResortDetailPanel
          resort={selectedResort}
          isOpen={isDetailPanelOpen}
          onClose={handleCloseDetailPanel}
        />
      )}
    </div>
  );
}

export default AllResortsPage