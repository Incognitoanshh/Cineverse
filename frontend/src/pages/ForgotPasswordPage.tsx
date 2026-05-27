import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cine-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,197,24,0.05),transparent_50%)]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-cine-gold rounded-xl flex items-center justify-center"><Film className="w-6 h-6 text-cine-bg" /></div>
          <span className="font-display text-3xl text-white tracking-widest">CINEVERSE</span>
        </Link>

        <div className="glass rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-cine-muted text-sm mb-6">We sent a password reset link to <strong className="text-white">{email}</strong></p>
              <Link to="/login" className="text-cine-gold hover:text-cine-gold-dark transition-colors text-sm font-medium flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">Forgot password?</h1>
              <p className="text-cine-muted text-sm mb-6">Enter your email to receive a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-cine-muted uppercase tracking-wider mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cine-muted" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-cine-bg border border-cine-border text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-cine-gold/50 transition-all" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-cine-gold text-cine-bg font-bold py-3 rounded-xl hover:bg-cine-gold-dark transition-all disabled:opacity-60">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login" className="flex items-center justify-center gap-1 text-cine-muted hover:text-white text-sm mt-5 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
