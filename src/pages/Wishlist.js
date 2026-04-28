import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Zap, BedDouble, MapPin, Car, Building2, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { wishlistAPI } from '@/lib/api';



/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const fmtPrice = (p) => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(1)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`;
    return `₹${(p / 1000).toFixed(0)}K`;
};






/* ─────────────────────────────────────────────
   HEART BUTTON — reusable across listing pages
───────────────────────────────────────────── */
export const WishlistHeart = ({
    type,
    id,
    savedIds = [],
    className = ""
}) => {
    const [saved, setSaved] = useState(
        savedIds.includes(id)
    );

    useEffect(() => {
        setSaved(savedIds.includes(id));
    }, [savedIds, id]);

    const toggle = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        try {
            if (type === "car") {
                await wishlistAPI.toggleCar(id);
            } else {
                await wishlistAPI.toggleHotel(id);
            }

            setSaved(prev => !prev);

            toast.success(
                saved
                    ? "Removed from wishlist"
                    : "Added to wishlist ♥"
            );
        } catch (err) {
            toast.error("Wishlist update failed");
        }
    };

    return (
        <button
            onClick={toggle}
            className={`flex items-center justify-center w-8 h-8 rounded-full bg-[var(--card)]/90 border border-[var(--border)] shadow-sm transition-transform active:scale-90 hover:scale-110 ${className}`}
        >
            <Heart
                className={`w-4 h-4 transition-colors ${saved
                    ? "fill-red-500 text-red-500"
                    : "text-neutral-400"
                    }`}
            />
        </button>
    );
};

/* ─────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────── */
const EmptyWishlist = ({ filter, onReset }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--accent-dim)] flex items-center justify-center mb-5">
            <Heart className="w-9 h-9 text-red-300" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
            {filter === 'all' ? 'Your wishlist is empty' : `No ${filter}s saved yet`}
        </h3>
        <p className="text-sm text-[var(--text2)] max-w-xs mb-6">
            {filter === 'all'
                ? 'Browse EV cars and hotels, then tap the heart icon to save them here.'
                : `Switch to "All" or browse ${filter === 'car' ? 'cars' : 'hotels'} to add some.`}
        </p>
        {filter !== 'all' && (
            <button onClick={onReset}
                className="px-5 py-2 text-sm rounded-full bg-[var(--accent)] text-black hover:opacity-90 transition-colors">
                View all saved
            </button>
        )}
    </motion.div>
);

/* ─────────────────────────────────────────────
   CAR CARD
───────────────────────────────────────────── */
const CarCard = ({ item, index, onRemove, onView }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
        transition={{ duration: 0.38, delay: index * 0.06, type: 'spring', stiffness: 280, damping: 24 }}
        className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-200 group">

        {/* Image */}
        <div className="relative h-40 bg-[var(--bg3)] flex items-center justify-center overflow-hidden">
            {item.images?.[0]
                ? <img
                    src={item.images?.[0]}
                    alt={`${item.brand} ${item.model}`}
                    className="w-full h-full object-cover"
                />
                : <Car className="w-14 h-14 text-[var(--text3)]" />}
            <span className="absolute top-2.5 left-2.5 bg-[var(--blue-dim)] text-[var(--blue)] text-xs font-medium px-2.5 py-1 rounded-full border border-[var(--border)]">
                EV Car
            </span>
            <WishlistHeart
                type="car"
                id={item._id}
                className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100"
            />
        </div>

        {/* Body */}
        <div className="p-4">
            <h3 className="font-semibold text-[var(--text)] text-sm leading-tight truncate">{item.brand} {item.model}</h3>
            <p className="text-xs text-[var(--text2)] mt-0.5 mb-3">{item.city}</p>

            {/* Price */}
            <div className="text-base font-bold text-[var(--text)] mb-3">
                {fmtPrice(item.price)}
                <span className="text-xs font-normal text-neutral-400 ml-1">onwards</span>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                {item.range_km && (
                    <span className="flex items-center gap-1 text-xs bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                        <Zap className="w-3 h-3" /> {item.range_km} km
                    </span>
                )}
                {item.charger_type && (
                    <span className="text-xs bg-[var(--bg3)]  text-[var(--text2)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                        {item.charger_type}
                    </span>
                )}
            </div>

            {/* Footer buttons */}
            <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
                <button onClick={() => onView(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg bg-[var(--accent)] text-black hover:opacity-90 transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View details
                </button>
                <button onClick={() => onRemove(item)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] text-neutral-400 hover:bg-[var(--accent-dim)] hover:text-red-500 hover:border-red-200 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    </motion.div>
);

/* ─────────────────────────────────────────────
   HOTEL CARD  ← price hatayi, total_rooms add ki
───────────────────────────────────────────── */
const HotelCard = ({ item, index, onRemove, onView }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
        transition={{ duration: 0.38, delay: index * 0.06, type: 'spring', stiffness: 280, damping: 24 }}
        className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-200 group">

        {/* Image */}
        <div className="relative h-40 bg-[var(--bg3)] flex items-center justify-center overflow-hidden">
            {item.images?.[0]
                ? <img
                    src={item.images?.[0]}
                    alt={`Hotel ${item.name}`}
                    className="w-full h-full object-cover"
                />
                : <Building2 className="w-14 h-14 text-[var(--text3)]" />}
            <span className="absolute top-2.5 left-2.5 bg-[var(--purple-dim)] text-[var(--purple)] text-xs font-medium px-2.5 py-1 rounded-full border border-[var(--border)]">
                Hotel
            </span>
            <WishlistHeart
                type="hotel"
                id={item._id}
                className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100"
            />
        </div>

        {/* Body */}
        <div className="p-4">
            <h3 className="font-semibold text-[var(--text)] text-sm leading-tight truncate">{item.name}</h3>
            <p className="text-xs text-[var(--text2)] mt-0.5 mb-3">{item.city}</p>

            {/* ✅ Total Rooms — price ki jagah */}
            <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-sm font-bold text-amber-700">{item.total_rooms ?? '—'}</span>
                    <span className="text-xs text-amber-600 font-normal">total rooms</span>
                </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                <span className="flex items-center gap-1 text-xs bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                    <Zap className="w-3 h-3" /> {item.chargers_available ?? 0} chargers
                </span>
                {item.city && (
                    <span className="flex items-center gap-1 text-xs bg-[var(--bg3)]  text-[var(--text2)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                        <MapPin className="w-3 h-3" /> {item.city}
                    </span>
                )}
            </div>

            {/* Footer buttons */}
            <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
                <button onClick={() => onView(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg bg-[var(--accent)] text-black hover:opacity-90 transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View details
                </button>
                <button onClick={() => onRemove(item)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] text-neutral-400 hover:bg-[var(--accent-dim)] hover:text-red-500 hover:border-red-200 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    </motion.div>
);

/* ─────────────────────────────────────────────
   MAIN WISHLIST PAGE
───────────────────────────────────────────── */
const Wishlist = () => {
    const navigate = useNavigate();

    /* ── State ── */
    const [cars, setCars] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [filter, setFilter] = useState('all');   // 'all' | 'car' | 'hotel'
    const [loading, setLoading] = useState(true);

    /* ── Load saved items ──
       Replace MOCK_CARS / MOCK_HOTELS with your real API calls:
         const carIds   = JSON.parse(localStorage.getItem('ev_wishlist_cars')   || '[]');
         const hotelIds = JSON.parse(localStorage.getItem('ev_wishlist_hotels') || '[]');
         const cars     = await Promise.all(carIds.map(id => evCarsAPI.getById(id).then(r => ({...r.data, type:'car'}))));
         const hotels   = await Promise.all(hotelIds.map(id => hotelsAPI.getById(id).then(r => ({...r.data, type:'hotel'}))));
    ── */
    useEffect(() => {
        const loadWishlist = async () => {
            try {
                const res = await wishlistAPI.getWishlist();

                setCars(
                    (res.data.cars || []).map(c => ({
                        ...c,
                        type: "car"
                    }))
                );

                setHotels(
                    (res.data.hotels || []).map(h => ({
                        ...h,
                        type: "hotel"
                    }))
                );
            } catch (err) {
                console.error("Wishlist fetch error:", err);
                toast.error("Failed to load wishlist");
            } finally {
                setLoading(false);
            }
        };

        loadWishlist();
    }, []);

    /* ── Remove handlers ── */
    const removeCar = async (item) => {
        try {
            await wishlistAPI.toggleCar(item._id);

            setCars(prev =>
                prev.filter(c => c._id !== item._id)
            );

            toast.success("Car removed from wishlist");
        } catch (err) {
            toast.error("Failed to update wishlist");
        }
    };
    const removeHotel = async (item) => {
        try {
            await wishlistAPI.toggleHotel(item._id);

            setHotels(prev =>
                prev.filter(h => h._id !== item._id)
            );

            toast.success("Hotel removed from wishlist");
        } catch (err) {
            toast.error("Failed to update wishlist");
        }
    };

    /* ── Filtered lists ── */
    const visibleItems = [
        ...(filter !== 'hotel' ? cars : []),
        ...(filter !== 'car' ? hotels : []),
    ];

    const totalSaved = cars.length + hotels.length;

    /* ── Stats ── */
    const totalCarValue = cars.reduce((s, c) => s + (c.price || 0), 0);

    /* ── Page entry animation ── */
    const pageVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto px-4 pt-24 pb-10 min-h-screen bg-[var(--bg)]">

            {/* ── Header ── */}
            <motion.div variants={itemVariants} className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text)] tracking-tight flex items-center gap-2">
                        My Wishlist
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 15 }}>
                            <Heart className="w-7 h-7 fill-red-500 text-red-500" />
                        </motion.span>
                    </h1>
                    <p className="text-sm text-[var(--text2)] mt-1">
                        {totalSaved === 0 ? 'Nothing saved yet' : `${totalSaved} item${totalSaved > 1 ? 's' : ''} saved`}
                    </p>
                </div>
            </motion.div>

            {/* ── Stats row ── */}
            {totalSaved > 0 && (
                <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 mb-7">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                        <div className="text-2xl font-bold text-[var(--text)]">{cars.length}</div>
                        <div className="text-xs text-[var(--text2)] mt-0.5">Cars saved</div>
                    </div>
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                        <div className="text-2xl font-bold text-[var(--text)]">{hotels.length}</div>
                        <div className="text-xs text-[var(--text2)] mt-0.5">Hotels saved</div>
                    </div>
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                        <div className="text-2xl font-bold text-[var(--text)]">
                            {totalCarValue >= 100000
                                ? `₹${(totalCarValue / 100000).toFixed(1)}L`
                                : totalCarValue > 0 ? `₹${totalCarValue.toLocaleString('en-IN')}` : '—'}
                        </div>
                        <div className="text-xs text-[var(--text2)] mt-0.5">Cars value est.</div>
                    </div>
                </motion.div>
            )}

            {/* ── Filter tabs ── */}
            {totalSaved > 0 && (
                <motion.div variants={itemVariants} className="flex gap-2 mb-6">
                    {[
                        { id: 'all', label: `All (${totalSaved})` },
                        { id: 'car', label: `Cars (${cars.length})` },
                        { id: 'hotel', label: `Hotels (${hotels.length})` },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setFilter(tab.id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${filter === tab.id
                                ? 'bg-[var(--accent)] text-black border-[var(--accent)]'
                                : 'bg-[var(--card)] text-[var(--text2)] border-[var(--border)] hover:bg-[var(--card2)]'
                                }`}>
                            {tab.label}
                        </button>
                    ))}
                </motion.div>
            )}

            {/* ── Grid ── */}
            {visibleItems.length === 0
                ? <EmptyWishlist filter={filter} onReset={() => setFilter('all')} />
                : (
                    <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        <AnimatePresence mode="popLayout">
                            {visibleItems.map((item, i) =>
                                item.type === 'car'
                                    ? <CarCard key={item._id} item={item} index={i} onRemove={removeCar} onView={() => navigate(`/cars/${item._id}`)} />
                                    : <HotelCard key={item._id} item={item} index={i} onRemove={removeHotel} onView={() => navigate(`/hotels/${item._id}`)} />
                            )}
                        </AnimatePresence>
                    </motion.div>
                )
            }

            {/* ── Bottom CTA ── */}
            {totalSaved > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 flex gap-3 justify-center">
                    <button onClick={() => navigate('/cars')}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--card2)] transition-colors">
                        <Car className="w-4 h-4" /> Browse more cars
                    </button>
                    <button onClick={() => navigate('/hotels')}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--card2)] transition-colors">
                        <Building2 className="w-4 h-4" /> Browse more hotels
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Wishlist;