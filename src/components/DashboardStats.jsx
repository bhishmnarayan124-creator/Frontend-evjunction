import { motion } from "framer-motion";
import { Car, Eye, Heart, DollarSign, TrendingUp } from "lucide-react";

export const DashboardStats = ({ myListings, stats, formatPrice }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const statCards = [
    {
      icon: Car,
      label: "Active Listings",
      value: myListings.length,
      iconBg: "bg-[var(--accent-dim)]",
      iconColor: "text-[var(--accent)]",
     
    },
    {
      icon: Eye,
      label: "Total Views",
      value: myListings.reduce((sum, c) => sum + (c.views || 0), 0),
      iconBg: "bg-[var(--blue-dim)]",
      iconColor: "text-[var(--blue)]",
      
    },

    // ✅ FAVORITES BOX (NEW)
    {
      icon: Heart,
      label: "Favorites",
      value: myListings.reduce(
        (sum, c) => sum + (c.favorites_count || 0),
        0
      ),
      iconBg: "bg-[var(--purple-dim)]",
      iconColor: "text-[var(--purple)]",
      
    },

    {
      icon: DollarSign,
      label: "Portfolio Value",
      value: formatPrice(stats.totalValue),
      iconBg: "bg-[var(--orange-dim)]",
      iconColor: "text-[var(--orange)]",
      
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
    >
      {statCards.map((stat, idx) => (
        <motion.div
          key={idx}
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className="rounded-2xl p-6 transition-all group bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border2)]"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.iconBg}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>

            {stat.trend !== "—" && (
              <div className="flex items-center gap-1 text-xs text-[var(--accent)]">
                <TrendingUp className="w-3 h-3" />
                <span>{stat.trend}</span>
              </div>
            )}
          </div>

          <div className="text-3xl font-bold mb-1 text-[var(--text)] font-[var(--font-head)]">
            {stat.value}
          </div>

          <div className="text-sm text-[var(--text3)]">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};