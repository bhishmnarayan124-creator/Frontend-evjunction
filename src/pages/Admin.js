import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { adminAPI, adminHotelAPI, chargersAPI, evCarsAPI, notificationsAPI } from '../lib/api';
import { io } from "socket.io-client";
import { toast } from 'sonner';
import {
  LayoutDashboard, Car, Zap, Building2, Users,
  Plus, Check, X, Search, Loader2,
  RefreshCw, Bell, LogOut, Eye,
  MapPin, Trash2, Edit2, AlertCircle, CheckCircle2,
  ChevronLeft, ChevronRight, TrendingUp,
  BarChart2, Shield, FileText, Settings, CheckSquare,
  Square, ToggleLeft, ToggleRight,
} from 'lucide-react';

// ✅ CHANGE 1 — add-charger entry NAV se hatayi
const buildNAV = (unreadCount) => [
  { section: 'Overview' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { section: 'Listings' },
  { id: 'pending', label: 'Pending approvals', icon: AlertCircle, badge: 'pending' },
  { id: 'cars-list', label: 'All cars', icon: Car },
  { id: 'chargers-list', label: 'All chargers', icon: MapPin },
  { id: 'hotels-list', label: 'All hotels', icon: Building2 },
  { section: 'People' },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'roles', label: 'Roles & permissions', icon: Shield },
  { section: 'System' },
  { id: 'activity', label: 'Activity logs', icon: FileText },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: 'notifs', unreadBadge: unreadCount },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ✅ CHANGE 2 — add-charger entry PAGE_META se hatayi
const PAGE_META = {
  dashboard: { title: 'Dashboard', sub: 'Platform overview' },
  analytics: { title: 'Analytics', sub: 'Revenue, bookings & usage insights' },
  pending: { title: 'Pending approvals', sub: 'Review car listings before publishing' },
  'cars-list': { title: 'All cars', sub: 'Manage EV car listings' },
  'chargers-list': { title: 'All chargers', sub: 'View and manage charging stations' },
  'hotels-list': { title: 'All hotels', sub: 'View and manage hotel listings' },
  users: { title: 'User management', sub: 'Manage roles and platform access' },
  roles: { title: 'Roles & permissions', sub: 'Configure access levels' },
  activity: { title: 'Activity logs', sub: 'Track admin actions across the platform' },
  notifications: { title: 'Notifications', sub: 'System alerts and updates' },
  settings: { title: 'Settings', sub: 'Platform configuration' },
};

const LIMIT = 20;

/* ── Shared UI ── */
const Badge = ({ children, color = 'gray' }) => {
  const map = {
    green: 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--border)]',
    red: 'bg-[rgba(239,68,68,0.1)] text-[var(--red)] border-[var(--border)]',
    amber: 'bg-[var(--orange-dim)] text-[var(--orange)] border-[var(--border)]',
    blue: 'bg-[var(--blue-dim)] text-[var(--blue)] border-[var(--border)]',
    purple: 'bg-[var(--purple-dim)] text-[var(--purple)] border-[var(--border)]',
    gray: 'bg-[var(--bg3)] text-[var(--text2)] border-[var(--border)]',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[color]}`}>{children}</span>;
};

const StatusDot = ({ status }) => {
  const map = { available: 'bg-[var(--accent)]', occupied: 'bg-amber-500', offline: 'bg-[var(--red)]', maintenance: 'bg-[var(--muted)]', approved: 'bg-[var(--accent)]', pending: 'bg-amber-500' };
  return <span className={`inline-block w-2 h-2 rounded-full mr-1.5 flex-shrink-0 ${map[status] || 'bg-[var(--muted)]'}`} />;
};

const StatCard = ({ icon: Icon, label, value, delta, color, sub }) => {
  const colors = {
    blue: { bg: 'bg-[var(--blue-dim)]', icon: 'text-[var(--blue)]', delta: 'text-[var(--blue)] bg-blue-50' },
    purple: { bg: 'bg-[var(--purple-dim)]', icon: 'text-[var(--purple)]', delta: 'text-[var(--purple)] bg-purple-50' },
    amber: { bg: 'bg-[var(--orange-dim)]', icon: 'text-[var(--orange)]', delta: 'text-[var(--orange)] bg-amber-50' },
    green: { bg: 'bg-[var(--accent-dim)]', icon: 'text-[var(--accent)]', delta: 'text-emerald-600 bg-[var(--accent-dim)]' },
    red: { bg: 'bg-[rgba(239,68,68,0.1)]', icon: 'text-[var(--red)]', delta: 'text-red-600 bg-red-50' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}><Icon className={`w-4 h-4 ${c.icon}`} /></div>
        {delta && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.delta}`}>{delta}</span>}
      </div>
      <div className="text-2xl font-semibold text-[var(--text)] leading-none">{value}</div>
      <div className="text-sm text-[var(--text2)] mt-1">{label}</div>
      {sub && <div className="text-xs text-[var(--muted)] mt-0.5">{sub}</div>}
    </div>
  );
};

const FormInput = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs text-[var(--text2)] font-medium">{label}</label>}
    <input className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] placeholder-neutral-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" {...props} />
  </div>
);

const FormSelect = ({ label, options = [], ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs text-[var(--text2)] font-medium">{label}</label>}
    <select className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 cursor-pointer" {...props}>
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  </div>
);

const FormTextarea = ({ label, ...props }) => (
  <div className="flex flex-col gap-1 col-span-2">
    {label && <label className="text-xs text-[var(--text2)] font-medium">{label}</label>}
    <textarea className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] placeholder-neutral-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none" rows={3} {...props} />
  </div>
);

const SectionTitle = ({ children }) => (
  <div className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3 pb-2 border-b border-[var(--border)]">{children}</div>
);

const EmptyState = ({ icon: Icon, title, sub }) => (
  <div className="text-center py-16">
    <div className="w-14 h-14 rounded-full bg-[var(--bg3)] flex items-center justify-center mx-auto mb-4"><Icon className="w-7 h-7 text-[var(--muted)]" /></div>
    <h3 className="text-base font-semibold text-[var(--text)]">{title}</h3>
    <p className="text-sm text-[var(--text2)] mt-1">{sub}</p>
  </div>
);

const Pagination = ({ page, total, limit, onChange }) => {
  const totalPages = Math.ceil(total / limit) || 1;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] bg-[var(--bg3)]">
      <span className="text-xs text-[var(--text2)]">Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</span>
      <div className="flex items-center gap-1">
        <button disabled={page === 1} onClick={() => onChange(page - 1)} className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text2)] hover:bg-[var(--card)] disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft className="w-3.5 h-3.5" /></button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p = i + 1;
          if (totalPages > 5) { if (page <= 3) p = i + 1; else if (page >= totalPages - 2) p = totalPages - 4 + i; else p = page - 2 + i; }
          return <button key={p} onClick={() => onChange(p)} className={`w-7 h-7 rounded-lg text-xs font-medium border transition-colors ${p === page ? 'bg-[var(--accent)] text-black border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text2)] hover:bg-[var(--card)]'}`}>{p}</button>;
        })}
        <button disabled={page === totalPages} onClick={() => onChange(page + 1)} className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text2)] hover:bg-[var(--card)] disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
};

const EditModal = ({ title, fields, data, onSave, onClose, loading }) => {
  const [form, setForm] = useState({ ...data });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg3)] text-[var(--muted)]"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {fields.map(f => {
              if (f.type === 'select') return <div key={f.key} className={f.full ? 'col-span-2' : ''}><FormSelect label={f.label} value={form[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} options={f.options} /></div>;
              if (f.type === 'textarea') return <div key={f.key} className="col-span-2"><FormTextarea label={f.label} value={form[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} /></div>;
              return <div key={f.key} className={f.full ? 'col-span-2' : ''}><FormInput label={f.label} type={f.type || 'text'} value={form[f.key] ?? ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} /></div>;
            })}
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border)]">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg3)]">Cancel</button>
          <button onClick={() => onSave(form)} disabled={loading} className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-[var(--accent)] text-black hover:opacity-90 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const DetailModal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="relative bg-[var(--card)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg3)] text-[var(--muted)]"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </motion.div>
  </div>
);

