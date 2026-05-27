import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { celebrityAPI } from '../lib/api';
import { LoadingSpinner, EmptyState } from '../components/ui';
import { Celebrity } from '../types';

const CelebritiesPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['celebrities', page],
    queryFn: () => celebrityAPI.getAll({ page, limit: 24 }).then((r) => r.data),
  });

  const celebrities: Celebrity[] = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-4xl md:text-5xl text-white tracking-wider mb-2">Celebrities</h1>
        <p className="text-cine-muted mb-8">{pagination?.total.toLocaleString()} profiles</p>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="animate-pulse"><div className="aspect-square rounded-xl skeleton mb-2" /><div className="h-3.5 skeleton rounded w-3/4" /></div>
            ))}
          </div>
        ) : celebrities.length === 0 ? <EmptyState title="No celebrities found" /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {celebrities.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="group">
                <Link to={`/celebrities/${c.slug}`}>
                  <div className="aspect-square rounded-xl overflow-hidden bg-cine-card mb-2.5">
                    {c.profileUrl ? <img src={c.profileUrl} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center"><User className="w-10 h-10 text-cine-muted" /></div>}
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-cine-gold transition-colors line-clamp-2">{c.name}</h3>
                  {c.knownForDept && <p className="text-xs text-cine-muted mt-0.5">{c.knownForDept}</p>}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-cine-border text-sm text-cine-muted disabled:opacity-40 hover:text-white transition-all">Previous</button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-sm ${page === p ? 'bg-cine-gold text-cine-bg font-bold' : 'border border-cine-border text-cine-muted hover:text-white'}`}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-4 py-2 rounded-lg border border-cine-border text-sm text-cine-muted disabled:opacity-40 hover:text-white transition-all">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CelebritiesPage;
