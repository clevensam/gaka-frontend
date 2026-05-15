import React from 'react';
import { AcademicFile, BlogPost } from '../lib/types';
import { SEO } from '../components/shared/SEO';
import { StoriesBar } from '../components/features/StoriesBar';
import { FeedPost } from '../components/features/FeedPost';
import { BlogCard } from '../components/blog/BlogCard';

interface HomeProps {
  recentFiles: (AcademicFile & { moduleCode: string; moduleId: string })[];
  recentBlogPosts: BlogPost[];
  onExploreClick: () => void;
  onBlogClick: () => void;
  onPostClick: (post: BlogPost) => void;
  onStoryClick: (resourceId: string, moduleId: string) => void;
  onModuleClick: (moduleId: string) => void;
  savedResourceIds: string[];
  onToggleSave: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({ 
  recentFiles, recentBlogPosts, onExploreClick, onBlogClick, 
  onPostClick, onStoryClick, onModuleClick, savedResourceIds, onToggleSave
}) => {
  return (
    <div className="animate-fade-in pb-8">
      <SEO title="Home" />

      {/* Stories Bar */}
      {recentFiles.length > 0 && (
        <div className="mb-6 border-b border-slate-50 dark:border-white/5 pb-4">
          <StoriesBar resources={recentFiles} onStoryClick={onStoryClick} />
        </div>
      )}

      {/* Feed Header */}
      <div className="max-w-ig-feed mx-auto w-full mb-4 px-1">
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Recent Uploads</h2>
        <p className="text-[10px] font-medium text-slate-400 dark:text-white/30">Latest resources added to the repository</p>
      </div>

      {/* Feed Posts */}
      <div className="space-y-4 sm:space-y-6">
        {recentFiles.map((f, i) => (
          <FeedPost 
            key={f.id}
            file={f}
            isSaved={savedResourceIds.includes(f.id)}
            onToggleSave={onToggleSave}
            onModuleClick={onModuleClick}
            delay={i * 80}
          />
        ))}
        {recentFiles.length === 0 && (
          <div className="text-center py-16 bg-slate-50/50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-100 dark:border-white/5 max-w-ig-feed mx-auto w-full">
            <p className="text-slate-400 dark:text-white/20 font-black uppercase tracking-widest text-[10px]">No recent uploads</p>
            <button onClick={onExploreClick} className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md active:scale-95 transition-all">
              Explore Modules
            </button>
          </div>
        )}
      </div>

      {/* Blog Preview */}
      {recentBlogPosts.length > 0 && (
        <div className="mt-12 sm:mt-16 max-w-ig-feed mx-auto w-full">
          <div className="flex items-center justify-between mb-5 px-1">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">From the Blog</h3>
              <p className="text-[9px] font-medium text-slate-400 dark:text-white/30">Latest community posts</p>
            </div>
            <button 
              onClick={onBlogClick}
              className="text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors active:scale-95"
            >
              See All
            </button>
          </div>
          <div className="space-y-4">
            {recentBlogPosts.map((post, i) => (
              <BlogCard key={post.id} post={post} onClick={onPostClick} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