const DRow = ({ label, value }) => (
  <div className="flex gap-4 py-2.5 border-b border-[var(--border)] last:border-0">
    <span className="text-xs text-[var(--muted)] font-medium w-36 flex-shrink-0 pt-0.5">{label}</span>
    <span className="text-sm text-[var(--text)]">{value || '—'}</span>
  </div>
);

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="relative bg-[var(--card)] rounded-2xl shadow-2xl p-6 max-w-sm w-full z-10">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-500" /></div>
      <h3 className="text-base font-semibold text-[var(--text)] text-center mb-2">Confirm Delete</h3>
      <p className="text-sm text-[var(--text2)] text-center mb-6">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2 text-sm rounded-lg border border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg3)]">Cancel</button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2 text-sm rounded-lg bg-red-600 text-black hover:bg-red-700">Delete</button>
      </div>
    </motion.div>
  </div>
);

const ActivityRow = ({ data }) => {
  const typeStyle = t => ({ approve: { dot: 'bg-[var(--accent)]', badge: 'green', label: 'Approved' }, reject: { dot: 'bg-red-400', badge: 'red', label: 'Rejected' }, delete: { dot: 'bg-red-500', badge: 'red', label: 'Deleted' }, edit: { dot: 'bg-amber-500', badge: 'amber', label: 'Edited' }, add: { dot: 'bg-[var(--accent)]', badge: 'blue', label: 'Added' } }[t] || { dot: 'bg-neutral-400', badge: 'gray', label: t });
  const s = typeStyle(data.type);
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg3)]">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--text)]">
          <span className="font-medium">{data.admin || data.admin_name}</span>
          <span className="text-[var(--text2)]"> {data.action} </span>
          <span className="font-medium">{data.target || data.target_name}</span>
        </p>
        <p className="text-xs text-[var(--muted)] mt-0.5">{data.time || data.created_at}</p>
      </div>
      <Badge color={s.badge}>{s.label}</Badge>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   PAGE: DASHBOARD
