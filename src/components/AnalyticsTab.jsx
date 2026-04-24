import { motion } from "framer-motion";
import { TrendingUp, Award } from "lucide-react";

export const AnalyticsTab = ({ myListings, stats, formatPrice }) => {
  const calculateEngagementRate = () => {
    const totalViews = myListings.reduce(
      (sum, c) => sum + (c.views || 0),
      0
    );

    const totalInquiries = myListings.reduce(
      (sum, c) => sum + (c.inquiry_count || 0),
      0
    );

    if (totalViews === 0) return "0%";

    return `${((totalInquiries / totalViews) * 100).toFixed(1)}%`;
  };

  /* ================= EMPTY STATE ================= */

  if (myListings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl p-8 bg-[var(--card)] border border-[var(--border)]"
      >
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-[var(--text3)]" />
          <p className="text-[var(--text2)]">
            Create listings to see analytics
          </p>
        </div>
      </motion.div>
    );
  }

  /* ================= MAIN CONTENT ================= */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl p-8 bg-[var(--card)] border border-[var(--border)]"
    >
      {/* HEADER */}

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-[var(--accent-dim)]">
          <TrendingUp className="w-6 h-6 text-[var(--accent)]" />
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[var(--text)]">
            Performance Analytics
          </h2>

          <p className="text-sm text-[var(--text2)]">
            Track your listing performance and insights
          </p>
        </div>
      </div>

      <div className="space-y-6">

        {/* TOP PERFORMING LISTING */}

        {stats.mostViewed && (
          <div className="rounded-xl p-6 bg-gradient-to-r from-[var(--accent-dim)] to-[var(--purple-dim)]">
            <h3 className="mb-4 flex items-center gap-2 text-[var(--text)]">
              <Award className="w-5 h-5 text-[var(--accent)]" />
              Top Performing Listing
            </h3>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-lg font-semibold text-[var(--text)]">
                  {stats.mostViewed.brand} {stats.mostViewed.model}
                </p>

                <p className="text-[var(--text2)]">
                  {stats.mostViewed.year}
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-[var(--accent)]">
                  {stats.mostViewed.views} views
                </p>

                <p className="text-xs text-[var(--text3)]">
                  {stats.mostViewed.inquiry_count || 0} inquiries received
                </p>
              </div>
            </div>
          </div>
        )}

        {/* QUICK STATS GRID */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Average Listing Price",
              value: formatPrice(stats.averagePrice),
            },
            {
              label: "Total Portfolio Value",
              value: formatPrice(stats.totalValue),
            },
            {
              label: "Engagement Rate",
              value: calculateEngagementRate(),
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl p-4 bg-[var(--bg3)] border border-[var(--border)]"
            >
              <div className="text-sm mb-1 text-[var(--text3)]">
                {item.label}
              </div>

              <div className="text-2xl font-bold text-[var(--text)]">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* ADDITIONAL INSIGHTS */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl p-4 bg-[var(--bg3)] border border-[var(--border)]">
            <div className="text-sm mb-1 text-[var(--text3)]">
              Total Listings Created
            </div>

            <div className="text-2xl font-bold text-[var(--text)]">
              {myListings.length}
            </div>
          </div>

          <div className="rounded-xl p-4 bg-[var(--bg3)] border border-[var(--border)]">
            <div className="text-sm mb-1 text-[var(--text3)]">
              Active Listings
            </div>

            <div className="text-2xl font-bold text-[var(--accent)]">
              {myListings.filter((c) => c.status === "approved").length}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};