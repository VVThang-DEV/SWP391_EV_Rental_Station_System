// Barrel file for pages after reorganization
export { default as Login } from "./auth/Login/Login";
export { default as Register } from "./auth/Register";
export { default as PersonalInfoUpdate } from "./auth/PersonalInfoUpdate";
export { default as ForgotPassword } from "./auth/ForgotPassword";

export { default as Dashboard } from "./dashboard/Dashboard";
export { default as StaffDashboard } from "./dashboard/StaffDashboard";
export { default as AdminDashboard } from "./dashboard/AdminDashboard";
export { default as Bookings } from "./dashboard/Bookings";
export { default as Settings } from "./dashboard/Settings";

export { default as Vehicles } from "./vehicles/Vehicles";
export { default as VehicleDetails } from "./vehicles/VehicleDetails";
export { default as VehicleModelFinder } from "./vehicles/VehicleModelFinder";
export { default as ModelStationFinder } from "./vehicles/ModelStationFinder";
export { default as BookingPage } from "./vehicles/BookingPage";

export { default as Stations } from "./stations/Stations";
export { default as StationDetails } from "./stations/StationDetails";

export { default as Index } from "./public/Index";
export { default as HowItWorks } from "./public/HowItWorks";
export { default as About } from "./public/About";
export { default as Contact } from "./public/Contact";
export { default as Help } from "./public/Help";
export { default as Safety } from "./public/Safety";
export { default as Terms } from "./public/Terms";
export { default as Privacy } from "./public/Privacy";
export { default as NotFound } from "./public/NotFound";

// API Test component
export { default as ApiTest } from "../components/ApiTest";