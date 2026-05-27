import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Film, Star, Shield, Ban, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { adminAPI } from '../lib/api';
import { LoadingSpinner } from '../components/ui';
import toast from 'react-hot-toast';

const TABS = ['overview', 'users', 'reviews'] as const;
type Tab = typeof TABS[number];

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then((r) => r.data.data),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => adminAPI.getUsers({ search: search || undefined }).then((r) => r.data),
    enabled: activeTab === 'users',
  });

  const { data: pendingReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['admin-pending-reviews'],
    queryFn: () => adminAPI.getPendingReviews().then((r) => r.data.data),
    enabled: activeTab === 'reviews',
  });

  const banMutation = useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) => adminAPI.banUser(id, banned),
    onSuccess: (_, { banned }) => {
      toast.success(banned ? 'User banned' : 'User unbanned');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminAPI.moderateReview(id, status),
    onSuccess: () => {
      toast.success('Review moderated');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-reviews'] });
    },
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-cine-gold" />
          <div>
            <h1 className="font-display text-4xl text-white tracking-wider">Admin Panel</h1>
            <p className="text-cine-muted text-sm">Manage your platform</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-cine-border mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-all ${activeTab === tab ? 'border-cine-gold text-cine-gold' : 'border-transparent text-cine-muted hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {statsLoading ? <LoadingSpinner /> : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-400' },
                  { label: 'Movies', value: stats?.totalMovies, icon: Film, color: 'text-cine-gold' },
                  { label: 'TV Shows', value: stats?.totalTVShows, icon: Film, color: 'text-purple-400' },
                  { label: 'Reviews', value: stats?.totalReviews, icon: Star, color: 'text-emerald-400' },
                  { label: 'Pending Reviews', value: stats?.pendingReviews, icon: AlertTriangle, color: 'text-orange-400' },
                  { label: 'Banned Users', value: stats?.bannedUsers, icon: Ban, color: 'text-red-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-cine-card border border-cine-border rounded-2xl p-5"
                  >
                    <Icon className={`w-6 h-6 ${color} mb-3`} />
                    <p className="text-2xl font-bold text-white">{value?.toLocaleString() || 0}</p>
                    <p className="text-xs text-cine-muted mt-1">{label}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-5">
              <input
                type="text"
                placeholder="Search users by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-sm bg-cine-card border border-cine-border text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cine-gold/50"
              />
            </div>

            {usersLoading ? <LoadingSpinner /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cine-border">
                      {['User', 'Email', 'Role', 'Status', 'Joined', 'Reviews', 'Actions'].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-xs text-cine-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usersData?.data?.map((user: any) => (
                      <tr key={user.id} className="border-b border-cine-border/50 hover:bg-white/2 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-white font-medium">{user.displayName || user.username}</p>
                            <p className="text-cine-muted text-xs">@{user.username}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-cine-muted">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                            user.role === 'ADMIN' ? 'bg-cine-gold/15 text-cine-gold border-cine-gold/30' :
                            user.role === 'MODERATOR' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                            'bg-white/10 text-cine-muted border-white/10'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${user.isBanned ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'}`}>
                            {user.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-cine-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-cine-muted">{user._count?.reviews || 0}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => banMutation.mutate({ id: user.id, banned: !user.isBanned })}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                              user.isBanned
                                ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                : 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                            }`}
                          >
                            {user.isBanned ? <><CheckCircle className="w-3.5 h-3.5" /> Unban</> : <><Ban className="w-3.5 h-3.5" /> Ban</>}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === 'reviews' && (
          <div>
            <h2 className="font-display text-xl text-white tracking-wider mb-5">
              Pending Reviews ({pendingReviews?.length || 0})
            </h2>
            {reviewsLoading ? <LoadingSpinner /> : (
              <div className="space-y-4">
                {pendingReviews?.length === 0 && (
                  <div className="text-center py-16">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p className="text-white font-semibold">All reviews approved!</p>
                    <p className="text-cine-muted text-sm">No pending reviews at the moment.</p>
                  </div>
                )}
                {pendingReviews?.map((review: any) => (
                  <div key={review.id} className="bg-cine-card border border-cine-border rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-white font-medium">{review.user?.username}</p>
                        <p className="text-xs text-cine-muted">
                          On: {review.movie?.title || review.tvShow?.title} · {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => moderateMutation.mutate({ id: review.id, status: 'APPROVED' })}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => moderateMutation.mutate({ id: review.id, status: 'REJECTED' })}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                    {review.title && <p className="font-semibold text-white text-sm mb-1">{review.title}</p>}
                    <p className="text-cine-muted text-sm leading-relaxed">{review.content}</p>
                    {review.rating && (
                      <p className="text-cine-gold text-xs mt-2 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-cine-gold" /> {review.rating}/10
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
