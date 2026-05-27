import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Twitter, Instagram, Github, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-cine-surface border-t border-cine-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-cine-gold rounded flex items-center justify-center">
                <Film className="w-5 h-5 text-cine-bg" />
              </div>
              <span className="font-display text-2xl text-white tracking-widest">CINEVERSE</span>
            </Link>
            <p className="text-cine-muted text-sm leading-relaxed max-w-xs">
              Your ultimate destination for movies, TV shows, and celebrity profiles. Discover, review, and track everything you love.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Twitter, Instagram, Github, Mail].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-cine-card border border-cine-border flex items-center justify-center text-cine-muted hover:text-cine-gold hover:border-cine-gold/30 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Explore</h4>
            <ul className="space-y-2.5">
              {[['Movies', '/movies'], ['TV Shows', '/tv'], ['Celebrities', '/celebrities'], ['Search', '/search']].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-cine-muted hover:text-cine-gold text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">Account</h4>
            <ul className="space-y-2.5">
              {[['Sign Up', '/register'], ['Log In', '/login'], ['Dashboard', '/dashboard'], ['Watchlist', '/watchlist']].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-cine-muted hover:text-cine-gold text-sm transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-cine-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-cine-muted text-xs">© {new Date().getFullYear()} CineVerse. All rights reserved.</p>
          <p className="text-cine-muted text-xs">Built with ❤️ for movie lovers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
