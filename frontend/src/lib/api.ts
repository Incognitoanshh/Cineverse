import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://cineverse-iqau.onrender.com/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        localStorage.setItem('accessToken', data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
};

export const moviesAPI = {
  getAll: (params?: any) => api.get('/movies', { params }),
  getTrending: () => api.get('/movies/trending'),
  getUpcoming: () => api.get('/movies/upcoming'),
  getTopRated: () => api.get('/movies/top-rated'),
  getBySlug: (slug: string) => api.get(`/movies/${slug}`),
  getReviews: (slug: string, params?: any) => api.get(`/movies/${slug}/reviews`, { params }),
  getSimilar: (slug: string) => api.get(`/movies/${slug}/similar`),
  rate: (slug: string, score: number) => api.post(`/movies/${slug}/rate`, { score }),
  addToWatchlist: (slug: string) => api.post(`/movies/${slug}/watchlist`),
  removeFromWatchlist: (slug: string) => api.delete(`/movies/${slug}/watchlist`),
  toggleFavorite: (slug: string) => api.post(`/movies/${slug}/favorite`),
};

export const tvAPI = {
  getAll: (params?: any) => api.get('/tv', { params }),
  getBySlug: (slug: string) => api.get(`/tv/${slug}`),
};

export const celebrityAPI = {
  getAll: (params?: any) => api.get('/celebrities', { params }),
  getBySlug: (slug: string) => api.get(`/celebrities/${slug}`),
};

export const reviewsAPI = {
  create: (data: any) => api.post('/reviews', data),
  update: (id: string, data: any) => api.put(`/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
  like: (id: string) => api.post(`/reviews/${id}/like`),
  comment: (id: string, content: string) => api.post(`/reviews/${id}/comments`, { content }),
};

export const searchAPI = {
  search: (params: any) => api.get('/search', { params }),
  suggestions: (q: string) => api.get('/search/suggestions', { params: { q } }),
};

export const userAPI = {
  getProfile: (username: string) => api.get(`/users/${username}`),
  updateMe: (data: any) => api.put('/users/me', data),
  getWatchlist: () => api.get('/users/me/watchlist'),
  getFavorites: () => api.get('/users/me/favorites'),
  getReviews: () => api.get('/users/me/reviews'),
};

export const genreAPI = {
  getAll: () => api.get('/genres'),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const recommendationAPI = {
  getPersonalized: () => api.get('/recommendations/personalized'),
  getSimilar: (movieId: string) => api.get(`/recommendations/similar/${movieId}`),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  banUser: (id: string, banned: boolean, reason?: string) => api.patch(`/admin/users/${id}/ban`, { banned, reason }),
  getPendingReviews: () => api.get('/admin/reviews/pending'),
  moderateReview: (id: string, status: string) => api.patch(`/admin/reviews/${id}/moderate`, { status }),
};