══════════════════════════════════════════════════════ */
const PageDashboard = ({ stats, pendingCount, onNav, goExternal, activityLogs }) => (
  <div>
    <div className="grid grid-cols-4 gap-4 mb-6">
      <StatCard icon={Users} label="Total users" value={stats?.users?.total?.toLocaleString() ?? '—'} color="blue" />
      <StatCard icon={Car} label="Car listings" value={stats?.marketplace?.total_listings?.toLocaleString() ?? '—'} color="purple" />
      <StatCard icon={AlertCircle} label="Pending review" value={stats?.marketplace?.pending ?? pendingCount ?? '—'} color="amber" />
      <StatCard icon={Zap} label="Chargers" value={stats?.chargers?.total?.toLocaleString() ?? '—'} color="green" />
    </div>
    <div className="grid grid-cols-5 gap-4">
      <div className="col-span-3 bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--text)]">Recent activity</span>
          <button onClick={() => onNav('activity')} className="text-xs text-[var(--blue)] hover:underline">View all</button>
        </div>
        {activityLogs?.length > 0 ? activityLogs.slice(0, 5).map((log, i) => <ActivityRow key={log._id || i} data={log} />) : <EmptyState icon={FileText} title="No activity yet" sub="Admin actions will appear here" />}
      </div>
      <div className="col-span-2 flex flex-col gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border)]"><span className="text-sm font-semibold text-[var(--text)]">Quick actions</span></div>
          <div className="p-4 grid grid-cols-2 gap-2">
            {[
              { label: 'Add EV car', action: () => goExternal('/sell'), color: 'text-[var(--accent)] bg-blue-50 border-blue-200 hover:bg-[var(--accent-dim)]' },
              // ✅ CHANGE 3 — Dashboard quick action bhi /add-charger route pe
              { label: 'Add charger', action: () => goExternal('/add-charger'), color: 'text-green-700 bg-green-50 border-green-200 hover:bg-[var(--accent-dim)]' },
              { label: 'Add hotel', action: () => goExternal('/add-hotel'), color: 'text-purple-700 bg-purple-50 border-purple-200 hover:bg-[var(--purple-dim)]' },
              { label: 'Review pending', action: () => onNav('pending'), color: 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-[var(--orange-dim)]' },
            ].map((a, i) => (
              <button key={i} onClick={a.action} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors ${a.color}`}>
                <Plus className="w-3.5 h-3.5" />{a.label}
              </button>
            ))}
          </div>
        </div>
        {stats && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
            <p className="text-sm font-semibold text-[var(--text)] mb-4">Platform health</p>
            {stats.health?.map(h => (
              <div key={h.label} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1"><span className="text-[var(--text2)]">{h.label}</span><span className="text-[var(--text)] font-medium">{h.pct}%</span></div>
                <div className="h-1.5 bg-[var(--bg3)] rounded-full overflow-hidden"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${h.pct}%` }} /></div>
              </div>
            )) || <p className="text-xs text-[var(--muted)]">No health data available</p>}
          </div>
        )}
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   PAGE: ANALYTICS
══════════════════════════════════════════════════════ */
const PageAnalytics = ({ analytics, monthlySummary, stats }) => {
  const d = analytics || stats;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Est. Revenue" value={analytics?.revenue ?? '—'} color="green" sub="This month" />
        <StatCard icon={Car} label="Total listings" value={d?.marketplace?.total_listings?.toLocaleString() ?? '—'} color="blue" />
        <StatCard icon={Users} label="Active users" value={d?.users?.total?.toLocaleString() ?? '—'} color="purple" />
        <StatCard icon={Zap} label="Charger sessions" value={analytics?.charger_sessions?.toLocaleString() ?? '—'} color="amber" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: 'Top cities', key: 'top_cities', w: 'w-20' },
          { title: 'Charger type usage', key: 'charger_type_usage', w: 'w-24' },
          { title: 'Top EV brands', key: 'top_brands', w: 'w-20' },
        ].map(({ title, key, w }) => (
          <div key={key} className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border)]"><span className="text-sm font-semibold text-[var(--text)]">{title}</span></div>
            <div className="p-4 space-y-3">
              {analytics?.[key]?.length
                ? analytics[key].map(([label, pct, color], i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`text-xs text-[var(--text2)] flex-shrink-0 ${w}`}>{label}</span>
                    <div className="flex-1 h-1.5 bg-[var(--bg3)] rounded-full overflow-hidden"><div className={`h-full rounded-full ${color || 'bg-[var(--accent)]'}`} style={{ width: pct }} /></div>
                    <span className="text-xs font-medium text-[var(--text)] w-8 text-right">{pct}</span>
                  </div>
                ))
                : <p className="text-xs text-[var(--muted)] py-4 text-center">No data available</p>
              }
            </div>
          </div>
        ))}
      </div>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)]"><span className="text-sm font-semibold text-[var(--text)]">Monthly summary</span></div>
        {monthlySummary?.length
          ? (
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg3)] border-b border-[var(--border)]">
                <tr>{['Month', 'New Users', 'Car Listings', 'Charger Sessions', 'Hotels Added', 'Est. Revenue'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text2)] uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {monthlySummary.map((row, i) => (
                  <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--bg3)]/50 last:border-0">
                    <td className="px-4 py-3 font-medium text-[var(--text)]">{row.month}</td>
                    <td className="px-4 py-3 text-[var(--text2)]">{row.new_users}</td>
                    <td className="px-4 py-3 text-[var(--text2)]">{row.car_listings}</td>
                    <td className="px-4 py-3 text-[var(--text2)]">{row.charger_sessions?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[var(--text2)]">{row.hotels_added}</td>
                    <td className="px-4 py-3 text-[var(--text2)]">{row.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
          : <EmptyState icon={BarChart2} title="No monthly data" sub="Summary will appear once data is available" />
        }
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   PAGE: PENDING APPROVALS
══════════════════════════════════════════════════════ */
const PagePending = ({ cars, onApprove, onReject, onDelete, onView }) => {
  const [selected, setSelected] = useState(new Set());
  const [confirm, setConfirm] = useState(null);

  const formatPrice = p => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
    return `₹${(p / 1000).toFixed(0)}K`;
  };

  const toggleAll = () => setSelected(selected.size === cars.length ? new Set() : new Set(cars.map(c => c.id || c._id)));
  const toggle = id => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };

  if (cars.length === 0) return <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl"><EmptyState icon={CheckCircle2} title="All clear!" sub="No pending listings to review." /></div>;

  return (
    <>
      {confirm && <ConfirmDialog message="Permanently delete this car listing?" onConfirm={() => { onDelete(confirm); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg3)]">
          <div className="flex items-center gap-3">
            <button onClick={toggleAll} className="text-[var(--muted)] hover:text-[var(--text2)]">{selected.size === cars.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}</button>
            <span className="text-sm font-semibold text-[var(--text)]">Pending car approvals</span>
            <Badge color="amber">{cars.length} pending</Badge>
          </div>
          {selected.size > 0 && (
            <div className="flex gap-2">
              <button onClick={() => { selected.forEach(id => onApprove(id)); setSelected(new Set()); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-black text-xs font-medium hover:bg-emerald-700"><Check className="w-3.5 h-3.5" /> Approve all ({selected.size})</button>
              <button onClick={() => { selected.forEach(id => onReject(id)); setSelected(new Set()); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50"><X className="w-3.5 h-3.5" /> Reject all</button>
            </div>
          )}
        </div>
        <AnimatePresence>
          {cars.map(car => {
            const cid = car.id || car._id;
            return (
              <motion.div key={cid} initial={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }} transition={{ duration: 0.25 }}
                className={`flex gap-4 px-5 py-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg3)] ${selected.has(cid) ? 'bg-blue-50/40' : ''}`}>
                <button onClick={() => toggle(cid)} className="text-[var(--muted)] hover:text-[var(--text2)] flex-shrink-0 mt-1">{selected.has(cid) ? <CheckSquare className="w-4 h-4 text-[var(--blue)]" /> : <Square className="w-4 h-4" />}</button>
                <div className="w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--bg3)] flex items-center justify-center">
                  {car.images?.[0] ? (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL || "http://localhost:5001"}${car.images[0]}`}
                      alt="car"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Car className="w-7 h-7 text-[var(--muted)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div><h3 className="text-sm font-semibold text-[var(--text)]">{car.brand} {car.model}</h3><p className="text-xs text-[var(--text2)] mt-0.5">{car.year} · {car.city} · {car.seller_name}</p></div>
                    <span className="text-sm font-semibold text-[var(--accent)] flex-shrink-0">{formatPrice(car.price)}</span>
                  </div>
                  <p className="text-xs text-[var(--text2)] mt-2 line-clamp-1 leading-relaxed">{car.description || 'No description'}</p>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {car.range && <Badge color="gray">{car.range} km</Badge>}
                    {car.charger_type && <Badge color="blue">{car.charger_type}</Badge>}
                    {car.odometer && <Badge color="gray">{(car.odometer / 1000).toFixed(0)}K km</Badge>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0 justify-center">
                  <button onClick={() => onView(car)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text2)] text-xs font-medium hover:bg-[var(--bg3)]"><Eye className="w-3.5 h-3.5" /> View</button>
                  <button onClick={() => onApprove(cid)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-black text-xs font-medium hover:bg-emerald-700"><Check className="w-3.5 h-3.5" /> Approve</button>
                  <button onClick={() => onReject(cid)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50"><X className="w-3.5 h-3.5" /> Reject</button>
                  <button onClick={() => setConfirm(cid)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted)] text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════
   PAGE: ALL CARS LIST
══════════════════════════════════════════════════════ */
const PageCarsList = ({ cars, total, page, limit, onPageChange, onDelete, onEdit, onView, goExternal }) => {
  const [q, setQ] = useState(''); const [statusF, setStatusF] = useState('all'); const [confirm, setConfirm] = useState(null);
  const filtered = cars.filter(c => `${c.brand} ${c.model} ${c.city}`.toLowerCase().includes(q.toLowerCase()) && (statusF === 'all' || c.status === statusF));
  const fmt = p => p >= 10000000 ? `₹${(p / 10000000).toFixed(1)} Cr` : p >= 100000 ? `₹${(p / 100000).toFixed(1)} L` : `₹${(p / 1000).toFixed(0)}K`;
  return (
    <>
      {confirm && <ConfirmDialog message="Permanently delete this car listing?" onConfirm={() => { onDelete(confirm); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search cars..." className="pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-blue-400 w-56" /></div>
          {['all', 'approved', 'pending', 'rejected'].map(f => <button key={f} onClick={() => setStatusF(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${statusF === f ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-blue-200' : 'bg-[var(--card)] text-[var(--text2)] border-[var(--border)] hover:bg-[var(--bg3)]'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>)}
          <button onClick={() => goExternal('/sell')} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--accent)] text-black hover:opacity-90"><Plus className="w-3.5 h-3.5" /> Add car</button>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg3)] border-b border-[var(--border)]"><tr>{['Car', 'Price', 'City', 'Seller', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text2)] uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id || c._id} className="border-b border-[var(--border)] hover:bg-[var(--bg3)]/50 last:border-0">
                  <td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="w-10 h-8 rounded-lg bg-[var(--bg3)] overflow-hidden flex-shrink-0 flex items-center justify-center">{c.images?.[0] ? (<img src={`${process.env.REACT_APP_BACKEND_URL}${c.images[0]}`} alt="" className="w-full h-full object-cover" />) : (<Car className="w-4 h-4 text-[var(--muted)]" />)}</div><div><div className="font-medium text-[var(--text)]">{c.brand} {c.model}</div><div className="text-xs text-[var(--muted)]">{c.year}</div></div></div></td>
                  <td className="px-4 py-3 text-[var(--text)] font-medium">{fmt(c.price)}</td>
                  <td className="px-4 py-3 text-[var(--text2)]">{c.city}</td>
                  <td className="px-4 py-3 text-[var(--text2)]">{c.seller_name}</td>
                  <td className="px-4 py-3"><Badge color={c.status === 'approved' ? 'green' : c.status === 'rejected' ? 'red' : 'amber'}>{c.status}</Badge></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1.5"><button onClick={() => onView(c)} className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-blue-50 hover:text-[var(--blue)]" title="View"><Eye className="w-3.5 h-3.5" /></button><button onClick={() => onEdit(c)} className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-amber-50 hover:text-[var(--orange)]" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={() => setConfirm(c.id || c._id)} className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-red-50 hover:text-red-600" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState icon={Car} title="No cars found" sub="Try adjusting your search or filters" />}
          <Pagination page={page} total={total || filtered.length} limit={limit} onChange={onPageChange} />
        </div>
      </div>
    </>
  );
};

const CHARGER_EDIT_FIELDS = [
  { key: 'name', label: 'Station name', full: true }, { key: 'city', label: 'City' }, { key: 'state', label: 'State' }, { key: 'address', label: 'Address', full: true },
  { key: 'chargerType', label: 'Charger type', type: 'select', options: ['DC Fast', 'AC Level 2', 'AC Level 1', 'CCS', 'CHAdeMO', 'Type 2'] },
  { key: 'powerKw', label: 'Power (kW)', type: 'number' }, { key: 'pricePerKwh', label: 'Price/kWh', type: 'number' }, { key: 'networkProvider', label: 'Network operator' },
  { key: 'status', label: 'Status', type: 'select', options: ['available', 'occupied', 'maintenance', 'offline'] }, { key: 'contactPhone', label: 'Contact phone' },
];
const HOTEL_EDIT_FIELDS = [
  { key: 'name', label: 'Hotel name', full: true }, { key: 'city', label: 'City' }, { key: 'state', label: 'State' }, { key: 'address', label: 'Address', full: true },
  { key: 'price_per_night', label: 'Price/night (₹)', type: 'number' }, { key: 'star_rating', label: 'Star rating', type: 'select', options: ['3 Star', '4 Star', '5 Star', 'Budget', 'Luxury'] },
  { key: 'chargers_available', label: 'EV Chargers', type: 'number' }, { key: 'charger_type', label: 'Charger type', type: 'select', options: ['DC Fast (150kW)', 'AC Level 2', 'Mixed DC + AC', 'AC Level 1'] },
  { key: 'contactPhone', label: 'Contact phone' }, { key: 'website', label: 'Website' },
];
const USER_EDIT_FIELDS = [
  { key: 'name', label: 'Full name', full: true }, { key: 'email', label: 'Email', full: true }, { key: 'phone', label: 'Phone' },
  { key: 'role', label: 'Role', type: 'select', options: ['user', 'dealer', 'moderator', 'support_agent', 'admin', 'super_admin'] },
];
const CAR_EDIT_FIELDS = [
  { key: 'brand', label: 'Brand' }, { key: 'model', label: 'Model' }, { key: 'year', label: 'Year', type: 'number' }, { key: 'price', label: 'Price (₹)', type: 'number' },
  { key: 'city', label: 'City' }, { key: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected'] },
  { key: 'description', label: 'Description', type: 'textarea', full: true },
];

/* ══════════════════════════════════════════════════════
   PAGE: CHARGERS LIST
   ✅ CHANGE 4 — onNav prop hataya, goExternal prop add kiya
══════════════════════════════════════════════════════ */
const PageChargersList = ({ chargers, total, page, limit, onPageChange, onDelete, onEdit, onView, goExternal }) => {
  const [q, setQ] = useState(''); const [filter, setFilter] = useState('all'); const [selected, setSelected] = useState(new Set()); const [confirm, setConfirm] = useState(null);
  const filtered = chargers.filter(c => `${c.name} ${c.city}`.toLowerCase().includes(q.toLowerCase()) && (filter === 'all' || c.status === filter));
  const toggleAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(c => c._id || c.id)));
  const toggle = id => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };
  return (
    <>
      {confirm && <ConfirmDialog message="Delete this charging station permanently?" onConfirm={() => { onDelete(confirm); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search chargers..." className="pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-blue-400 w-56" /></div>
          {['all', 'available', 'occupied', 'offline'].map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === f ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-blue-200' : 'bg-[var(--card)] text-[var(--text2)] border-[var(--border)] hover:bg-[var(--bg3)]'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>)}
          {selected.size > 0 && <button onClick={() => { selected.forEach(id => onDelete(id)); setSelected(new Set()); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /> Delete ({selected.size})</button>}
          {/* ✅ CHANGE 4 — goExternal('/add-charger') use ho raha hai ab */}
          <button onClick={() => goExternal('/add-charger')} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--accent)] text-black hover:opacity-90"><Plus className="w-3.5 h-3.5" /> Add charger</button>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg3)] border-b border-[var(--border)]"><tr><th className="w-8 px-4 py-3"><button onClick={toggleAll} className="text-[var(--muted)] hover:text-[var(--text2)]">{selected.size === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}</button></th>{['Station', 'City', 'Type', 'Power', 'Price/kWh', 'Status', 'Source', ''].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text2)] uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(c => {
                const id = c._id || c.id; return (
                  <tr key={id} className={`border-b border-[var(--border)] hover:bg-[var(--bg3)]/50 last:border-0 ${selected.has(id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-4 py-3"><button onClick={() => toggle(id)} className="text-[var(--muted)] hover:text-[var(--text2)]">{selected.has(id) ? <CheckSquare className="w-4 h-4 text-[var(--blue)]" /> : <Square className="w-4 h-4" />}</button></td>
                    <td className="px-4 py-3"><div className="font-medium text-[var(--text)]">{c.name}</div><div className="text-xs text-[var(--muted)] truncate max-w-[180px]">{c.address}</div></td>
                    <td className="px-4 py-3 text-[var(--text2)]">{c.city}</td>
                    <td className="px-4 py-3"><Badge color="blue">{c.chargerType || c.charger_type}</Badge></td>
                    <td className="px-4 py-3 text-[var(--text2)]">{c.powerKw || c.power_kw} kW</td>
                    <td className="px-4 py-3 text-[var(--text2)]">₹{c.pricePerKwh || c.price_per_kwh}</td>
                    <td className="px-4 py-3"><span className="flex items-center"><StatusDot status={c.status} />{c.status}</span></td>
                    <td className="px-4 py-3"><Badge color="gray">{c.source}</Badge></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1"><button onClick={() => onView(c)} className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-blue-50 hover:text-[var(--blue)]" title="View"><Eye className="w-3.5 h-3.5" /></button><button onClick={() => onEdit(c)} className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-amber-50 hover:text-[var(--orange)]" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={() => setConfirm(id)} className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-red-50 hover:text-red-600" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState icon={Zap} title="No chargers found" sub="Try adjusting your search or filters" />}
          <Pagination page={page} total={total || filtered.length} limit={limit} onChange={onPageChange} />
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════
   PAGE: HOTELS LIST
══════════════════════════════════════════════════════ */
const PageHotelsList = ({ hotels, total, page, limit, onPageChange, onApprove, onReject, onDelete, onEdit, onView, goExternal }) => {
  const [filter, setFilter] = useState('all'); const [selected, setSelected] = useState(new Set()); const [confirm, setConfirm] = useState(null);
  const filtered = hotels.filter(h => filter === 'all' || h.status === filter);
  const toggleAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(h => h._id)));
  const toggle = id => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };
  return (
    <>
      {confirm && <ConfirmDialog message="Delete this hotel permanently?" onConfirm={() => { onDelete(confirm); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
      <div>
        <div className="flex items-center gap-3 mb-4">
          {['all', 'approved', 'pending'].map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === f ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-blue-200' : 'bg-[var(--card)] text-[var(--text2)] border-[var(--border)] hover:bg-[var(--bg3)]'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>)}
          {selected.size > 0 && <button onClick={() => { selected.forEach(id => onDelete(id)); setSelected(new Set()); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /> Delete ({selected.size})</button>}
          <button onClick={() => goExternal('/add-hotel')} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--accent)] text-black hover:opacity-90"><Plus className="w-3.5 h-3.5" /> Add hotel</button>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg3)] border-b border-[var(--border)]"><tr><th className="w-8 px-4 py-3"><button onClick={toggleAll} className="text-[var(--muted)] hover:text-[var(--text2)]">{selected.size === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}</button></th>{['Hotel', 'City', 'Price/night', 'EV chargers', 'Views', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text2)] uppercase tracking-wider">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(h => (
                <tr key={h._id} className={`border-b border-[var(--border)] hover:bg-[var(--bg3)]/50 last:border-0 ${selected.has(h._id) ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-4 py-3"><button onClick={() => toggle(h._id)} className="text-[var(--muted)] hover:text-[var(--text2)]">{selected.has(h._id) ? <CheckSquare className="w-4 h-4 text-[var(--blue)]" /> : <Square className="w-4 h-4" />}</button></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-[var(--bg3)] flex items-center justify-center flex-shrink-0 overflow-hidden">{h.images?.[0] ? <img src={`${process.env.REACT_APP_BACKEND_URL || ''}${h.images[0]}`} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-4 h-4 text-[var(--muted)]" />}</div><span className="font-medium text-[var(--text)]">{h.name}</span></div></td>
                  <td className="px-4 py-3 text-[var(--text2)]">{h.city}</td>
                  <td className="px-4 py-3 text-[var(--text2)]">₹{h.price_per_night?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-[var(--text2)]">{h.chargers_available}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1 text-[var(--text2)] text-xs"><Eye className="w-3 h-3" />{h.view_count || 0}</span></td>
                  <td className="px-4 py-3"><Badge color={h.status === 'approved' ? 'green' : 'amber'}>{h.status}</Badge></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1">
                    <button onClick={() => onView(h)} className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-blue-50 hover:text-[var(--blue)]" title="View"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onEdit(h)} className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-amber-50 hover:text-[var(--orange)]" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                    {h.status === 'pending' && <><button onClick={() => onApprove(h._id)} className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--accent-dim)] hover:text-emerald-600" title="Approve"><Check className="w-3.5 h-3.5" /></button><button onClick={() => onReject(h._id, 'Does not meet criteria')} className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-amber-50 hover:text-[var(--orange)]" title="Reject"><X className="w-3.5 h-3.5" /></button></>}
                    <button onClick={() => setConfirm(h._id)} className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-red-50 hover:text-red-600" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState icon={Building2} title="No hotels found" sub="Try adjusting your filters" />}
          <Pagination page={page} total={total || filtered.length} limit={limit} onChange={onPageChange} />
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════
   PAGE: USERS
══════════════════════════════════════════════════════ */
const PageUsers = ({ users, total, page, limit, onPageChange, onRoleChange, onStatusChange, onEdit }) => {
  const [q, setQ] = useState(''); const [filter, setFilter] = useState('all'); const [selected, setSelected] = useState(new Set()); const [bulkRole, setBulkRole] = useState('');
  const filtered = users.filter(u => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()) && (filter === 'all' || u.role === filter));
  const roleColor = r => ({ admin: 'red', super_admin: 'red', dealer: 'purple', moderator: 'blue', support_agent: 'green', user: 'gray' }[r] || 'gray');
  const toggleAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(u => u.id || u._id)));
  const toggle = id => { const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s); };
  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-shrink-0"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search users..." className="pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-blue-400 w-56" /></div>
        {['all', 'admin', 'dealer', 'user'].map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === f ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-blue-200' : 'bg-[var(--card)] text-[var(--text2)] border-[var(--border)] hover:bg-[var(--bg3)]'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>)}
        {selected.size > 0 && <div className="flex items-center gap-2 ml-2"><select value={bulkRole} onChange={e => setBulkRole(e.target.value)} className="px-2 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:border-blue-400"><option value="">Set role…</option>{['user', 'dealer', 'moderator', 'support_agent', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}</select><button disabled={!bulkRole} onClick={() => { selected.forEach(id => onRoleChange(id, bulkRole)); setSelected(new Set()); setBulkRole(''); }} className="px-3 py-1.5 text-xs rounded-lg bg-[var(--accent)] text-black hover:opacity-90 disabled:opacity-40">Apply to {selected.size}</button></div>}
      </div>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg3)] border-b border-[var(--border)]"><tr><th className="w-8 px-4 py-3"><button onClick={toggleAll} className="text-[var(--muted)] hover:text-[var(--text2)]">{selected.size === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}</button></th>{['User', 'Email', 'Role', 'Status', 'Listings', 'Joined', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text2)] uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(u => {
              const uid = u.id || u._id; const isActive = u.is_active !== false; return (
                <tr key={uid} className={`border-b border-[var(--border)] hover:bg-[var(--bg3)]/50 last:border-0 ${selected.has(uid) ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-4 py-3"><button onClick={() => toggle(uid)} className="text-[var(--muted)] hover:text-[var(--text2)]">{selected.has(uid) ? <CheckSquare className="w-4 h-4 text-[var(--blue)]" /> : <Square className="w-4 h-4" />}</button></td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="w-7 h-7 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] flex items-center justify-center text-xs font-semibold flex-shrink-0">{u.name?.slice(0, 2).toUpperCase()}</div><span className="font-medium text-[var(--text)]">{u.name}</span></div></td>
                  <td className="px-4 py-3 text-[var(--text2)]">{u.email}</td>
                  <td className="px-4 py-3"><Badge color={roleColor(u.role)}>{u.role}</Badge></td>
                  <td className="px-4 py-3"><button onClick={() => onStatusChange(uid, !isActive)} className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border transition-colors ${isActive ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}>{isActive ? <><ToggleRight className="w-3.5 h-3.5" /> Active</> : <><ToggleLeft className="w-3.5 h-3.5" /> Inactive</>}</button></td>
                  <td className="px-4 py-3 text-[var(--text2)]">{u.listings_count ?? 0}</td>
                  <td className="px-4 py-3 text-[var(--text2)] text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => onEdit(u)} className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-amber-50 hover:text-[var(--orange)]" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button><select value={u.role} onChange={e => onRoleChange(uid, e.target.value)} className="px-2 py-1 text-xs rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text)] focus:outline-none focus:border-blue-400 cursor-pointer">{['user', 'dealer', 'moderator', 'support_agent', 'admin', 'super_admin'].map(r => <option key={r} value={r}>{r}</option>)}</select></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState icon={Users} title="No users found" sub="Try adjusting your search or filters" />}
        <Pagination page={page} total={total || filtered.length} limit={limit} onChange={onPageChange} />
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   PAGE: ROLES
══════════════════════════════════════════════════════ */
const PageRoles = () => {
  const roles = [
    { role: 'super_admin', color: 'red', perms: ['All permissions', 'Delete admins', 'System config'] },
    { role: 'admin', color: 'red', perms: ['Approve listings', 'Manage users', 'View analytics'] },
    { role: 'moderator', color: 'blue', perms: ['Approve/reject listings', 'View all data'] },
    { role: 'support_agent', color: 'green', perms: ['View users', 'Handle complaints'] },
    { role: 'dealer', color: 'purple', perms: ['Create car listings', 'View own listings'] },
    { role: 'user', color: 'gray', perms: ['Browse listings', 'Book hotels', 'Find chargers'] },
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      {roles.map(r => (
        <div key={r.role} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3"><Badge color={r.color}>{r.role}</Badge><Shield className="w-4 h-4 text-neutral-300" /></div>
          <ul className="space-y-1.5">{r.perms.map(p => <li key={p} className="flex items-center gap-2 text-xs text-[var(--text2)]"><Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />{p}</li>)}</ul>
        </div>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   PAGE: ACTIVITY LOGS
══════════════════════════════════════════════════════ */
const PageActivity = ({ logs }) => (
  <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
    <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg3)]">
      <span className="text-sm font-semibold text-[var(--text)]">Admin activity log</span>
      <Badge color="gray">{logs?.length || 0} entries</Badge>
    </div>
    {logs?.length ? logs.map((log, i) => <ActivityRow key={log._id || i} data={log} />) : <EmptyState icon={FileText} title="No activity yet" sub="Admin actions will appear here" />}
  </div>
);

/* ══════════════════════════════════════════════════════
   PAGE: NOTIFICATIONS
══════════════════════════════════════════════════════ */
const PageNotifications = ({ notifications: apiNotifs, onUnreadUpdate }) => {
  const [notifs, setNotifs] = useState(apiNotifs || []);

  useEffect(() => { if (apiNotifs) setNotifs(apiNotifs); }, [apiNotifs]);

  const markOne = async (id) => {
    setNotifs(n => n.map(x => (x.id || x._id) === id ? { ...x, is_read: true } : x));
    try {
      await adminAPI.markNotificationRead(id)
    } catch (err) {
      console.error('Mark read failed:', err);
    }
    onUnreadUpdate?.(id);
  };

  const markAll = async () => {
    setNotifs(n => n.map(x => ({ ...x, is_read: true })));
    try {
      await adminAPI.markAllNotificationsRead();
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
    onUnreadUpdate?.("all");
  };

  const typeIcon = t => ({ car: <Car className="w-4 h-4" />, hotel: <Building2 className="w-4 h-4" />, charger: <Zap className="w-4 h-4" />, user: <Users className="w-4 h-4" /> }[t] || <Bell className="w-4 h-4" />);
  const typeBg = t => ({ car: 'bg-[var(--accent-dim)] text-[var(--blue)]', hotel: 'bg-[var(--purple-dim)] text-[var(--purple)]', charger: 'bg-[var(--accent-dim)] text-[var(--accent)]', user: 'bg-[var(--orange-dim)] text-[var(--orange)]' }[t] || 'bg-[var(--bg3)] text-[var(--text2)]');
  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg3)]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--text)]">Notifications</span>
          {unread > 0 && <Badge color="red">{unread} unread</Badge>}
        </div>
        {unread > 0 && <button onClick={markAll} className="text-xs text-[var(--blue)] hover:underline">Mark all read</button>}
      </div>
      {notifs.length
        ? notifs.map(n => {
          const nid = n.id || n._id;
          return (
            <div key={nid} onClick={() => markOne(nid)}
              className={`flex items-start gap-4 px-5 py-4 border-b border-[var(--border)] last:border-0 cursor-pointer hover:bg-[var(--bg3)] transition-colors ${!n.is_read ? 'bg-blue-50/20' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${typeBg(n.type)}`}>{typeIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.is_read ? 'font-semibold text-[var(--text)]' : 'font-medium text-[var(--text)]'}`}>{n.title}</p>
                <p className="text-xs text-[var(--text2)] mt-0.5">{n.body || n.message}</p>
                <p className="text-xs text-[var(--muted)] mt-1">{n.time || n.created_at}</p>
              </div>
              {!n.is_read && <span className="w-2 h-2 rounded-full bg-[var(--accent)] flex-shrink-0 mt-2" />}
            </div>
          );
        })
        : <EmptyState icon={Bell} title="No notifications" sub="You're all caught up!" />
      }
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   PAGE: SETTINGS
══════════════════════════════════════════════════════ */
const PageSettings = () => {
  const [settings, setSettings] = useState({ siteName: 'EV Junctions', supportEmail: 'hello@evjunctions.in', supportPhone: '+91 12345 67890', autoApprove: false, emailNotifications: true, maintenanceMode: false, listingLimit: 50 });
  const set = (k, v) => setSettings(p => ({ ...p, [k]: v }));
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg3)]"><h3 className="text-sm font-semibold text-[var(--text)]">General settings</h3></div>
        <div className="p-6 space-y-4">
          <FormInput label="Platform name" value={settings.siteName} onChange={e => set('siteName', e.target.value)} />
          <FormInput label="Support email" value={settings.supportEmail} onChange={e => set('supportEmail', e.target.value)} />
          <FormInput label="Support phone" value={settings.supportPhone} onChange={e => set('supportPhone', e.target.value)} />
          <FormInput label="Listing limit per page" type="number" value={settings.listingLimit} onChange={e => set('listingLimit', Number(e.target.value))} />
        </div>
      </div>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg3)]"><h3 className="text-sm font-semibold text-[var(--text)]">Feature toggles</h3></div>
        <div className="p-6 space-y-4">
          {[
            { key: 'autoApprove', label: 'Auto-approve listings', sub: 'Skip manual review for verified dealers' },
            { key: 'emailNotifications', label: 'Email notifications', sub: 'Send admin alerts via email' },
            { key: 'maintenanceMode', label: 'Maintenance mode', sub: 'Show maintenance page to all users' },
          ].map(f => (
            <div key={f.key} className="flex items-center justify-between py-2">
              <div><p className="text-sm font-medium text-[var(--text)]">{f.label}</p><p className="text-xs text-[var(--text2)] mt-0.5">{f.sub}</p></div>
              <button onClick={() => set(f.key, !settings[f.key])} className={`rounded-full relative transition-colors flex-shrink-0 ${settings[f.key] ? 'bg-[var(--accent)]' : 'bg-neutral-200'}`} style={{ height: '22px', width: '42px' }}>
                <span className="absolute top-0.5 left-0.5 rounded-full bg-[var(--card)] shadow transition-transform" style={{ width: '18px', height: '18px', transform: settings[f.key] ? 'translateX(20px)' : 'translateX(0)' }} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={() => toast.success('Settings saved!')} className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-[var(--accent)] text-black hover:opacity-90"><Check className="w-4 h-4" /> Save settings</button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   MAIN ADMIN COMPONENT
══════════════════════════════════════════════════════ */
const Admin = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [page, setPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [pendingCars, setPendingCars] = useState([]);
  const [cars, setCars] = useState([]);
  const [carsTotal, setCarsTotal] = useState(0);
  const [carsPage, setCarsPage] = useState(1);
  const [chargers, setChargers] = useState([]);
  const [pendingChargers, setPendingChargers] = useState([]);
  const [chargersTotal, setChargersTotal] = useState(0);
  const [chargersPage, setChargersPage] = useState(1);
  const [hotels, setHotels] = useState([]);
  const [hotelsTotal, setHotelsTotal] = useState(0);
  const [hotelsPage, setHotelsPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [editModal, setEditModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [globalQ, setGlobalQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef();

  const refreshUnreadCount = async (id = null) => {
    if (id === "all") {
      setUnreadCount(0);
    } else if (id) {
      setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
    }
    try {
      const res = await notificationsAPI.getUnreadCount();
      const count = res.data.count ?? res.data.unread ?? 0;
      setUnreadCount(count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    const socket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:5000");
    socket.emit("join_admin");
    socket.on("new_notification", (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });
    socket.on("new_activity", (activity) => {
      setLogs(prev => [activity, ...prev]);
    });
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => { refreshUnreadCount(); }, []);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) { navigate('/'); return; }
    fetchStats();
    fetchAnalytics();
    fetchMonthlySummary();
    fetchActivityLogs();
    fetchNotifications();
    fetchInitialData();
  }, [isAuthenticated, isAdmin, navigate]);

  useEffect(() => {
    const h = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationsAPI.getUnreadCount();
      const count = res.data.count ?? res.data.unread ?? 0;
      setUnreadCount(count);
    } catch (err) {
      try {
        const res = await adminAPI.getNotifications();
        const nd = res.data.notifications || res.data || [];
        setUnreadCount(nd.filter(n => !n.is_read).length);
      } catch { /* silent */ }
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await adminAPI.getNotifications();
      const nd = res.data.notifications || res.data || [];
      setNotifications(nd);
      setUnreadCount(nd.filter(n => !n.is_read).length);
    } catch (err) { console.error('Failed to load notifications:', err); }
  };

  const handleUnreadUpdate = async () => {
    try {
      const res = await notificationsAPI.getUnreadCount();
      const count = res.data.count ?? res.data.unread ?? 0;
      setUnreadCount(count);
    } catch {
      try {
        const res = await adminAPI.getNotifications();
        const nd = res.data.notifications || res.data || [];
        setUnreadCount(nd.filter(n => !n.is_read).length);
      } catch { /* silent */ }
    }
  };

  const fetchAnalytics = async () => {
    try { const res = await adminAPI.getAnalytics(); setAnalytics(res.data); } catch (err) { console.error('Analytics failed:', err); }
  };

  const fetchMonthlySummary = async () => {
    try { const res = await adminAPI.getMonthlySummary(); setMonthlySummary(res.data.summary || res.data || []); } catch (err) { console.error('Monthly summary failed:', err); }
  };

  const fetchActivityLogs = async () => {
    try { const res = await adminAPI.getActivityLogs(); setLogs(res.data.logs || res.data || []); } catch (err) { console.error('Activity logs failed:', err); }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [sR, uR, chR, hR, pendR, pendChR] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({ limit: LIMIT, page: 1 }),
        adminAPI.getAllChargers(),
        adminHotelAPI.getAllHotels(),
        adminAPI.getPendingCars(),
        adminAPI.getPendingChargers(), // ✅ ADD THIS
      ]);
      setStats(sR.data);
      setUsers(uR.data.users || uR.data || []); setUsersTotal(uR.data.total || 0);
      setChargers(chR.data.chargers || chR.data || []); setChargersTotal(chR.data.total || 0);
      setHotels(hR.data.hotels || hR.data || []); setHotelsTotal(hR.data.total || 0);
      setPendingCars(pendR.data.cars || pendR.data || []);
      setPendingChargers(pendChR.data.chargers || []);
      const cR = await adminAPI.getAllCars({ limit: LIMIT, page: 1 });
      setCars(cR.data.cars || cR.data || []); setCarsTotal(cR.data.total || 0);
    } catch (err) { console.error('Admin fetch error:', err); toast.error('Failed to load some admin data'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try { const res = await adminAPI.getStats(); setStats(res.data); } catch (err) { console.error('Stats fetch error:', err); }
  };

  const fetchAll = () => {
    fetchStats(); fetchAnalytics(); fetchMonthlySummary();
    fetchActivityLogs(); fetchNotifications(); fetchInitialData();
  };

  const refetchChargers = async p => { try { const r = await adminAPI.getAllChargers({ limit: LIMIT, page: p }); setChargers(r.data.chargers || r.data || []); setChargersTotal(r.data.total || 0); setChargersPage(p); } catch { } };
  const refetchHotels = async p => { try { const r = await adminHotelAPI.getAllHotels({ limit: LIMIT, page: p }); setHotels(r.data.hotels || r.data || []); setHotelsTotal(r.data.total || 0); setHotelsPage(p); } catch { } };
  const refetchUsers = async p => { try { const r = await adminAPI.getUsers({ limit: LIMIT, page: p }); setUsers(r.data.users || r.data || []); setUsersTotal(r.data.total || 0); setUsersPage(p); } catch { } };
  const refetchCars = async p => { try { const r = await adminAPI.getAllCars({ limit: LIMIT, page: p }); setCars(r.data.cars || r.data || []); setCarsTotal(r.data.total || 0); setCarsPage(p); } catch { } };

  const approveCar = async id => { try { await adminAPI.approveCar(id); setPendingCars(p => p.filter(c => (c.id || c._id) !== id)); toast.success('Car approved'); } catch { toast.error('Failed'); } };
  const approveCharger = async (id) => { try { await adminAPI.approveCharger(id); setPendingChargers((prev) => prev.filter((c) => c._id !== id)); toast.success("Charger approved"); } catch { toast.error("Approval failed"); } };
  const rejectCar = async id => { try { await adminAPI.rejectCar(id, 'Does not meet criteria'); setPendingCars(p => p.filter(c => (c.id || c._id) !== id)); toast.success('Car rejected'); } catch { toast.error('Failed'); } };
  const rejectCharger = async (id) => { try { await adminAPI.rejectCharger(id); setPendingChargers((prev) => prev.filter((c) => c._id !== id)); toast.success("Charger rejected"); } catch { toast.error("Reject failed"); } };
  const deleteCar = async id => { try { await adminAPI.deleteCar(id); setCars(c => c.filter(x => (x.id || x._id) !== id)); setPendingCars(p => p.filter(x => (x.id || x._id) !== id)); toast.success('Car deleted'); } catch { toast.error('Failed'); } };
  const updateCar = async (id, data) => { try { await evCarsAPI.update(id, data); setCars(c => c.map(x => (x.id || x._id) === id ? { ...x, ...data } : x)); toast.success('Car updated'); } catch { toast.error('Car update failed'); } };
  const changeUserRole = async (id, role) => { try { await adminAPI.updateUserRole(id, role); setUsers(u => u.map(x => (x.id || x._id) === id ? { ...x, role } : x)); toast.success(`Role → ${role}`); } catch { toast.error('Failed'); } };
  const changeUserStatus = async (id, isActive) => { try { await adminAPI.updateUserStatus(id, isActive); setUsers(u => u.map(x => (x.id || x._id) === id ? { ...x, is_active: isActive } : x)); toast.success(`User ${isActive ? 'activated' : 'deactivated'}`); } catch { toast.error('Failed'); } };
  const deleteCharger = async id => { try { await adminAPI.deleteCharger(id); setChargers(c => c.filter(x => (x._id || x.id) !== id)); toast.success('Charger deleted'); } catch { toast.error('Failed'); } };
  const updateCharger = async (id, data) => { try { await chargersAPI.update(id, data); setChargers(c => c.map(x => (x._id || x.id) === id ? { ...x, ...data } : x)); toast.success('Charger updated'); } catch { toast.error('Failed'); } };
  const approveHotel = async id => { try { await adminHotelAPI.approveHotel(id); setHotels(h => h.map(x => x._id === id ? { ...x, status: 'approved' } : x)); toast.success('Hotel approved'); } catch { toast.error('Failed'); } };
  const rejectHotel = async (id, reason = 'Does not meet criteria') => { try { await adminHotelAPI.rejectHotel(id, reason); setHotels(h => h.map(x => x._id === id ? { ...x, status: 'rejected' } : x)); toast.success('Hotel rejected'); } catch { toast.error('Failed'); } };
  const deleteHotel = async id => { try { await adminHotelAPI.deleteHotel(id); setHotels(h => h.filter(x => x._id !== id)); toast.success('Hotel deleted'); } catch { toast.error('Failed'); } };
  const updateHotel = async (id, data) => {
    try {
      const token = localStorage.getItem('ev_token');
      const base = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
      await fetch(`${base}/api/admin/hotels/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) }, body: JSON.stringify(data) });
      setHotels(h => h.map(x => x._id === id ? { ...x, ...data } : x)); toast.success('Hotel updated');
    } catch { toast.error('Hotel update failed'); }
  };

  const handleSaveEdit = async form => {
    if (!editModal) return;
    setEditLoading(true);
    try {
      const { type, data } = editModal;
      if (type === 'charger') await updateCharger(data._id || data.id, form);
      else if (type === 'hotel') await updateHotel(data._id, form);
      else if (type === 'car') await updateCar(data.id || data._id, form);
      else if (type === 'user') {
        if (form.role !== data.role) await adminAPI.updateUserRole(data.id || data._id, form.role);
        setUsers(u => u.map(x => (x.id || x._id) === (data.id || data._id) ? { ...x, ...form } : x));
        toast.success('User updated');
      }
      setEditModal(null);
    } catch { toast.error('Save failed'); }
    finally { setEditLoading(false); }
  };

  const handleGlobalSearch = useCallback(q => {
    setGlobalQ(q);
    if (!q.trim()) { setSearchResults([]); setShowSearch(false); return; }
    const ql = q.toLowerCase();
    const results = [
      ...users.filter(u => `${u.name} ${u.email}`.toLowerCase().includes(ql)).slice(0, 3).map(u => ({ type: 'user', label: u.name, sub: u.email, action: () => setPage('users') })),
      ...cars.filter(c => `${c.brand} ${c.model} ${c.city}`.toLowerCase().includes(ql)).slice(0, 3).map(c => ({ type: 'car', label: `${c.brand} ${c.model}`, sub: c.city, action: () => setDetailModal({ type: 'car', data: c }) })),
      ...hotels.filter(h => h.name?.toLowerCase().includes(ql)).slice(0, 3).map(h => ({ type: 'hotel', label: h.name, sub: h.city, action: () => setDetailModal({ type: 'hotel', data: h }) })),
      ...chargers.filter(c => c.name?.toLowerCase().includes(ql)).slice(0, 3).map(c => ({ type: 'charger', label: c.name, sub: c.city, action: () => setDetailModal({ type: 'charger', data: c }) })),
    ];
    setSearchResults(results); setShowSearch(results.length > 0);
  }, [users, cars, hotels, chargers]);

  const navTo = id => setPage(id);
  const goExternal = route => navigate(route);

  if (!isAuthenticated || !isAdmin) return null;

  const meta = PAGE_META[page] || { title: page, sub: '' };
  const NAV = buildNAV(unreadCount);
  const searchTypeIcon = t => ({ user: <Users className="w-3.5 h-3.5" />, car: <Car className="w-3.5 h-3.5" />, hotel: <Building2 className="w-3.5 h-3.5" />, charger: <Zap className="w-3.5 h-3.5" /> }[t]);

  return (
    <>
      <AnimatePresence>
        {editModal && (
          <EditModal title={`Edit ${editModal.type}`}
            fields={editModal.type === 'charger' ? CHARGER_EDIT_FIELDS : editModal.type === 'hotel' ? HOTEL_EDIT_FIELDS : editModal.type === 'car' ? CAR_EDIT_FIELDS : USER_EDIT_FIELDS}
            data={editModal.data} onSave={handleSaveEdit} onClose={() => setEditModal(null)} loading={editLoading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailModal && (
          <DetailModal title={`${detailModal.type.charAt(0).toUpperCase() + detailModal.type.slice(1)} details`} onClose={() => setDetailModal(null)}>
            {detailModal.type === 'car' && (<>
              <DRow label="Brand / Model" value={`${detailModal.data.brand} ${detailModal.data.model}`} />
              <DRow label="Year" value={detailModal.data.year} /><DRow label="Price" value={detailModal.data.price ? `₹${Number(detailModal.data.price).toLocaleString('en-IN')}` : '—'} />
              <DRow label="City" value={detailModal.data.city} /><DRow label="Seller" value={detailModal.data.seller_name} /><DRow label="Phone" value={detailModal.data.seller_phone} />
              <DRow label="Range" value={detailModal.data.range ? `${detailModal.data.range} km` : '—'} /><DRow label="Battery" value={detailModal.data.battery_kwh ? `${detailModal.data.battery_kwh} kWh` : '—'} />
              <DRow label="Charger type" value={detailModal.data.charger_type} /><DRow label="Odometer" value={detailModal.data.odometer ? `${Number(detailModal.data.odometer).toLocaleString()} km` : '—'} />
              <DRow label="Status" value={detailModal.data.status} /><DRow label="Description" value={detailModal.data.description} />
            </>)}
            {detailModal.type === 'hotel' && (<>
              <DRow label="Name" value={detailModal.data.name} /><DRow label="City" value={detailModal.data.city} /><DRow label="State" value={detailModal.data.state} />
              <DRow label="Address" value={detailModal.data.address} /><DRow label="Price/night" value={detailModal.data.price_per_night ? `₹${Number(detailModal.data.price_per_night).toLocaleString('en-IN')}` : '—'} />
              <DRow label="Star rating" value={detailModal.data.star_rating} /><DRow label="EV chargers" value={detailModal.data.chargers_available} />
              <DRow label="Charger type" value={detailModal.data.charger_type} /><DRow label="Status" value={detailModal.data.status} /><DRow label="Views" value={detailModal.data.view_count} />
              <DRow label="Amenities" value={Array.isArray(detailModal.data.amenities) ? detailModal.data.amenities.join(', ') : detailModal.data.amenities} />
            </>)}
            {detailModal.type === 'charger' && (<>
              <DRow label="Name" value={detailModal.data.name} /><DRow label="City" value={detailModal.data.city} /><DRow label="State" value={detailModal.data.state} />
              <DRow label="Address" value={detailModal.data.address} /><DRow label="Charger type" value={detailModal.data.chargerType || detailModal.data.charger_type} />
              <DRow label="Power" value={`${detailModal.data.powerKw || detailModal.data.power_kw} kW`} /><DRow label="Price/kWh" value={`₹${detailModal.data.pricePerKwh || detailModal.data.price_per_kwh}`} />
              <DRow label="Connectors" value={detailModal.data.numberOfConnectors || detailModal.data.number_of_connectors} /><DRow label="Status" value={detailModal.data.status} />
              <DRow label="Network" value={detailModal.data.networkProvider || detailModal.data.network_provider} /><DRow label="Source" value={detailModal.data.source} />
              <DRow label="Lat / Lng" value={`${detailModal.data.latitude}, ${detailModal.data.longitude}`} />
              <DRow label="Amenities" value={Array.isArray(detailModal.data.amenities) ? detailModal.data.amenities.join(', ') : detailModal.data.amenities} />
            </>)}
          </DetailModal>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 flex bg-[var(--bg)] overflow-hidden z-10" style={{ paddingTop: '64px' }} data-testid="admin-page">

        {/* SIDEBAR */}
        <aside className="w-56 flex-shrink-0 bg-[var(--card)] border-r border-[var(--border)] flex flex-col overflow-y-auto">
          <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[var(--border)] flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center flex-shrink-0"><Zap className="w-4 h-4 text-black" /></div>
            <div><div className="text-sm font-semibold text-[var(--text)] leading-none">EV Admin</div><div className="text-xs text-[var(--muted)] mt-0.5">Control panel</div></div>
          </div>
          <nav className="flex-1 px-2 py-3">
            {NAV.map((item, i) => {
              if (item.section) return <div key={i} className="px-3 pt-4 pb-1 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">{item.section}</div>;
              const Icon = item.icon; const isActive = page === item.id;
              const badgeCount = item.badge === "pending" ? pendingCars.length + pendingChargers.length : item.badge === "notifs" ? item.unreadBadge || 0 : 0;
              return (
                <button key={item.id} onClick={() => navTo(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm mb-0.5 transition-colors ${isActive ? 'bg-[var(--accent-dim)] text-[var(--accent)] font-medium' : 'text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text)]'}`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {badgeCount > 0 && <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${item.badge === 'notifs' ? 'bg-[rgba(239,68,68,0.1)] text-[var(--red)]' : 'bg-[var(--orange-dim)] text-[var(--orange)]'}`}>{badgeCount}</span>}
                </button>
              );
            })}
          </nav>
          <div className="border-t border-[var(--border)] px-3 py-3 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] flex items-center justify-center text-xs font-semibold flex-shrink-0">{user?.name?.slice(0, 2).toUpperCase() || 'AD'}</div>
              <div className="flex-1 min-w-0"><div className="text-xs font-medium text-[var(--text)] truncate">{user?.name || 'Admin'}</div><div className="text-xs text-[var(--muted)]">Admin</div></div>
              <button onClick={() => navigate('/')} className="p-1 rounded text-[var(--muted)] hover:text-[var(--text2)]" title="Go to site"><LogOut className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-[var(--card)] border-b border-[var(--border)] px-6 py-3.5 flex items-center justify-between flex-shrink-0">
            <div><h1 className="text-base font-semibold text-[var(--text)]">{meta.title}</h1><p className="text-xs text-[var(--text2)] mt-0.5">{meta.sub}</p></div>
            <div className="flex items-center gap-2">
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
                <input placeholder="Search users, cars, hotels…" value={globalQ} onChange={e => handleGlobalSearch(e.target.value)} onFocus={() => globalQ && setShowSearch(true)} className="pl-9 pr-3 py-1.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--bg3)] focus:outline-none focus:border-blue-400 focus:bg-[var(--card)] w-60" />
                <AnimatePresence>
                  {showSearch && searchResults.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute top-full left-0 mt-1 w-72 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden">
                      {searchResults.map((r, i) => (
                        <button key={i} onClick={() => { r.action(); setShowSearch(false); setGlobalQ(''); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg3)] text-left border-b border-[var(--border)] last:border-0">
                          <div className="w-6 h-6 rounded-lg bg-[var(--bg3)] flex items-center justify-center text-[var(--text2)] flex-shrink-0">{searchTypeIcon(r.type)}</div>
                          <div className="min-w-0"><p className="text-xs font-medium text-[var(--text)] truncate">{r.label}</p><p className="text-xs text-[var(--muted)]">{r.sub} · {r.type}</p></div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={() => navTo('notifications')} className="p-2 rounded-lg border border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg3)] relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-black text-xs flex items-center justify-center font-semibold">{unreadCount}</span>}
              </button>
              <button onClick={fetchAll} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] text-[var(--text2)] hover:bg-[var(--bg3)] disabled:opacity-50">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {loading
              ? <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" /></div>
              : (
                <motion.div key={page} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  {page === 'dashboard' && <PageDashboard stats={stats} pendingCount={pendingCars.length} onNav={navTo} goExternal={goExternal} activityLogs={logs} />}
                  {page === 'analytics' && <PageAnalytics analytics={analytics} monthlySummary={monthlySummary} stats={stats} />}
                  {page === 'pending' && <PagePending cars={[...pendingCars, ...pendingChargers]} onApprove={(id) => pendingCars.find((c) => c._id === id) ? approveCar(id) : approveCharger(id)} onReject={(id) => pendingCars.find((c) => c._id === id) ? rejectCar(id) : rejectCharger(id)} onDelete={deleteCar} onView={(data) => setDetailModal({ type: "car", data })} />}
                  {page === 'cars-list' && <PageCarsList cars={cars} total={carsTotal} page={carsPage} limit={LIMIT} onPageChange={refetchCars} onDelete={deleteCar} onEdit={data => setEditModal({ type: 'car', data })} onView={data => setDetailModal({ type: 'car', data })} goExternal={goExternal} />}
                  {/* ✅ CHANGE 5 — add-charger page condition hatayi, goExternal prop add kiya */}
                  {page === 'chargers-list' && <PageChargersList chargers={chargers} total={chargersTotal} page={chargersPage} limit={LIMIT} onPageChange={refetchChargers} onDelete={deleteCharger} onEdit={data => setEditModal({ type: 'charger', data })} onView={data => setDetailModal({ type: 'charger', data })} goExternal={goExternal} />}
                  {page === 'hotels-list' && <PageHotelsList hotels={hotels} total={hotelsTotal} page={hotelsPage} limit={LIMIT} onPageChange={refetchHotels} onApprove={approveHotel} onReject={rejectHotel} onDelete={deleteHotel} onEdit={data => setEditModal({ type: 'hotel', data })} onView={data => setDetailModal({ type: 'hotel', data })} goExternal={goExternal} />}
                  {page === 'users' && <PageUsers users={users} total={usersTotal} page={usersPage} limit={LIMIT} onPageChange={refetchUsers} onRoleChange={changeUserRole} onStatusChange={changeUserStatus} onEdit={data => setEditModal({ type: 'user', data })} />}
                  {page === 'roles' && <PageRoles />}
                  {page === 'activity' && <PageActivity logs={logs} />}
                  {page === 'notifications' && <PageNotifications notifications={notifications} onUnreadUpdate={refreshUnreadCount} />}
                  {page === 'settings' && <PageSettings />}
                </motion.div>
              )
            }
          </div>
        </main>
      </div>
    </>
  );
};

export default Admin;