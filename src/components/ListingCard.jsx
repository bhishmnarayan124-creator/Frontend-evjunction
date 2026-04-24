import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import {
  Calendar,
  MapPin,
  Battery,
  Gauge,
  Eye,
  MessageSquare,
  Heart,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const ListingCard = ({ car, idx, onDeleteListing, formatPrice }) => {
  const getStatusBadge = (status) => {
    const styles = {
      pending: {
        bg: "bg-[rgba(251,191,36,0.12)]",
        text: "text-[var(--yellow)]",
        icon: "⏳",
        label: "Pending Review",
      },
      approved: {
        bg: "bg-[var(--accent-dim)]",
        text: "text-[var(--accent)]",
        icon: "✓",
        label: "Approved",
      },
      sold: {
        bg: "bg-[var(--blue-dim)]",
        text: "text-[var(--blue)]",
        icon: "🏷️",
        label: "Sold",
      },
      rejected: {
        bg: "bg-[rgba(239,68,68,0.12)]",
        text: "text-[var(--red)]",
        icon: "✗",
        label: "Rejected",
      },
    };

    return styles[status] || styles.pending;
  };

  const status = getStatusBadge(car.status);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={itemVariants}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: idx * 0.05 }}
      whileHover={{ y: -2 }}
      className="group rounded-2xl overflow-hidden transition-all bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border2)]"
    >
      <div className="flex flex-col lg:flex-row">

        {/* IMAGE */}
        <div className="relative lg:w-64 h-48 lg:h-auto overflow-hidden">
          {car.images?.[0] ? (
            <>
              <img
                src={`${process.env.REACT_APP_BACKEND_URL}${car.images[0]}`}
                alt={`${car.brand} ${car.model}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--bg3)] to-[var(--bg4)]">
              <img
                src="/api/placeholder/400/300"
                alt="Placeholder"
                className="w-16 h-16 opacity-40"
              />
            </div>
          )}

          <Badge
            className={`absolute top-3 right-3 border-none backdrop-blur-sm ${status.bg} ${status.text}`}
          >
            <span className="mr-1">{status.icon}</span>
            {status.label}
          </Badge>
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-6">

          {/* TITLE + META */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-semibold mb-1 font-[var(--font-head)] text-[var(--text)]">
                {car.brand} {car.model}
              </h3>

              <div className="flex flex-wrap gap-3 text-sm text-[var(--text2)]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {car.year}
                </span>

                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {car.city}
                </span>

                <span className="flex items-center gap-1">
                  <Battery className="w-3 h-3" />
                  {car.battery_capacity || "N/A"} kWh
                </span>

                <span className="flex items-center gap-1">
                  <Gauge className="w-3 h-3" />
                  {car.mileage || "N/A"} km
                </span>
              </div>
            </div>

            {/* PRICE */}
            <div className="text-right">
              <div className="text-2xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--purple)] bg-clip-text text-transparent">
                {formatPrice(car.price)}
              </div>

              <div className="text-xs mt-1 text-[var(--text3)]">
                {car.price_negotiable ? "Price Negotiable" : "Fixed Price"}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
            
            <div className="flex gap-4">

              <div className="flex items-center gap-1 text-sm text-[var(--text2)]">
                <Eye className="w-4 h-4" />
                {car.views || 0}
                <span className="text-[var(--text3)]">views</span>
              </div>

              <div className="flex items-center gap-1 text-sm text-[var(--text2)]">
                <MessageSquare className="w-4 h-4" />
                {car.inquiry_count || 0}
                <span className="text-[var(--text3)]">inquiries</span>
              </div>

              <div className="flex items-center gap-1 text-sm text-[var(--text2)]">
                <Heart className="w-4 h-4" />
                {car.favorites_count || 0}
                <span className="text-[var(--text3)]">saves</span>
              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2">
              <Link to={`/marketplace/${car._id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg3)]"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                className="border-[rgba(239,68,68,0.35)] text-[var(--red)] hover:bg-[rgba(239,68,68,0.08)]"
                onClick={() => onDeleteListing(car._id)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
};