import axios from "axios";

const API_URL =
  // process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:5001";

// axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===============================
   Attach token automatically
=============================== */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ev_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ===============================
   Handle auth errors globally
=============================== */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ev_token");
      localStorage.removeItem("ev_user");

      window.location.href = "/auth";
    }

    return Promise.reject(error);
  }
);

/* ===============================
   AUTH API
=============================== */

export const authAPI = {
  register: (data) =>
    api.post("/auth/register", data),

  login: (data) =>
    api.post("/auth/login", data),

  getProfile: () =>
    api.get("/auth/me"),

  updateProfile: (data) =>
    api.put("/auth/profile", data),

  checkAdminExists: () => api.get("/auth/admin-exists"),
};

/* ===============================
   CHARGERS API
=============================== */

export const chargersAPI = {
  getAll: (params) =>
    api.get("/chargers", { params }),

  search: (params) =>
    api.get("/chargers", { params }),

  getNearby: (lat, lng, radius = 25) =>
    api.get("/chargers/nearby", {
      params: {
        latitude: lat,
        longitude: lng,
        radius_km: radius,
      },
    }),

  getById: (id) =>
    api.get(`/chargers/${id}`),

  create: (data) =>
    api.post("/chargers", data),

  update: (id, data) =>
    api.put(`/chargers/${id}`, data),

  delete: (id) =>
    api.delete(`/chargers/${id}`),

  fetchExternal: (lat, lng, distance = 50) =>
    api.get("/chargers/external", {
      params: {
        latitude: lat,
        longitude: lng,
        distance_km: distance,
      },
    }),

  getReviews: (id) =>
    api.get(`/chargers/${id}/reviews`),

  addReview: (id, data) =>
    api.post(`/chargers/${id}/reviews`, data),

  getTypes: () =>
    api.get("/chargers/types"),

  getAmenities: () =>
    api.get("/chargers/amenities"),

  incrementView: (id) =>
    api.patch(`/chargers/${id}/view`),
};

/* ===============================
   EV CARS API
=============================== */

export const evCarsAPI = {
  getAll: (params) =>
    api.get("/ev-cars", { params }),

  getById: (id) =>
    api.get(`/ev-cars/${id}`),

  incrementView: (id) =>
    api.patch(`/ev-cars/${id}/view`),

  getMyListings: () =>
    api.get("/ev-cars/my-listings"),

  getBrands: () =>
    api.get("/ev-cars/brands"),

  getCities: () =>
    api.get("/ev-cars/cities"),

  create: (data) =>
    api.post("/ev-cars", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id, data) =>
    api.put(`/ev-cars/${id}`, data),

  delete: (id) =>
    api.delete(`/ev-cars/${id}`),

  calculateBatteryHealth: (data) =>
    api.post(
      "/ev-cars/calculate-battery-health",
      data
    ),

  recordInquiry: (id) =>
    api.post(`/ev-cars/${id}/inquiry`),
};

/* ===============================
   ADMIN API
=============================== */

export const adminAPI = {
  // Dashboard
  getStats: () =>
    api.get("/admin/stats"),

  // Users
  getUsers: (params) =>
    api.get("/admin/users", { params }),

  updateUserRole: (userId, role) =>
    api.put(`/admin/users/${userId}/role`, {
      role,
    }),

  updateUserStatus: (userId, isActive) =>
    api.put(`/admin/users/${userId}/status`, {
      isActive,
    }),

  // Cars
  getAllCars: (params) =>
    api.get("/admin/cars", { params }),

  getPendingCars: () =>
    api.get("/admin/ev-cars/pending"),

  approveCar: (carId) =>
    api.put(`/admin/ev-cars/${carId}/approve`),

  rejectCar: (carId, reason) =>
    api.put(`/admin/ev-cars/${carId}/reject`, {
      reason,
    }),

  deleteCar: (id) =>
    api.delete(`/admin/cars/${id}`),

  // Chargers
  getAllChargers: () =>
    api.get("/admin/chargers"),

  deleteCharger: (id) =>
    api.delete(`/admin/chargers/${id}`),

  // ===============================
  // ADMIN CHARGERS APPROVAL API
  // ===============================

  getPendingChargers: () =>
    api.get("/admin/chargers/pending"),

  approveCharger: (id) =>
    api.put(`/admin/chargers/${id}/approve`),

  rejectCharger: (id, reason) =>
    api.put(`/admin/chargers/${id}/reject`, {
      reason,
    }),

  // Analytics
  getAnalytics: () =>
    api.get("/admin/analytics"),

  // Activity Logs
  getActivityLogs: () =>
    api.get("/admin/activity"),

  // Notifications
  getNotifications: () =>
    api.get("/admin/notifications"),



  markNotificationRead: (id) =>
    api.put(`/admin/notifications/${id}/read`),

  markAllNotificationsRead: () =>
    api.put("/admin/notifications/read-all"),

  // Monthly Summary
  getMonthlySummary: () =>
    api.get("/admin/monthly-summary"),
};

/* ===============================
   ADMIN HOTEL API
=============================== */

export const adminHotelAPI = {
  getPendingHotels: () =>
    api.get("/admin/hotels/pending"),

  getAllHotels: () =>
    api.get("/admin/hotels"),

  approveHotel: (id) =>
    api.put(`/admin/hotels/${id}/approve`),

  rejectHotel: (id, reason) =>
    api.put(`/admin/hotels/${id}/reject`, {
      reason,
    }),

  deleteHotel: (id) =>
    api.delete(`/admin/hotels/${id}`),

  getHotelById: (id) =>
    api.get(`/admin/hotels/${id}`),

  createHotel: (data) =>
    api.post("/admin/hotels", data, {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }),

  incrementHotelView: (id) =>
    api.patch(`/admin/hotels/${id}/view`),
};

/* ===============================
   PUBLIC HOTELS API
=============================== */

export const hotelsAPI = {
  getAll: (params) =>
    api.get("/hotels", { params }),

  getById: (id) =>
    api.get(`/hotels/${id}`),

  incrementView: (id) =>
    api.patch(`/hotels/${id}/view`),
};

/* ===============================
   TRIP PLANNER API
=============================== */

export const tripAPI = {
  calculate: (data) =>
    api.post("/trip/calculate", data),
};

export default api;


/* ===============================
   USER NOTIFICATIONS API
=============================== */

export const notificationsAPI = {
  // Get logged-in user notifications
  getMyNotifications: () =>
    api.get("/notifications"),
  // Mark single notification read
  markNotificationRead: (id) =>
    api.put(`/notifications/${id}/read`),

  // Mark all notifications read
  markAllNotificationsRead: () =>
    api.put("/notifications/read-all"),
};



/* ===============================
   WISHLIST API
=============================== */

export const wishlistAPI = {
  // Get full wishlist
  getWishlist: () =>
    api.get("/wishlist"),

  // Toggle car wishlist
  toggleCar: (id) =>
    api.post(`/wishlist/car/${id}`),

  // Toggle hotel wishlist
  toggleHotel: (id) =>
    api.post(`/wishlist/hotel/${id}`),
};