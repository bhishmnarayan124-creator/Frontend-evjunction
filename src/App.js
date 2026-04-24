import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import ChargerFinder from "./pages/ChargerFinder";
import Marketplace from "./pages/Marketplace";
import SellEV from "./pages/SellEV";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Hotels from "./pages/Hotels";
import TripPlanner from "./pages/TripPlanner";
import CarDetails from "./pages/CarDetails";
import AddHotel from "./pages/AddHotel";
import HotelDetails from "./pages/HotelDtails";
import NotificationsPage from "./pages/Notificationspage";
import AddChargerStation from "./pages/Addchargerstation";
import Wishlist from "./pages/Wishlist";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chargers" element={<ChargerFinder />} />
              <Route path="/marketplace" element={<Marketplace />} />
              {/* <Route path="/marketplace/:id" element={<Marketplace />} /> */}
              <Route path="/sell" element={<SellEV />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/hotels" element={<Hotels />} />
              <Route path="/trip-planner" element={<TripPlanner />} />
              <Route path="/marketplace/:id" element={<CarDetails />} />
              <Route path="/add-hotel" element={<AddHotel />} />
              <Route path="/hotels/:id" element={<HotelDetails />} />
              {/* Add more routes as needed */}
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/add-charger" element={<AddChargerStation/>} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
