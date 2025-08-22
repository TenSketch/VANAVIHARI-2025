

import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Users,
  Bed,
  Calendar,
  FileText,
  Home,
  Plus,
  Globe,
  Wifi,
  BookOpen,
  BedDouble,
  MonitorCheck,
  ArrowRightFromLine,
  ArrowLeftFromLine,
  ClipboardMinus,
  ClipboardCheck,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? [] // Close the current section
        : [section] // Open only the clicked section, close others
    );
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      path: "/dashboard/report",
    },
    {
      id: "dailyoccupancy",
      label: "Daily Occupancy Report",
      icon: ClipboardMinus,
      children: [
        { label: "Vanavihari", path: "/dailyoccupanyreport/vanavihari", icon: ClipboardCheck},
        { label: "JungleStar", path: "/dailyoccupanyreport/junglestar", icon: ClipboardCheck},
      ],
    },
    {
      id: "frontdesk",
      label: "Frontdesk",
      icon: MonitorCheck,
      children: [
        { label: "Check In", path: "/frontdesk/checkin", icon: ArrowRightFromLine},
        { label: "Check Out", path: "/frontdesk/checkout", icon: ArrowLeftFromLine},
      ],
    },
    {
      id: "resorts",
      label: "Resorts",
      icon: Building2,
      children: [
        { label: "Add Resort", path: "/resorts/add", icon: Plus },
        { label: "All Resorts", path: "/resorts/all", icon: Globe },
      ],
    },
    {
      id: "room-amenities",
      label: "Room Amenities",
      icon: Wifi,
      children: [
        { label: "Add Amenities", path: "/room-amenities/add", icon: Plus },
        { label: "All Amenities", path: "/room-amenities/all", icon: Wifi },
      ],
    },
    {
      id: "cottage-types",
      label: "Cottage Types",
      icon: Home,
      children: [
        { label: "Add Type", path: "/cottage-types/add", icon: Plus },
        { label: "All Types", path: "/cottage-types/all", icon: BookOpen },
      ],
    },
    {
      id: "rooms",
      label: "Rooms",
      icon: Bed,
      children: [
        { label: "Add Room", path: "/rooms/add", icon: Plus },
        { label: "All Room", path: "/rooms/all", icon: BedDouble },
        
      ],
    },
    {
      id: "guests",
      label: "Guests",
      icon: Users,
      children: [
        { label: "Add Guest", path: "/guests/add", icon: Plus },
        { label: "All Guests", path: "/guests/all", icon: Users },
      ],
    },
    {
      id: "reservations",
      label: "Reservations",
      icon: Calendar,
      children: [
        { label: "Add Reservation", path: "/reservation/add", icon: Plus },
        { label: "All Reservations", path: "/reservation/all", icon: Calendar },
      ],
    },
    {
      id: "log-reports",
      label: "Log Reports",
      icon: FileText,
      children: [
        { label: "All Reports", path: "/log-reports/all", icon: FileText },
        { label: "Log Table", path: "/log-reports/table", icon: FileText },
      ],
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white/10 backdrop-blur-md z-40 lg:hidden"
          onClick={onClose}
        />
      )}


      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out z-50",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="min-h-full flex flex-col">
          <div className="p-4">
            {/* Brand */}
            <div className="flex items-center space-x-2">
          <img 
            src="https://res.cloudinary.com/dia8x6y6u/image/upload/v1752997496/logo_kszbod.png"
            alt="Vanavihari Logo"
            className="w-full h-8 object-contain"
          />
        </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              if (!item.children) {
                return (
                  <Link
                    key={item.id}
                    to={item.path || "#"}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                      isActive(item.path || "")
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-slate-700 hover:text-white"
                    )}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              const isOpen = openSections.includes(item.id);
              const hasActiveChild = item.children.some(child => isActive(child.path));

              return (
                <Collapsible key={item.id} open={isOpen} onOpenChange={() => toggleSection(item.id)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-between px-3 py-2 h-auto text-left font-normal",
                        hasActiveChild
                          ? "bg-slate-700 text-white"
                          : "text-gray-300 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={cn(
                          "flex items-center space-x-3 px-6 py-2 rounded-lg transition-colors ml-4",
                          isActive(child.path)
                            ? "bg-blue-600 text-white"
                            : "text-gray-400 hover:bg-slate-700 hover:text-white"
                        )}
                        onClick={() => window.innerWidth < 1024 && onClose()}
                      >
                        <child.icon className="h-4 w-4" />
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;