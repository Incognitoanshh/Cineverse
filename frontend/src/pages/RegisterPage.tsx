import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Eye, EyeOff, Mail, Lock, User, AtSign } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });
  const [showPwd, setShowPwd] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    try {
      await register(form);
      toast.success('Account created! Welcome to CineVerse!');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-cine-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,197,24,0.05),transparent_50%)]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-cine-gold rounded-xl flex items-center justify-center">
            <Film className="w-6 h-6 text-cine-bg" />
          </div>
          <span className="font-display text-3xl text-white tracking-widest">CINEVERSE</span>
        </Link>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-cine-muted text-sm mb-6">Join millions of movie lovers</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-cine-muted uppercase tracking-wider mb-1.5 block">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-muted" />
                <input type="text" required value={form.displayName} onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))} placeholder="John Doe" className="w-full bg-cine-bg border border-cine-border text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-cine-gold/50 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs text-cine-muted uppercase tracking-wider mb-1.5 block">Username</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-muted" />
                <input type="text" required value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} placeholder="johndoe123" className="w-full bg-cine-bg border border-cine-border text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-cine-gold/50 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs text-cine-muted uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-muted" />
                <input type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="you@example.com" className="w-full bg-cine-bg border border-cine-border text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-cine-gold/50 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs text-cine-muted uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-muted" />
                <input type={showPwd ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="Min. 8 characters" className="w-full bg-cine-bg border border-cine-border text-white rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none focus:border-cine-gold/50 transition-all" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cine-muted hover:text-white transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-cine-gold text-cine-bg font-bold py-3 rounded-xl hover:bg-cine-gold-dark transition-all disabled:opacity-60 mt-2">
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-cine-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-cine-gold hover:text-cine-gold-dark transition-colors font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
