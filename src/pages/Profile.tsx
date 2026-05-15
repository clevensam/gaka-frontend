import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile as ProfileType } from '../lib/types';
import { SEO } from '../components/shared/SEO';
import { LogoutIcon, ChevronRightIcon } from '../components/shared/Icons';

interface ProfilePageProps {
  profile: ProfileType | null;
  savedCount: number;
  onLogin: (username: string, pass: string) => Promise<void>;
  onSignup: (username: string, pass: string, name: string, email: string, avatarUrl?: string) => Promise<void>;
  onLogout: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export const Profile: React.FC<ProfilePageProps> = ({ profile, savedCount, onLogin, onSignup, onLogout, isDark, onToggleDark }) => {
  const navigate = useNavigate();

  if (!profile) {
    return <InlineAuth onLogin={onLogin} onSignup={onSignup} isDark={isDark} />;
  }

  return (
    <div className="animate-fade-in max-w-lg mx-auto pt-8 sm:pt-12 pb-8">
      <SEO title="Profile" />

      <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/60 dark:border-white/5 overflow-hidden">
        {/* Profile Card */}
        <div className="px-6 sm:px-10 pt-10 pb-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-white dark:border-black bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-xl">
            {profile.full_name?.slice(0, 2).toUpperCase() || profile.username?.slice(0, 2).toUpperCase()}
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">{profile.full_name || profile.username}</h2>
          <p className="text-sm font-medium text-slate-400 dark:text-white/40">@{profile.username}</p>
          <div className="inline-block mt-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">{profile.role}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-10 py-5 border-t border-b border-slate-50 dark:border-white/5 mx-6">
          <div className="text-center">
            <span className="block text-lg font-black text-slate-900 dark:text-white">{savedCount}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Saved</span>
          </div>
          <div className="text-center">
            <span className="block text-lg font-black text-slate-900 dark:text-white">{profile.role === 'admin' ? 'Admin' : 'Student'}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Role</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-6 sm:px-10 py-4 space-y-1">
          {/* Dark Mode */}
          <button onClick={onToggleDark} className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <span className="text-lg leading-none">{isDark ? '☀️' : '🌙'}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-slate-300 dark:text-white/20" />
          </button>

          {/* About */}
          <button onClick={() => navigate('/about')} className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 flex items-center justify-center text-sm">ℹ️</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">About</span>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-slate-300 dark:text-white/20" />
          </button>

          {/* Logout */}
          <button onClick={onLogout} className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/5 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <LogoutIcon className="w-5 h-5 text-red-500" />
              <span className="text-sm font-bold text-red-500">Log Out</span>
            </div>
            <ChevronRightIcon className="w-4 h-4 text-red-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* Inline Auth Component */
interface InlineAuthProps {
  onLogin: (username: string, pass: string) => Promise<void>;
  onSignup: (username: string, pass: string, name: string, email: string, avatarUrl?: string) => Promise<void>;
  isDark: boolean;
}

const InlineAuth: React.FC<InlineAuthProps> = ({ onLogin, onSignup }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) { setError("Username too short."); return; }
    if (password.length < 6) { setError("Password must be 6+ chars."); return; }
    if (activeTab === 'signup') {
      if (fullName.trim().length < 2) { setError("Enter your full name."); return; }
      if (!email.includes('@')) { setError("Invalid email address."); return; }
      if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    }
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'login') await onLogin(username, password);
      else await onSignup(username, password, fullName, email);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-md mx-auto pt-8 sm:pt-12 pb-8">
      <SEO title={activeTab === 'login' ? 'Sign In' : 'Register'} />
      <div className="bg-white dark:bg-[#0A0A0A] rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/60 dark:border-white/5 overflow-hidden">
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
            G
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Welcome to GAKA</h2>
          <p className="text-[10px] font-medium text-slate-400 mt-1">Sign in to view your profile</p>
        </div>

        <div className="flex mx-6 border dark:border-white/5 bg-slate-50/30 dark:bg-black/10 rounded-xl p-1">
          <button onClick={() => { setActiveTab('login'); setError(null); }} className={`flex-1 py-2.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'login' ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-sm' : 'text-slate-400'}`}>Sign In</button>
          <button onClick={() => { setActiveTab('signup'); setError(null); }} className={`flex-1 py-2.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'signup' ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-sm' : 'text-slate-400'}`}>Register</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {activeTab === 'signup' && (
            <>
              <input type="text" placeholder="Full Name" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 dark:text-white font-medium text-sm placeholder:opacity-30" />
              <input type="email" placeholder="email@must.ac.tz" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 dark:text-white font-medium text-sm placeholder:opacity-30" />
            </>
          )}
          <input type="text" placeholder="Username" required value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 dark:text-white font-medium text-sm placeholder:opacity-30" />
          <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 dark:text-white font-medium text-sm" />
          {activeTab === 'signup' && (
            <input type="password" placeholder="Confirm Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 dark:text-white font-medium text-sm" />
          )}
          {error && <p className="text-red-500 text-[9px] font-bold text-center uppercase tracking-widest">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-[0.97] transition-all disabled:opacity-50 flex items-center justify-center">
            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : activeTab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
