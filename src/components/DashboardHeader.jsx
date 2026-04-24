import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DashboardHeader = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <div className="rounded-2xl p-6 backdrop-blur-sm bg-gradient-to-r from-[var(--card)] to-[var(--card2)] border border-[var(--border)]">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          {/* LEFT SECTION */}
          <div className="flex items-center gap-4">

            {/* AVATAR */}
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-[var(--accent)] to-[var(--purple)]">
              
              <div className="w-full h-full rounded-full flex items-center justify-center bg-[var(--bg)]">
                
                <span className="text-2xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--purple)] bg-clip-text text-transparent">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>

              </div>
            </div>

            {/* TEXT */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-head)] bg-gradient-to-r from-[var(--text)] to-[var(--text2)] bg-clip-text text-transparent">
                Welcome back, {user?.name?.split(" ")[0]}! 👋
              </h1>

              <p className="mt-1 flex items-center gap-2 text-[var(--text2)]">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                Your EV marketplace dashboard
              </p>
            </div>

          </div>

          {/* RIGHT BUTTON */}
          <Link to="/sell">
            <Button className="group relative overflow-hidden bg-[var(--accent)] text-black hover:bg-[var(--accent)]">

              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-[var(--accent)] to-[var(--purple)]"></span>

              <span className="relative flex items-center">
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                List Your EV
              </span>

            </Button>
          </Link>

        </div>
      </div>
    </motion.div>
  );
};