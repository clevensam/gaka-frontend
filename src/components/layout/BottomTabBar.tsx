import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, HomeFilledIcon,
  ExploreIcon, ExploreFilledIcon,
  BlogIcon, BlogFilledIcon,
  BookmarkIcon, SavedFilledIcon,
  UserIcon, ProfileFilledIcon
} from '../shared/Icons';
import { Profile } from '../../lib/types';

interface BottomTabBarProps {
  profile: Profile | null;
}

const tabs = [
  { id: 'home', label: 'Home', icon: HomeIcon, activeIcon: HomeFilledIcon, path: '/' },
  { id: 'explore', label: 'Explore', icon: ExploreIcon, activeIcon: ExploreFilledIcon, path: '/modules' },
  { id: 'blog', label: 'Blog', icon: BlogIcon, activeIcon: BlogFilledIcon, path: '/blog' },
  { id: 'saved', label: 'Saved', icon: BookmarkIcon, activeIcon: SavedFilledIcon, path: '/saved' },
  { id: 'profile', label: 'Profile', icon: UserIcon, activeIcon: ProfileFilledIcon, path: null },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ profile }) => {
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

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 ig-safe-bottom">
      <div className="max-w-ig-container mx-auto flex items-center justify-around h-14 sm:h-16 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path) || (tab.id === 'profile' && location.pathname === '/about');
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
  );
};
