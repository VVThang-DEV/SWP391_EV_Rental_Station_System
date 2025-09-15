import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { TranslationProvider } from "@/contexts/TranslationContext";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Vehicles from "./pages/Vehicles";
import VehicleDetails from "./pages/VehicleDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BookingPage from "./pages/BookingPage";
import Stations from "./pages/Stations";
import StationDetails from "./pages/StationDetails";
import HowItWorks from "./pages/HowItWorks";
import Bookings from "./pages/Bookings";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Help from "./pages/Help";
import Safety from "./pages/Safety";
import NotFound from "./pages/NotFound";
import StaffDashboard from "./pages/StaffDashboard";
import AdminDashboard from "./pages/AdminDashboard";

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
          <BrowserRouter>
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
                <Route path="/stations" element={<Stations />} />
                <Route path="/stations/:id" element={<StationDetails />} />
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
