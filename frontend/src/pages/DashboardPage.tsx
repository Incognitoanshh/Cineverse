import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bookmark, Heart, Star, Bell, User, Settings, Film } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { userAPI, notificationAPI } from '../lib/api';
import { Link } from 'react-router-dom';

const TABS = ['overview', 'watchlist', 'favorites', 'reviews', 'notifications'] as const;
type Tab = typeof TABS[number];

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { user } = useAuthStore();

  const { data: watchlistData } = useQuery({ queryKey: ['watchlist'], queryFn: () => userAPI.getWatchlist().then((r) => r.data.data), enabled: activeTab === 'watchlist' || activeTab === 'overview' });
  const { data: favoritesData } = useQuery({ queryKey: ['favorites'], queryFn: () => userAPI.getFavorites().then((r) => r.data.data), enabled: activeTab === 'favorites' || activeTab === 'overview' });
  const { data: reviewsData } = useQuery({ queryKey: ['user-reviews'], queryFn: () => userAPI.getReviews().then((r) => r.data.data), enabled: activeTab === 'reviews' || activeTab === 'overview' });
  const { data: notificationsData } = useQuery({ queryKey: ['notifications'], queryFn: () => notificationAPI.getAll().then((r) => r.data.data), enabled: activeTab === 'notifications' });

  const watchlistCount = watchlistData?.reduce((a: number, w: any) => a + (w.items?.length || 0), 0) || 0;
  const favoritesCount = favoritesData?.length || 0;
  const reviewsCount = reviewsData?.length || 0;
  const unreadNotifs = notificationsData?.filter((n: any) => !n.isRead).length || 0;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Profile header */}
        <div className="flex items-start gap-5 mb-8">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName} className="w-16 h-16 rounded-2xl object-cover border-2 border-cine-gold/30" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-cine-gold/20 text-cine-gold flex items-center justify-center font-bold text-2xl border-2 border-cine-gold/30">
              {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl text-white tracking-wide">{user?.displayName}</h1>
            <p className="text-cine-muted text-sm">@{user?.username}</p>
          </div>
          <Link to="/profile/settings" className="ml-auto p-2.5 bg-cine-card border border-cine-border rounded-xl text-cine-muted hover:text-white hover:border-cine-gold/30 transition-all">
            <Settings className="w-5 h-5" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Watchlist', value: watchlistCount, icon: Bookmark, color: 'text-blue-400' },
            { label: 'Favorites', value: favoritesCount, icon: Heart, color: 'text-red-400' },
            { label: 'Reviews', value: reviewsCount, icon: Star, color: 'text-cine-gold' },
            { label: 'Notifications', value: unreadNotifs, icon: Bell, color: 'text-emerald-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-cine-card border border-cine-border rounded-2xl p-5 flex items-center gap-4">
              <div className={`${color} opacity-80`}><Icon className="w-7 h-7" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-cine-muted">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-cine-border mb-8 overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 text-sm font-medium capitalize whitespace-nowrap border-b-2 -mb-px transition-all ${activeTab === tab ? 'border-cine-gold text-cine-gold' : 'border-transparent text-cine-muted hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent watchlist */}
            {watchlistData && watchlistData.length > 0 && (
              <section>
                <h3 className="font-display text-xl text-white tracking-wider mb-4">Recent Watchlist</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {watchlistData[0]?.items?.slice(0, 6).map((item: any) => {
                    const media = item.movie || item.tvShow;
                    if (!media) return null;
                    return (
                      <Link key={item.id} to={`/${item.movie ? 'movies' : 'tv'}/${media.slug}`} className="group">
                        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-cine-card">
                          {media.posterUrl && <img src={media.posterUrl} alt={media.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                        </div>
                        <p className="text-xs text-white mt-1.5 line-clamp-2 group-hover:text-cine-gold transition-colors">{media.title}</p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Recent reviews */}
            {reviewsData && reviewsData.length > 0 && (
              <section>
                <h3 className="font-display text-xl text-white tracking-wider mb-4">Your Reviews</h3>
                <div className="space-y-3">
                  {reviewsData.slice(0, 3).map((review: any) => {
                    const media = review.movie || review.tvShow;
                    return (
                      <div key={review.id} className="bg-cine-card border border-cine-border rounded-xl p-4 flex gap-4">
                        {media?.posterUrl && <img src={media.posterUrl} alt={media.title} className="w-12 h-16 object-cover rounded-lg shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-white font-medium text-sm">{media?.title}</p>
                            {review.rating && <span className="text-xs bg-cine-gold/20 text-cine-gold px-1.5 py-0.5 rounded">{review.rating}/10</span>}
                          </div>
                          <p className="text-cine-muted text-xs line-clamp-2">{review.content}</p>
                          <p className="text-xs text-cine-muted mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div>
            {!watchlistData || watchlistData.length === 0 ? (
              <div className="text-center py-16">
                <Bookmark className="w-12 h-12 text-cine-muted mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Your watchlist is empty</p>
                <p className="text-cine-muted text-sm">Browse movies and add them to your watchlist.</p>
                <Link to="/movies" className="inline-block mt-4 px-5 py-2 bg-cine-gold text-cine-bg font-semibold rounded-xl text-sm">Browse Movies</Link>
              </div>
            ) : (
              watchlistData.map((wl: any) => (
                <div key={wl.id} className="mb-8">
                  <h3 className="font-display text-xl text-white tracking-wider mb-4">{wl.name}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {wl.items?.map((item: any) => {
                      const media = item.movie || item.tvShow;
                      if (!media) return null;
                      return (
                        <Link key={item.id} to={`/${item.movie ? 'movies' : 'tv'}/${media.slug}`} className="group">
                          <div className="aspect-[2/3] rounded-xl overflow-hidden bg-cine-card mb-1.5">
                            {media.posterUrl && <img src={media.posterUrl} alt={media.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
                          </div>
                          <p className="text-xs text-white line-clamp-2 group-hover:text-cine-gold transition-colors">{media.title}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-2">
            {!notificationsData || notificationsData.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-12 h-12 text-cine-muted mx-auto mb-3" />
                <p className="text-white font-semibold">No notifications yet</p>
              </div>
            ) : (
              notificationsData.map((n: any) => (
                <div key={n.id} className={`p-4 rounded-xl border transition-all ${!n.isRead ? 'bg-cine-gold/5 border-cine-gold/20' : 'bg-cine-card border-cine-border'}`}>
                  <div className="flex items-start gap-3">
                    <Bell className={`w-5 h-5 mt-0.5 ${!n.isRead ? 'text-cine-gold' : 'text-cine-muted'}`} />
                    <div>
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-cine-muted mt-0.5">{n.message}</p>
                      <p className="text-xs text-cine-muted mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                    {!n.isRead && <span className="ml-auto w-2 h-2 rounded-full bg-cine-gold shrink-0 mt-1.5" />}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
