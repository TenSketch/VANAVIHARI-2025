import { useState } from "react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, BedDouble, Users, LogOut, CreditCard, TrendingUp} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip
} from "recharts";

import data from "./dummydatadashboard.json";

const resorts = data.resorts;
const last5Bookings = data.last5Bookings;
const paymentBreakdown = data.paymentBreakdown;
const occupancy7Day = data.occupancy7Day;
const resortCalendar = data.resortCalendar;

import type { LucideIcon } from "lucide-react";

const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A855F7", "#F87171"];
const LINE_COLOR = "#2563EB"; 

type CalendarStatus = "available" | "booked" | "blocked";
type ResortId = keyof typeof resortCalendar;

type ResortCalendarProps = {
  resortId: ResortId;
  resortCalendar: typeof resortCalendar;
};

type StatCardProps = {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  color?: string; // Tailwind class for icon color
};


const StatCard = ({ title, value, Icon, color = "text-blue-500" }: StatCardProps) => (
  <div className="p-4 border rounded-lg shadow-sm bg-white flex-1">
    <div className="flex items-center space-x-4">
      <Icon className={`w-6 h-6 ${color}`} />
      <div className="truncate">
        <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
        <p className="text-lg font-semibold truncate">{value}</p>
      </div>
    </div>
  </div>
);

const calendarStatus: Record<CalendarStatus, string> = {
  available: "bg-green-500",
  booked: "bg-red-500",
  blocked: "bg-gray-400",
};

function ResortCalendar({ resortId, resortCalendar }: ResortCalendarProps) {
  const daysData = resortCalendar[resortId]?.days ?? [];
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-7 gap-2 overflow-x-auto">
      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
        <div key={d} className="text-xs text-center text-muted-foreground">{d}</div>
      ))}

      {days.map(day => {
        const dayInfo = daysData.find(d => d.day === day);
        const status = (dayInfo?.status ?? "available") as CalendarStatus;

        return (
          <div key={day} className="flex flex-col items-center">
            <span className="text-xs">{day}</span>
            <span className={`h-3 w-3 rounded ${calendarStatus[status]}`} />
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboard() {
  const [selectedResort, setSelectedResort] = useState<ResortId>(resorts[0].id as ResortId);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of resort operations</p>
        </div>
        <Select value={selectedResort} onValueChange={(val) => setSelectedResort(val as ResortId)}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Select resort" />
          </SelectTrigger>
          <SelectContent>
            {resorts.map(r => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard Icon={CalendarDays} title="Total Bookings Today" value={42} color="text-green-500"/>
        <StatCard
          Icon={BedDouble}
          title="Vacant Rooms"
          value={resorts.find(r => r.id === selectedResort)?.vacantToday ?? 0}
          color="text-purple-500"
        />
        <StatCard Icon={Users} title="Total Guests Today" value={116} color="text-orange-500"/>
        <StatCard Icon={LogOut} title="Expected Checkouts" value={18} color="text-red-500" />
      </div>

      {/* Payment + Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentBreakdown} dataKey="value" outerRadius={90} label>
                    {paymentBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card className="lg:col-span-2 overflow-x-auto">
          <CardHeader>
            <CardTitle>Last 5 Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Resort</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {last5Bookings.map(b => (
                  <TableRow key={b.id}>
                    <TableCell>{b.id}</TableCell>
                    <TableCell>{b.guest}</TableCell>
                    <TableCell>{b.resort}</TableCell>
                    <TableCell>{b.room}</TableCell>
                    <TableCell>
                      <Badge variant={b.status === "Paid" ? "secondary" : b.status === "Pending" ? "outline" : "destructive"}>
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">₹{b.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> 7-Day Forecast Occupancy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancy7Day}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <ReTooltip />
                <Line 
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke={LINE_COLOR} 
                  strokeWidth={2} 
                  dot={{ fill: LINE_COLOR, r: 5 }} 
                  activeDot={{ r: 7 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Availability Calendar</CardTitle>
          <CardDescription>Available (green), Booked (red), Blocked (grey)</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedResort} onValueChange={(val) => setSelectedResort(val as ResortId)}>
            <TabsList className="overflow-x-auto">
              {resorts.map(r => (
                <TabsTrigger key={r.id} value={r.id}>{r.name}</TabsTrigger>
              ))}
            </TabsList>
            {resorts.map(r => (
              <TabsContent key={r.id} value={r.id}>
                <ResortCalendar resortId={r.id as ResortId} resortCalendar={resortCalendar} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
