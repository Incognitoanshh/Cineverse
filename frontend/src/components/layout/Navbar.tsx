import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Film, Tv, Users, Bell, User, LogOut, Menu, X, ChevronDown, Settings, LayoutDashboard, Bookmark } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { searchAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const { data } = await searchAPI.suggestions(q);
      setSuggestions(data.data.slice(0, 8));
    } catch {}
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = [
    { to: '/movies', label: 'Movies', icon: Film },
    { to: '/tv', label: 'TV Shows', icon: Tv },
    { to: '/celebrities', label: 'Stars', icon: Users },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'navbar-blur border-b border-cine-border' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-cine-gold rounded flex items-center justify-center">
              <Film className="w-5 h-5 text-cine-bg" />
            </div>
            <span className="font-display text-2xl text-white tracking-widest">CINEVERSE</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname.startsWith(to)
                    ? 'text-cine-gold bg-cine-gold/10'
                    : 'text-cine-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-cine-muted hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                <Search className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-12 w-80 glass rounded-xl overflow-hidden shadow-card"
                  >
                    <form onSubmit={handleSearchSubmit} className="p-3">
                      <div className="flex items-center gap-2 bg-cine-bg rounded-lg px-3 py-2">
                        <Search className="w-4 h-4 text-cine-muted shrink-0" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search movies, shows, stars..."
                          value={searchQuery}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="flex-1 bg-transparent text-sm text-white placeholder-cine-muted outline-none"
                        />
                      </div>
                    </form>
                    {suggestions.length > 0 && (
                      <div className="border-t border-cine-border">
                        {suggestions.map((s, i) => (
                          <Link
                            key={i}
                            to={`/${s.type === 'celebrity' ? 'celebrities' : s.type === 'tv' ? 'tv' : 'movies'}/${s.slug}`}
                            onClick={() => { setSearchOpen(false); setSuggestions([]); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                          >
                            {s.posterUrl || s.profileUrl ? (
                              <img src={s.posterUrl || s.profileUrl} alt="" className="w-8 h-10 object-cover rounded" />
                            ) : (
                              <div className="w-8 h-10 bg-cine-card rounded flex items-center justify-center">
                                <Film className="w-4 h-4 text-cine-muted" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm text-white">{s.title || s.name}</p>
                              <p className="text-xs text-cine-muted capitalize">{s.type}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <Link to="/dashboard" className="p-2 text-cine-muted hover:text-white rounded-lg hover:bg-white/5 transition-all">
                  <Bell className="w-5 h-5" />
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-all"
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.displayName} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-cine-gold flex items-center justify-center text-cine-bg font-bold text-sm">
                        {(user.displayName || user.username)[0].toUpperCase()}
                      </div>
                    )}
                    <ChevronDown className="w-3 h-3 text-cine-muted" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-12 w-48 glass rounded-xl overflow-hidden shadow-card"
                      >
                        <div className="p-3 border-b border-cine-border">
                          <p className="text-sm font-medium text-white">{user.displayName}</p>
                          <p className="text-xs text-cine-muted">@{user.username}</p>
                        </div>
                        <div className="p-1">
                          <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-cine-muted hover:text-white hover:bg-white/5 rounded-lg transition-all">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </Link>
                          <Link to="/watchlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-cine-muted hover:text-white hover:bg-white/5 rounded-lg transition-all">
                            <Bookmark className="w-4 h-4" /> Watchlist
                          </Link>
                          <Link to={`/profile/${user.username}`} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-cine-muted hover:text-white hover:bg-white/5 rounded-lg transition-all">
                            <User className="w-4 h-4" /> Profile
                          </Link>
                          {['ADMIN', 'SUPER_ADMIN'].includes(user.role) && (
                            <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-cine-gold hover:bg-cine-gold/10 rounded-lg transition-all">
                              <Settings className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                            <LogOut className="w-4 h-4" /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-1.5 text-sm text-white hover:text-cine-gold transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-1.5 text-sm bg-cine-gold text-cine-bg font-semibold rounded-lg hover:bg-cine-gold-dark transition-all">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-cine-muted hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-cine-border bg-cine-surface"
          >
            <div className="p-4 space-y-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-cine-muted hover:text-white hover:bg-white/5"
                >
                  <Icon className="w-4 h-4" /> {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
