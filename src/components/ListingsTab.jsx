import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Car, Plus, Loader2 } from "lucide-react";
import { ListingCard } from "./ListingCard";
import { Button } from "@/components/ui/button";

export const ListingsTab = ({
  myListings,
  loading,
  onDeleteListing,
  formatPrice,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  /* =========================
     LOADING STATE
  ========================= */

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-[var(--accent)]" />
        <p className="text-[var(--text2)]">
          Loading your listings...
        </p>
      </div>
    );
  }

  /* =========================
     EMPTY STATE
  ========================= */

  if (myListings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 rounded-2xl bg-[var(--card)] border border-[var(--border)]"
      >
        {/* ICON */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-br from-[var(--accent-dim)] to-[var(--purple-dim)]">
          <Car className="w-12 h-12 text-[var(--accent)]" />
        </div>

        {/* TITLE */}
        <h3 className="text-2xl mb-2 font-[var(--font-head)] text-[var(--text)]">
          No Listings Yet
        </h3>

        {/* DESCRIPTION */}
        <p className="mb-6 max-w-md mx-auto text-[var(--text2)]">
          Start your EV selling journey today and reach thousands of potential buyers
        </p>

        {/* CTA BUTTON */}
        <Link to="/sell">
          <Button className="group bg-[var(--accent)] text-black hover:bg-[var(--accent)]">
            <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
            Create Your First Listing
          </Button>
        </Link>
      </motion.div>
    );
  }

  /* =========================
     LIST VIEW
  ========================= */

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {myListings.map((car, idx) => (
          <ListingCard
            key={car._id}
            car={car}
            idx={idx}
            onDeleteListing={onDeleteListing}
            formatPrice={formatPrice}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};