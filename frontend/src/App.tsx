import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { TranslationProvider } from "@/contexts/TranslationContext";
import Navbar from "./components/Navbar";
import {
  Index,
  Vehicles,
  VehicleDetails,
  VehicleModelFinder,
  ModelStationFinder,
  Login,
  Register,
  PersonalInfoUpdate,
  Dashboard,
  BookingPage,
  Stations,
  StationDetails,
  HowItWorks,
  Bookings,
  Settings,
  ForgotPassword,
  Terms,
  Privacy,
  Contact,
  About,
  Help,
  Safety,
  NotFound,
  StaffDashboard,
  AdminDashboard,
  ApiTest,
} from "./pages/pages";

const queryClient = new QueryClient();

// Enhanced user types for different roles
interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "staff" | "admin";
  stationId?: string; // For staff members
}

const App = () => {
  const [user, setUser] = useState<User | null>(() => {
    // Try to load user from localStorage on app start
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData: User) => {
    setUser(userData);
    // Save user to localStorage
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    // Remove user from localStorage
    localStorage.removeItem("user");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TranslationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <div className="min-h-screen bg-background">
              <Navbar user={user} onLogout={handleLogout} />
              <Routes>
                <Route path="/" element={<Index user={user} />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/vehicles/:id" element={<VehicleDetails />} />
                <Route path="/book/:id" element={<BookingPage />} />
                <Route
                  path="/login"
                  element={<Login onLogin={handleLogin} />}
                />
                <Route
                  path="/register"
                  element={<Register onRegister={handleLogin} />}
                />
                <Route
                  path="/personal-info-update"
                  element={<PersonalInfoUpdate user={user} />}
                />
                <Route
                  path="/dashboard"
                  element={
                    user?.role === "customer" ? (
                      <Dashboard user={user} />
                    ) : user?.role === "staff" ? (
                      <StaffDashboard
                        user={
                          user as {
                            id: string;
                            name: string;
                            email: string;
                            role: "staff";
                            stationId: string;
                          }
                        }
                      />
                    ) : user?.role === "admin" ? (
                      <AdminDashboard
                        user={
                          user as {
                            id: string;
                            name: string;
                            email: string;
                            role: "admin";
                          }
                        }
                      />
                    ) : (
                      <Dashboard user={user} />
                    )
                  }
                />
                {/* Explicit role routes */}
                <Route
                  path="/dashboard/admin"
                  element={
                    user?.role === "admin" ? (
                      <AdminDashboard
                        user={{
                          id: user.id,
                          name: user.name,
                          email: user.email,
                          role: "admin",
                        }}
                      />
                    ) : (
                      <NotFound />
                    )
                  }
                />
                <Route
                  path="/dashboard/staff"
                  element={
                    user?.role === "staff" ? (
                      <StaffDashboard
                        user={{
                          id: user.id,
                          name: user.name,
                          email: user.email,
                          role: "staff",
                          stationId: user.stationId || "",
                        }}
                      />
                    ) : (
                      <NotFound />
                    )
                  }
                />
                <Route path="/stations" element={<Stations />} />
                <Route path="/stations/:id" element={<StationDetails />} />
                <Route
                  path="/vehicle-model-finder"
                  element={<VehicleModelFinder />}
                />
                <Route
                  path="/model/:modelId/stations"
                  element={<ModelStationFinder />}
                />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/help" element={<Help />} />
                <Route path="/safety" element={<Safety />} />
                <Route path="/api-test" element={<ApiTest />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </TranslationProvider>
    </QueryClientProvider>
  );
};

export default App;
