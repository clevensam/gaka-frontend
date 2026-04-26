import React from 'react';
import { motion } from 'motion/react';
import { ChevronRightIcon } from '../components/shared/Icons';
import { BlogCard } from '../components/blog/BlogCard';
import { BlogPost, AcademicFile, ResourceType } from '../lib/types';
import { SEO } from '../components/shared/SEO';

interface HomeProps {
  recentFiles: (AcademicFile & { moduleCode: string; moduleId: string })[];
  recentBlogPosts: BlogPost[];
  onExploreClick: () => void;
  onBlogClick: () => void;
  onPostClick: (post: BlogPost) => void;
  ResourceItem: React.FC<{ file: AcademicFile; moduleCode?: string; delay: number }>;
}

export const Home: React.FC<HomeProps> = ({ 
  recentFiles, 
  recentBlogPosts, 
  onExploreClick, 
  onBlogClick, 
  onPostClick,
  ResourceItem 
}) => {
  return (
    <div className="animate-fade-in">
      <SEO title="Home" />
      <div className="flex flex-col items-center text-center pt-6 pb-12 sm:pt-12 sm:pb-20 lg:pt-20">
        <div className="inline-flex items-center space-x-2 bg-emerald-50 dark:bg-[#1E1E1E] px-4 py-1.5 rounded-full mb-6 border border-emerald-100/50 dark:border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400">Portal v2.6</span>
        </div>
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[85px] font-black mb-6 tracking-tighter leading-[1.05] max-w-4xl px-2">
          Centralized <span className="gradient-text">Academic</span> Hub.
        </h2>
        <p className="text-sm sm:text-xl md:text-2xl text-slate-500 dark:text-white/40 max-w-2xl mb-10 font-medium px-6 leading-relaxed">Verified Computer Science materials for MUST students, instantly accessible.</p>
        <button onClick={onExploreClick} className="group flex items-center px-8 py-4 sm:px-20 sm:py-6 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full font-black text-xs sm:text-lg shadow-xl hover:scale-105 active:scale-95 transition-all">
          Explore Repository <ChevronRightIcon className="ml-3 w-4 h-4 sm:w-6 sm:h-6 group-hover:translate-x-1.5 transition-transform" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto mt-8 sm:mt-16 px-1">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">Recently <span className="text-emerald-600">Uploaded</span></h3>
            <button onClick={onExploreClick} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors">View All Resources</button>
         </div>
         <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {recentFiles.map((f, i) => (
              <ResourceItem key={f.id} file={f} moduleCode={f.moduleCode} delay={i * 50} />
            ))}
            {recentFiles.length === 0 && (
              <p className="text-center py-10 text-slate-400 text-xs font-medium">No recent uploads found.</p>
            )}
         </div>
      </div>

      {/* Blog Section on Home Page */}
      <div className="max-w-4xl mx-auto mt-20 sm:mt-32 px-1">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">Three Latest <span className="text-emerald-600">Blogs</span></h3>
            <button onClick={onBlogClick} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors">Read All Articles</button>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentBlogPosts.map((post, i) => (
              <BlogCard 
                key={post.id}
                post={post}
                onClick={onPostClick}
                index={i}
              />
            ))}
            {recentBlogPosts.length === 0 && (
              <div className="col-span-full py-16 text-center bg-slate-50/50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-100 dark:border-white/5">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">No blog posts yet.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
