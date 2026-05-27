import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Users, Film, Calendar } from 'lucide-react';
import { userAPI } from '../lib/api';
import { LoadingSpinner } from '../components/ui';

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  const { data: user, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => userAPI.getProfile(username!).then((r) => r.data.data),
    enabled: !!username,
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <LoadingSpinner size={12} />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <p className="text-cine-muted">User not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Cover */}
      <div className="relative h-52 bg-gradient-to-br from-cine-surface via-cine-card to-cine-bg overflow-hidden">
        {user.coverUrl && (
          <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-cine-bg/80 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-10 pb-16">
        {/* Avatar */}
        <div className="flex items-end gap-5 mb-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-cine-bg shadow-card shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-cine-gold/20 flex items-center justify-center text-cine-gold text-3xl font-bold">
                {(user.displayName || user.username)[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="pb-1">
            <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
            <p className="text-cine-muted text-sm">@{user.username}</p>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-cine-muted text-sm mb-6 max-w-xl">{user.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Reviews', value: user._count?.reviews || 0, icon: Star },
            { label: 'Followers', value: user._count?.followers || 0, icon: Users },
            { label: 'Following', value: user._count?.following || 0, icon: Film },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-cine-card border border-cine-border rounded-2xl p-5 text-center">
              <Icon className="w-5 h-5 text-cine-gold mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-cine-muted">{label}</p>
            </div>
          ))}
        </div>

        {/* Joined */}
        <div className="flex items-center gap-2 text-cine-muted text-sm">
          <Calendar className="w-4 h-4" />
          Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
