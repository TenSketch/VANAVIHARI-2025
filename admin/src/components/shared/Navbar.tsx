
import { Menu, User, Home, LogOut, Building2, Tent, MapPin, Check, Globe, Users, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router";
import Breadcrumb from "./Breadcrumb";
import NotificationDropdown from "./NotificationDropDown";
import { useAdmin } from "@/lib/AdminProvider";
import { useViewType } from "@/lib/ViewTypeContext";
import type { ViewType } from "@/lib/ViewTypeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onMenuClick: () => void;
}

// Breadcrumb mapping for different routes
const breadcrumbMap: Record<string, string[]> = {
  "/": ["Dashboard"],
  "/dashboard/report": ["Dashboard", "Reports"],
  "/dailyoccupanyreport/vanavihari": ["Daily Occupancy", "Vanavihari Report"],
  "/dailyoccupanyreport/junglestar": ["Daily Occupancy", "Jungle Star Report"],
  "/frontdesk/checkin": ["Front Desk", "Check In"],
  "/frontdesk/checkout": ["Front Desk", "Check Out"],
  "/rooms/add": ["Rooms", "Add Room"],
  "/rooms/all": ["Rooms", "All Rooms"],
  "/guests/add": ["Guests", "Add Guest"],
  "/guests/all": ["Guests", "All Guests"],
  "/resorts/add": ["Resorts", "Add Resort"],
  "/resorts/all": ["Resorts", "All Resorts"],
  "/log-reports/all": ["Log Reports", "All Reports"],
  "/log-reports/table": ["Log Reports", "Report Table"],
  "/reservation/add": ["Reservations", "Add Reservation"],
  "/reservation/all": ["Reservations", "All Reservations"],
  "/cottage-types/all": ["Cottage Types", "All Types"],
  "/cottage-types/add": ["Cottage Types", "Add Type"],
  "/room-amenities/all": ["Room Amenities", "All Amenities"],
  "/room-amenities/add": ["Room Amenities", "Add Amenity"],
  "/touristspots/add": ["Tourist Spots", "Add Tourist Spots"],
  "/touristspots/all": ["Tourist Spots", "Add Tourist Spots"],
  "/tenttypes/add": ["Tent Types", "Add Tent Types"],
  "/tenttypes/all": ["Tent Types", "All Tent Types"],
  "/tentbookings/addbookings": ["Tent Bookings", "Add Tent Bookings"],
  "/tentbookings/allbookings": ["Tent Bookings", "All Tent Bookings"],
  "/tent/dashboard": ["Tent", "Dashboard"],
  "/tent/bookings": ["Tent", "Bookings"],
  "/tent/inventory": ["Tent", "Inventory"],
  "/tentspots/details": ["Tent Spots", "Details"],
  "/tourist/dashboard": ["Tourist Spots", "Dashboard"],
  "/tourist/bookings": ["Tourist", "Bookings"],
  "/reports/daily-occupancy": ["Reports", "Daily Occupancy"],
  "/reports/payments": ["Reports", "Payments"],
  "/reports/utilisation": ["Reports", "Utilisation"],
  "/reports/cancellations": ["Reports", "Cancellations"],
  "/reports/visits": ["Reports", "Visits"],
  "/reports/revenue": ["Reports", "Revenue"],
  "/tourist/packages": ["Packages", "All Packages"],
  "/settings": ["Settings"],
};

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const { viewType, setViewType } = useViewType();
  const currentPath = location.pathname;

  const breadcrumbs = breadcrumbMap[currentPath] || ["Dashboard", "Unknown Page"];

  const handleSignOut = () => {
    logout();
    navigate('/auth/login');
  };

  const viewTypeOptions: { value: ViewType; label: string; icon: typeof Building2 }[] = [
    { value: "resort", label: "Resort", icon: Building2 },
    { value: "tent", label: "Tent", icon: Tent },
    { value: "tourist-spot", label: "Tourist Spot", icon: MapPin },
  ];

  const currentViewOption = viewTypeOptions.find(option => option.value === viewType);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between flex-nowrap">
        {/* Left side */}
        <div className="flex items-center space-x-4 flex-nowrap overflow-hidden min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xl font-semibold text-gray-800 hidden sm:block">
              Vanavihari Admin
            </span>
            <span className="text-lg font-semibold text-gray-800 sm:hidden">
              Vana
            </span>
          </div>

          {/* (view dropdown moved to right side) */}

          {/* Breadcrumb */}
          <div className="truncate whitespace-nowrap overflow-hidden min-w-0">
            <Breadcrumb
              items={breadcrumbs}
              className="text-gray-600 truncate"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center items-stretch space-x-2">
          {/* View Type Dropdown (moved next to notifications) */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2 h-9">
                  {currentViewOption && <currentViewOption.icon className="h-4 w-4" />}
                  <span className="hidden sm:inline">{currentViewOption?.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {viewTypeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setViewType(option.value)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <option.icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                    {viewType === option.value && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <NotificationDropdown/>
          {/* Global top-bar menu (Guests, Logs, Settings) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span className="hidden md:inline">Global</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/guests/all')}>
                <Users className="mr-2 h-4 w-4" />
                Guests
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/log-reports/all')}>
                <FileText className="mr-2 h-4 w-4" />
                Logs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Home className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden lg:block">Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                My Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Home className="mr-2 h-4 w-4" />
                Home
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;