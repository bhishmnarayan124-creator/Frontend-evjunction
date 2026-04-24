import { notificationsAPI } from "@/lib/api";
import { useEffect, useState } from "react";



const FILTERS = ["all", "unread", "charger", "offer", "hotel", "alert"];

const badgeConfig = {
  hotel:   { label: "Hotel",   cls: "bg-blue-600 text-white" },
  charger: { label: "Charger", cls: "bg-green-600 text-white" },
  offer:   { label: "Offer",   cls: "bg-orange-500 text-white" },
  alert:   { label: "Alert",   cls: "bg-red-600 text-white" },
};


const getSection = (date) => {
  const now = new Date();
  const d = new Date(date);

  const diff = now - d;
  const day = 1000 * 60 * 60 * 24;

  if (diff < day) return "TODAY";
  if (diff < day * 2) return "YESTERDAY";
  return "EARLIER";
};

const detectType = (type) => {
  if (!type) return "alert";

  if (type.includes("hotel")) return "hotel";
  if (type.includes("charger")) return "charger";
  if (type.includes("offer")) return "offer";

  return "alert";
};

const detectIcon = (type) => {
  if (!type) return "🔔";

  if (type.includes("hotel")) return "🏨";
  if (type.includes("charger")) return "⚡";
  if (type.includes("offer")) return "🏷️";

  return "🔔";
};

function StatCard({ value, label, valueColor = "text-white" }) {
  return (
    <div className="bg-neutral-800 rounded-xl p-5 flex flex-col gap-1">
      <span className={`text-4xl font-bold ${valueColor}`}>{value}</span>
      <span className="text-sm text-neutral-400">{label}</span>
    </div>
  );
}

function NotifItem({ notif, onRead }) {
  return (
    <div
      onClick={() => onRead(notif.id)}
      className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-neutral-800/60 border-b border-neutral-800 last:border-b-0
        ${notif.unread
          ? "border-l-4 border-l-blue-500"
          : "border-l-4 border-l-transparent"
        }`}
    >
      <div className="w-11 h-11 rounded-full bg-neutral-700 flex items-center justify-center text-xl flex-shrink-0 mt-0.5">
        {notif.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${notif.unread ? "text-white" : "text-neutral-300"}`}>
          {notif.title}
        </p>
        <p className="text-sm text-neutral-400 mt-1 leading-relaxed">{notif.desc}</p>
        <p className="text-xs text-neutral-600 mt-1.5">{notif.time}</p>
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0 pt-0.5">
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${badgeConfig[notif.type]?.cls || badgeConfig.alert.cls}`}>
          {badgeConfig[notif.type].label}
        </span>
        {notif.unread && (
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const totalCount  = notifications.length;
  const unreadCount = notifications.filter((n) => n.unread).length;
  const todayCount  = notifications.filter((n) => n.section === "TODAY").length;

  const filtered =
    activeFilter === "all"
      ? notifications
      : activeFilter === "unread"
      ? notifications.filter((n) => n.unread)
      : notifications.filter((n) => n.type === activeFilter);

  const sections = [...new Set(filtered.map((n) => n.section))];

  const markRead = async (id) => {
  try {

    await notificationsAPI.markNotificationRead(id);

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, unread: false } : n
      )
    );

  } catch (err) {
    console.error("Mark read error:", err);
  }
};

  const markAllRead = async () => {
  try {

    await notificationsAPI.markAllNotificationsRead();

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );

  } catch (err) {
    console.error("Mark all read error:", err);
  }
};

 
    useEffect(() => {
     fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
    try {
        const res =
        await notificationsAPI.getMyNotifications();

        const formatted =
        res.data.notifications.map((n) => ({
            id: n._id,
            title: n.title,
            desc: n.message,
            unread: !n.is_read,
            type: detectType(n.type),
            time: new Date(n.createdAt).toLocaleString(),
            section: getSection(n.createdAt),
            icon: detectIcon(n.type),
        }));

        setNotifications(formatted);

    } catch (err) {
        console.error("Notifications error:", err);
    }
    };

  return (
    // mt-16 → navbar ki height (64px) ke barabar top margin
    // Agar aapka navbar 80px ka hai toh mt-20 karein
    // Agar aapka navbar 56px ka hai toh mt-14 karein
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-100 mt-16 pb-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto pt-6">

        {/* Page Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-sm text-neutral-500 mt-1">Updates from EV Junctions admin</p>
          </div>
          <button
            onClick={markAllRead}
            className="text-sm text-white border border-neutral-600 px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Mark all read
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard value={totalCount}  label="Total" />
          <StatCard value={unreadCount} label="Unread" valueColor="text-blue-400" />
          <StatCard value={todayCount}  label="Today" />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-sm px-4 py-2 rounded-lg border capitalize font-medium transition-all ${
                activeFilter === f
                  ? "bg-white text-neutral-900 border-white"
                  : "bg-transparent text-neutral-400 border-neutral-700 hover:border-neutral-500 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-neutral-500 text-sm">
              Koi notification nahi mili
            </div>
          ) : (
            sections.map((section) => (
              <div key={section}>
                <div className="px-5 py-2.5 text-xs font-semibold tracking-widest text-neutral-500 bg-neutral-900 border-b border-neutral-800 uppercase">
                  {section}
                </div>
                {filtered
                  .filter((n) => n.section === section)
                  .map((n) => (
                    <NotifItem key={n.id} notif={n} onRead={markRead} />
                  ))}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}