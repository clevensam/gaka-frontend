import React from 'react';
import { motion } from 'motion/react';
import { ArrowRightIcon } from '../shared/Icons';
import { BlogPost } from '../../lib/types';

interface BlogCardProps {
  post: BlogPost;
  onClick: (post: BlogPost) => void;
  index?: number;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, onClick, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 cursor-pointer h-full"
      onClick={() => onClick(post)}
    >
      {/* Card Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={post.cover_image || `https://picsum.photos/seed/${post.id}/800/500`}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {post.tags?.slice(0, 1).map(tag => (
            <span key={tag} className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-6">
          <img
            src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.full_name || 'Author')}&background=random`}
            alt={post.author?.full_name || 'Author'}
            className="w-8 h-8 rounded-xl object-cover border border-slate-100 dark:border-slate-700"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white leading-none mb-1">
              {post.author?.full_name || 'Unknown Author'}
            </span>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
              {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
        
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight tracking-tight">
          {post.title}
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed flex-1">
          {post.content.replace(/[#*`]/g, '').slice(0, 160)}...
        </p>
        
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            Read More <ArrowRightIcon className="w-3 h-3 ml-2" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
