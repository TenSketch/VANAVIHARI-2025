import { Bell } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const dummyNotifications = [
  { id: 1, title: "New Reservation", message: "Booking for Jungle Star.", time: "2m ago", read: false },
  { id: 2, title: "System Alert", message: "Server restarted successfully.", time: "1h ago", read: true },
];

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState(dummyNotifications);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.some((n) => !n.read) && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {notifications.filter((n) => !n.read).length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No new notifications</div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} className={`${n.read ? "opacity-70" : "font-medium"}`}>
              <div className="flex flex-col items-start w-full">
                <div className="flex justify-between w-full">
                  <span>{n.title}</span>
                  <span className="text-xs text-gray-400">{n.time}</span>
                </div>
                <p className="text-sm text-gray-600">{n.message}</p>
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-center text-blue-600 cursor-pointer"
          onClick={() => setNotifications([])}
        >
          Clear All
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
