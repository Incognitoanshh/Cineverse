import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Pages
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import TVShowsPage from './pages/TVShowsPage';
import TVShowDetailPage from './pages/TVShowDetailPage';
import CelebritiesPage from './pages/CelebritiesPage';
import CelebrityDetailPage from './pages/CelebrityDetailPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import WatchlistPage from './pages/WatchlistPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  const { fetchMe, accessToken } = useAuthStore();

  useEffect(() => {
    if (accessToken) fetchMe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1a26', color: '#e8e8f0', border: '1px solid #2a2a3d' },
            success: { iconTheme: { primary: '#f5c518', secondary: '#0a0a0f' } },
            error: { iconTheme: { primary: '#e50914', secondary: '#0a0a0f' } },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="movies" element={<MoviesPage />} />
            <Route path="movies/:slug" element={<MovieDetailPage />} />
            <Route path="tv" element={<TVShowsPage />} />
            <Route path="tv/:slug" element={<TVShowDetailPage />} />
            <Route path="celebrities" element={<CelebritiesPage />} />
            <Route path="celebrities/:slug" element={<CelebrityDetailPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="profile/:username" element={<ProfilePage />} />

            {/* Protected user routes */}
            <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="admin/*" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

            {/* Catch all */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Auth pages (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
