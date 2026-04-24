import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  User,
  Settings,
  LogOut,
  MessageSquare,
  Clock,
  MapPin,
  Calendar,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const ProfileTab = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* PROFILE CARD */}
      <div className="lg:col-span-1">
        <div className="rounded-2xl p-6 text-center bg-[var(--card)] border border-[var(--border)]">

          {/* AVATAR */}
          <div className="w-32 h-32 mx-auto mb-4 rounded-full p-[3px] bg-gradient-to-br from-[var(--accent)] to-[var(--purple)]">
            <div className="w-full h-full rounded-full flex items-center justify-center bg-[var(--bg)]">
              <span className="text-4xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--purple)] bg-clip-text text-transparent">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* NAME */}
          <h3 className="text-xl font-semibold font-[var(--font-head)] text-[var(--text)]">
            {user?.name}
          </h3>

          {/* EMAIL */}
          <p className="text-sm mb-3 text-[var(--text2)]">
            {user?.email}
          </p>

          {/* ROLE BADGE */}
          <Badge className="capitalize border-none bg-gradient-to-r from-[var(--accent-dim)] to-[var(--purple-dim)] text-[var(--accent)]">
            {user?.role}
          </Badge>

          {/* LOGOUT BUTTON */}
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <Button
              variant="outline"
              className="w-full border-[rgba(239,68,68,0.35)] text-[var(--red)] hover:bg-[rgba(239,68,68,0.08)]"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* PROFILE DETAILS */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)]">

          {/* HEADER */}
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 font-[var(--font-head)] text-[var(--text)]">
            <Settings className="w-5 h-5 text-[var(--accent)]" />
            Profile Information
          </h2>

          <div className="space-y-4">

            {/* GRID DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* NAME */}
              <div className="p-4 rounded-xl bg-[var(--bg3)]">
                <span className="text-sm flex items-center gap-2 mb-2 text-[var(--text3)]">
                  <User className="w-4 h-4" />
                  Full Name
                </span>
                <p className="font-medium text-[var(--text)]">
                  {user?.name || "Not provided"}
                </p>
              </div>

              {/* EMAIL */}
              <div className="p-4 rounded-xl bg-[var(--bg3)]">
                <span className="text-sm flex items-center gap-2 mb-2 text-[var(--text3)]">
                  <MessageSquare className="w-4 h-4" />
                  Email Address
                </span>
                <p className="font-medium text-[var(--text)]">
                  {user?.email || "Not provided"}
                </p>
              </div>

              {/* PHONE */}
              <div className="p-4 rounded-xl bg-[var(--bg3)]">
                <span className="text-sm flex items-center gap-2 mb-2 text-[var(--text3)]">
                  <Clock className="w-4 h-4" />
                  Phone Number
                </span>
                <p className="font-medium text-[var(--text)]">
                  {user?.phone || "Not provided"}
                </p>
              </div>

              {/* CITY */}
              <div className="p-4 rounded-xl bg-[var(--bg3)]">
                <span className="text-sm flex items-center gap-2 mb-2 text-[var(--text3)]">
                  <MapPin className="w-4 h-4" />
                  Location
                </span>
                <p className="font-medium text-[var(--text)]">
                  {user?.city || "Not provided"}
                </p>
              </div>

            </div>

            {/* MEMBER SINCE */}
            <div className="p-4 rounded-xl bg-[var(--bg3)]">
              <span className="text-sm flex items-center gap-2 mb-2 text-[var(--text3)]">
                <Calendar className="w-4 h-4" />
                Member Since
              </span>

              <p className="font-medium text-[var(--text)]">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "—"}
              </p>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
};