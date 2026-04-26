
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserIcon, LockIcon, MailIcon, BackIcon, ChevronRightIcon, ImageIcon, PlusIcon } from '../shared/Icons';
import { uploadImage } from '../../lib/storage';
import { useLocation } from 'react-router-dom';
import { SEO } from '../shared/SEO';

interface AuthPageProps {
  onLogin: (username: string, pass: string) => Promise<void>;
  onSignup: (username: string, pass: string, name: string, email: string, avatarUrl?: string) => Promise<void>;
  onBack: () => void;
  isDark: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignup, onBack, isDark }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const state = location.state as { tab?: 'login' | 'signup' };
    if (state?.tab) {
      setActiveTab(state.tab);
    }
  }, [location.state]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    if (username.length < 3) return "Username too short.";
    if (password.length < 6) return "Password must be 6+ chars.";
    
    if (activeTab === 'signup') {
      if (fullName.trim().length < 2) return "Enter your full name.";
      if (!email.includes('@')) return "Invalid email address.";
      if (password !== confirmPassword) return "Keys do not match.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'login') {
        await onLogin(username, password);
      } else {
        await onSignup(username, password, fullName, email, avatarUrl);
      }
    } catch (err: any) {
      setError(err.message || "Access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-50 dark:bg-[#050505] font-lexend transition-colors duration-500">
      <SEO 
        title={activeTab === 'login' ? 'Sign In' : 'Register'} 
        description={activeTab === 'login' ? 'Sign in to your GAKA Portal account.' : 'Create a new GAKA Portal account to access academic resources.'} 
      />
      {/* Minimal Header */}
      <div className="w-full max-w-md mb-8 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <BackIcon className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
        </button>
        <div className="flex items-center space-x-2 opacity-80">
           <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-xs">G</div>
           <span className="font-black text-slate-900 dark:text-white tracking-tight uppercase text-[10px]">Portal</span>
        </div>
      </div>

      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-12 animate-fade-in">
        {/* Left Side: Animation (Desktop Only) */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center min-h-[450px]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center space-y-8"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10"
              >
                <div className={`absolute -inset-6 bg-emerald-500/20 blur-3xl rounded-full transition-opacity duration-700 ${isPasswordFocused ? 'opacity-100 animate-pulse' : 'opacity-40'}`}></div>
                
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={isPasswordFocused ? 'glasses' : 'no-glasses'}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    src={isPasswordFocused 
                      ? "https://tgnljtmvigschazflxis.supabase.co/storage/v1/object/public/animation/Character_wearing_black_sunglasses_36898e4e21-ezgif.com-crop.gif"
                      : "https://tgnljtmvigschazflxis.supabase.co/storage/v1/object/public/animation/Character_wearing_black_sunglasses_36898e4e21-ezgif.com-crop.gif" // Fallback to same but with filter if no other asset
                    } 
                    alt="Character" 
                    className={`w-80 h-80 rounded-[4rem] object-cover border-8 border-white dark:border-white/5 shadow-2xl transition-all duration-500 ${isPasswordFocused ? 'ring-8 ring-emerald-500/10 grayscale-0' : 'grayscale-[0.5] brightness-90'}`}
                    style={!isPasswordFocused ? { filter: 'sepia(0.2) brightness(1.1)' } : {}}
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
              </motion.div>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {isPasswordFocused ? "Privacy Shield Active" : "GAKA Portal"}
              </h2>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">
                {isPasswordFocused ? "Your credentials are encrypted" : "Digitizing MUST Education"}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-[#0f0f0f] rounded-[2rem] shadow-sm border border-slate-200/60 dark:border-white/5 overflow-hidden">
            {/* Tab Switcher */}
            <div className="flex border-b dark:border-white/5 bg-slate-50/30 dark:bg-black/10">
              <button 
                onClick={() => { setActiveTab('login'); setError(null); }}
                className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'login' ? 'text-emerald-600 bg-white dark:bg-transparent border-b-2 border-emerald-600' : 'text-slate-400'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setActiveTab('signup'); setError(null); }}
                className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'signup' ? 'text-emerald-600 bg-white dark:bg-transparent border-b-2 border-emerald-600' : 'text-slate-400'}`}
              >
                Register
              </button>
            </div>

            <div className="p-8 sm:p-10">
              {/* Mobile Animation */}
              <div className="md:hidden flex justify-center mb-8">
                <div className="relative">
                  <div className={`absolute -inset-2 bg-emerald-500/20 blur-xl rounded-full transition-opacity duration-500 ${isPasswordFocused ? 'opacity-100 animate-pulse' : 'opacity-40'}`}></div>
                  <img 
                    src="https://tgnljtmvigschazflxis.supabase.co/storage/v1/object/public/animation/Character_wearing_black_sunglasses_36898e4e21-ezgif.com-crop.gif" 
                    alt="Character" 
                    className={`w-24 h-24 rounded-full object-cover border-4 border-white dark:border-white/5 shadow-xl transition-all duration-500 ${isPasswordFocused ? 'scale-110 border-emerald-500/50 grayscale-0' : 'grayscale-[0.5] brightness-90'}`}
                    style={!isPasswordFocused ? { filter: 'sepia(0.2) brightness(1.1)' } : {}}
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'signup' && (
                <>
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-black/40 shadow-xl transition-all group-hover:border-emerald-500/50">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <UserIcon className="w-10 h-10" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white"
                        >
                          <PlusIcon className="w-8 h-8" />
                        </button>
                      </div>
                      {uploading && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 rounded-[2rem] flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-3">Profile Photo</label>
                    <input 
                      type="file"
                      ref={avatarInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploading(true);
                          // Use a temporary ID for avatar upload during signup
                          const url = await uploadImage(file, 'temp-' + Date.now());
                          if (url) setAvatarUrl(url);
                          setUploading(false);
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Cleven Samwel" 
                      required 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-5 py-3 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-900 dark:text-white font-medium text-sm placeholder:opacity-30" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                    <input 
                      type="email" 
                      placeholder="student@must.ac.tz" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-3 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-900 dark:text-white font-medium text-sm placeholder:opacity-30" 
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Username</label>
                <input 
                  type="text" 
                  placeholder="MUST-CS-20XX" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-900 dark:text-white font-medium text-sm placeholder:opacity-30" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className="w-full px-5 py-3 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-900 dark:text-white font-medium text-sm" 
                />
              </div>

              {activeTab === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-900 dark:text-white font-medium text-sm" 
                  />
                </div>
              )}

              {error && (
                <p className="text-red-500 text-[9px] font-bold text-center uppercase tracking-widest py-1">
                  {error}
                </p>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-500/10 active:scale-[0.97] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <p className="mt-8 text-center text-[8px] font-bold text-slate-300 dark:text-white/10 uppercase tracking-[0.5em]">
        Centralized Repository • GAKA 2.0
      </p>
    </div>
  );
};
