import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  HomeIcon, HomeFilledIcon,
  ExploreIcon, ExploreFilledIcon,
  BlogIcon, BlogFilledIcon,
  BookmarkIcon, SavedFilledIcon,
  UserIcon, ProfileFilledIcon,
  LogoutIcon
} from '../shared/Icons';
import { Profile } from '../../lib/types';

interface BottomTabBarProps {
  profile: Profile | null;
  isDark: boolean;
  onToggleDark: () => void;
  onLogoutClick: () => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: HomeIcon, activeIcon: HomeFilledIcon, path: '/' },
  { id: 'explore', label: 'Explore', icon: ExploreIcon, activeIcon: ExploreFilledIcon, path: '/modules' },
  { id: 'blog', label: 'Blog', icon: BlogIcon, activeIcon: BlogFilledIcon, path: '/blog' },
  { id: 'saved', label: 'Saved', icon: BookmarkIcon, activeIcon: SavedFilledIcon, path: '/saved' },
  { id: 'profile', label: 'Profile', icon: UserIcon, activeIcon: ProfileFilledIcon, path: null },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ profile, isDark, onToggleDark, onLogoutClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string | null) => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleTabPress = (tab: typeof tabs[0]) => {
    if (tab.id === 'profile') {
      navigate(profile ? '/about' : '/auth');
      return;
    }
    navigate(tab.path!);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const profileActive = location.pathname === '/about' || location.pathname === '/auth';

  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 ig-safe-bottom lg:hidden">
        <div className="max-w-ig-container mx-auto flex items-center justify-around h-14 sm:h-16 px-2">
          {tabs.map((tab) => {
            const active = isActive(tab.path) || (tab.id === 'profile' && profileActive);
            const Icon = active ? tab.activeIcon : tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab)}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full active:scale-90 transition-transform relative"
              >
                <Icon className={`w-6 h-6 transition-colors ${
                  active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-white/40'
                }`} />
                <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-colors ${
                  active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-white/40'
                }`}>
                  {tab.label}
                </span>
                {active && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col h-full bg-white dark:bg-black border-r border-slate-100 dark:border-white/5 px-3 py-4">
          {/* Logo */}
          <div className="px-3 mb-8 pt-6">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all">
              <div className="w-9 h-9 bg-emerald-600 dark:bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                G
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">GAKA</span>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 flex flex-col gap-1">
            {tabs.map((tab) => {
              const active = isActive(tab.path) || (tab.id === 'profile' && profileActive);
              const Icon = active ? tab.activeIcon : tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabPress(tab)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all active:scale-95 text-left ${
                    active 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <span className={`text-sm font-bold ${
                    active ? 'text-emerald-600 dark:text-emerald-400' : ''
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-slate-100 dark:border-white/5 pt-3 space-y-1">
            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDark}
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/5 transition-all w-full text-left"
            >
              <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
              <span className="text-sm font-bold">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* Profile info & Logout */}
            {profile ? (
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                    {profile.full_name?.slice(0, 2).toUpperCase() || profile.username?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile.username}</p>
                    <p className="text-[10px] font-medium text-slate-400 dark:text-white/30">{profile.role}</p>
                  </div>
                </div>
                <button
                  onClick={onLogoutClick}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors active:scale-90"
                  title="Logout"
                >
                  <LogoutIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="px-4 py-2">
                <Link
                  to="/auth"
                  state={{ tab: 'login' }}
                  className="block w-full text-center px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
