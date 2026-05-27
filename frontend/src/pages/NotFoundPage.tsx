import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Home, Search } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,197,24,0.05),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10 max-w-md"
      >
        <div className="text-8xl font-display text-cine-gold/20 tracking-widest mb-2">404</div>
        <Film className="w-16 h-16 text-cine-gold/40 mx-auto mb-6" />
        <h1 className="font-display text-3xl text-white tracking-wider mb-3">Scene Not Found</h1>
        <p className="text-cine-muted mb-8 leading-relaxed">
          Looks like this page got lost on the cutting room floor. Let's get you back to something good.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 bg-cine-gold text-cine-bg font-bold px-6 py-3 rounded-xl hover:bg-cine-gold-dark transition-all"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link
            to="/search"
            className="flex items-center gap-2 bg-cine-card border border-cine-border text-white px-6 py-3 rounded-xl hover:border-cine-gold/30 transition-all"
          >
            <Search className="w-4 h-4" /> Search
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
