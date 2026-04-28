import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { evCarsAPI } from "@/lib/api";

import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardStats } from "@/components/DashboardStats";
import { DashboardTabs } from "@/components/DashboardTabs";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("listings");

  const [stats, setStats] = useState({
    totalValue: 0,
    averagePrice: 0,
    mostViewed: null,
  });

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      try {
        const listingsRes = await evCarsAPI.getMyListings();
        const listings = listingsRes.data;

        setMyListings(listings);

        const totalValue = listings.reduce(
          (sum, c) => sum + (c.price || 0),
          0
        );

        const averagePrice = listings.length
          ? totalValue / listings.length
          : 0;

        const mostViewed = listings.reduce(
          (max, c) =>
            (c.views || 0) > (max?.views || 0) ? c : max,
          null
        );

        setStats({ totalValue, averagePrice, mostViewed });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  /* ================= DELETE LISTING ================= */

  const handleDeleteListing = async (carId) => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;

    try {
      await evCarsAPI.delete(carId);

      const updatedListings = myListings.filter(
        (c) => c._id !== carId
      );

      setMyListings(updatedListings);

      // update stats again
      const totalValue = updatedListings.reduce(
        (sum, c) => sum + (c.price || 0),
        0
      );

      const averagePrice = updatedListings.length
        ? totalValue / updatedListings.length
        : 0;

      const mostViewed = updatedListings.reduce(
        (max, c) =>
          (c.views || 0) > (max?.views || 0)
            ? c
            : max,
        null
      );

      setStats({
        totalValue,
        averagePrice,
        mostViewed,
      });

      toast.success("Listing deleted successfully");
    } catch (error) {
      toast.error("Failed to delete listing");
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[var(--bg)] relative">

      {/* BACKGROUND GLOW EFFECTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">

        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--accent)]/5 rounded-full blur-3xl animate-pulse"></div>

        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--purple)]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--blue)]/5 rounded-full blur-3xl"></div>

      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <DashboardHeader user={user} />

        <DashboardStats
          myListings={myListings}
          stats={stats}
          formatPrice={formatPrice}
        />

        <DashboardTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          myListings={myListings}
          loading={loading}
          stats={stats}
          user={user}
          onDeleteListing={handleDeleteListing}
          formatPrice={formatPrice}
        />

      </div>
    </div>
  );
};

/* ================= PRICE FORMATTER ================= */

const formatPrice = (price) => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
  return `₹${(price / 1000).toFixed(0)}K`;
};

export default Dashboard;