
import { Menu, User, Home, LogOut} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router";
import Breadcrumb from "./Breadcrumb";
import NotificationDropdown from "./NotificationDropDown";
import { useAdmin } from "@/lib/AdminProvider";
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
  "/tentspots/add": ["Tent Spots", "Add Tent Spots"],
  "/tentspots/all": ["Tent Spots", "All Tent Spots"],
};

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const currentPath = location.pathname;

  const breadcrumbs = breadcrumbMap[currentPath] || ["Dashboard", "Unknown Page"];

  const handleSignOut = () => {
    logout();
    navigate('/auth/login');
  };

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

          {/* Breadcrumb */}
          <div className="truncate whitespace-nowrap overflow-hidden min-w-0">
            <Breadcrumb
              items={breadcrumbs}
              className="text-gray-600 truncate"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center">
          <NotificationDropdown/>
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