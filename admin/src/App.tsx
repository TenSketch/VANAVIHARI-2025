import { Routes, Route } from "react-router";
import { Suspense, lazy } from "react";
import LoadingScreen from "./components/shared/LoadingScreen";

const Layout = lazy(() => import('./components/shared/Layout'))
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const ReportPage = lazy(() => import("./pages/dashboard/ReportPage"));
const VanaReportPage = lazy(() => import("./pages/DailyOccupancyReport/VahavihariReport"));
const JunglestarReportPage = lazy(() => import("./pages/DailyOccupancyReport/JungleStarReport"));
const CheckInPage = lazy(() => import("./pages/frontdesk/CheckIn"));
const CheckOutPage = lazy(() => import("./pages/frontdesk/CheckOut"));
const AddRoomPage = lazy(() => import("./pages/rooms/AddRoomPage"));
const AllRoomsPage = lazy(() => import("./pages/rooms/AllRoomsPage"));
const AddGuestPage = lazy(() => import("./pages/guests/AddGuestPage"));
const AllGuestsPage = lazy(() => import("./pages/guests/AllGuestsPage"));
const AddResortsPage = lazy(() => import("./pages/resorts/AddResortsPage"));
const AllResortsPage = lazy(() => import("./pages/resorts/AllResortsPage"));
const AllLogReportsPage = lazy(
  () => import("./pages/logReports/AllLogReportsPage")
);
const LogTablePage = lazy(() => import("./pages/logReports/LogTablePage"));
const AddReservationPage = lazy(
  () => import("./pages/reservation/AddReservationPage")
);
const AllReservationPage = lazy(
  () => import("./pages/reservation/AllReservationPage")
);
const AllCottageTypePage = lazy(
  () => import("./pages/cottageTypes/AllCottageTypePage")
);
const AddCottageTypePage = lazy(
  () => import("./pages/cottageTypes/AddCottageTypePage")
);
const AllRoomAmenitiesPage = lazy(
  () => import("./pages/roomAmenities/AllRoomAmenitiesPage")
);
const AddRoomAmenitiesPage = lazy(
  () => import("./pages/roomAmenities/AddRoomAmenitiesPage")
);

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route path="/dashboard/report" element={<ReportPage />} />
          <Route path="/dailyoccupanyreport/vanavihari" element={<VanaReportPage/>} />
          <Route path="/dailyoccupanyreport/junglestar" element={<JunglestarReportPage/>} />
          <Route path="/frontdesk/checkin" element={<CheckInPage/>} />
          <Route path="/frontdesk/checkout" element={<CheckOutPage/>} />
          <Route path="/rooms/add" element={<AddRoomPage />} />
          <Route path="/rooms/all" element={<AllRoomsPage/>} />
          <Route path="/guests/add" element={<AddGuestPage />} />
          <Route path="/guests/all" element={<AllGuestsPage />} />
          <Route path="/resorts/add" element={<AddResortsPage />} />
          <Route path="/resorts/all" element={<AllResortsPage />} />
          <Route path="/log-reports/all" element={<AllLogReportsPage />} />
          <Route path="/log-reports/table" element={<LogTablePage />} />
          <Route path="/reservation/add" element={<AddReservationPage />} />
          <Route path="/reservation/all" element={<AllReservationPage />} />
          <Route path="/cottage-types/all" element={<AllCottageTypePage />} />
          <Route path="/cottage-types/add" element={<AddCottageTypePage />} />
          <Route
            path="/room-amenities/all"
            element={<AllRoomAmenitiesPage />}
          />
          <Route
            path="/room-amenities/add"
            element={<AddRoomAmenitiesPage />}
          />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
