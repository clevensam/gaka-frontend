import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  SearchIcon, 
  FilterIcon, 
  PlusIcon, 
  CalendarIcon, 
  TagIcon, 
  MessageSquareIcon, 
  HeartIcon,
  ShareIcon,
  ArrowRightIcon,
  GlobeIcon
} from '../shared/Icons';
import { BlogPost, Profile } from '../../lib/types';
import { BlogCard } from './BlogCard';
import { SEO } from '../shared/SEO';

interface BlogHomeProps {
  profile: Profile | null;
  onPostClick: (post: BlogPost) => void;
  onCreatePost: () => void;
}

export const BlogHome: React.FC<BlogHomeProps> = ({ profile, onPostClick, onCreatePost }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());

  const TAG_LIMIT = 5;
  const displayedTags = showAllTags ? allTags : allTags.slice(0, TAG_LIMIT);

  useEffect(() => {
    fetchPosts();
    if (profile) {
      fetchUserLikes();
    }

    // Listen for new posts being published
    const handleRefresh = () => fetchPosts();
    window.addEventListener('blog-post-published', handleRefresh);
    
    return () => window.removeEventListener('blog-post-published', handleRefresh);
  }, [profile]);

  const fetchPosts = async () => {
    setLoading(true);
    console.log('Fetching blog posts...');
    try {
      const { posts } = await api.blog.getPosts();

      setPosts(posts || []);

      const tags = new Set<string>();
      (posts || []).forEach((post: BlogPost) => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach((tag: string) => {
            if (tag && tag.trim()) tags.add(tag.trim());
          });
        }
      });
      setAllTags(Array.from(tags).sort());
    } catch (error) {
      console.error('Unexpected error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikes = async () => {
    // User likes are fetched per-post via toggle API
  };

  const handleLike = async (e: React.MouseEvent, post: BlogPost) => {
    e.stopPropagation();
    if (!profile) {
      alert('Please login to like posts');
      return;
    }

    const isLiked = userLikes.has(post.id);
    const prevUserLikes = new Set(userLikes);
    const prevPosts = [...posts];
    
    try {
      const { liked } = await api.blog.toggleLike({ post_id: post.id });
      
      setUserLikes(prev => {
        const next = new Set(prev);
        if (liked) {
          next.add(post.id);
        } else {
          next.delete(post.id);
        }
        return next;
      });
      
      setPosts(prev => prev.map(p => 
        p.id === post.id ? { ...p, likes_count: liked ? (p.likes_count || 0) + 1 : Math.max(0, (p.likes_count || 0) - 1) } : p
      ));
    } catch (error) {
      console.error('Error handling like:', error);
      setUserLikes(prevUserLikes);
      setPosts(prevPosts);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || post.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-16">
      <SEO title="Blog" description="Explore stories, thinking, and expertise from the GAKA community." />
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-20 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full mb-4 border border-emerald-100 dark:border-emerald-500/20">
            <GlobeIcon className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-400">Community Journal</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.95] mb-6"
          >
            Ideas that <span className="text-emerald-600 dark:text-emerald-500">matter.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-xl text-slate-500 dark:text-white/40 font-medium leading-relaxed max-w-lg"
          >
            Explore stories, thinking, and expertise from writers on any topic.
          </motion.p>
        </div>
        
        {profile && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreatePost}
            className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex-shrink-0"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Start Writing
          </motion.button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-black py-4 mb-8 sm:mb-12 border-b border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles, topics, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 outline-none transition-all text-sm font-bold dark:text-white"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                !selectedTag 
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-white dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-100 dark:border-white/10 hover:border-emerald-500/50'
              }`}
            >
              All Topics
            </button>
            {displayedTags.map((tag: string) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  selectedTag === tag 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-white dark:bg-white/5 text-slate-500 dark:text-white/40 border-slate-100 dark:border-white/10 hover:border-emerald-500/50'
                }`}
              >
                {tag}
              </button>
            ))}
            
            {allTags.length > TAG_LIMIT && (
              <button
                onClick={() => setShowAllTags(!showAllTags)}
                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                {showAllTags ? 'Show Less' : `+${allTags.length - TAG_LIMIT} More`}
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-24 sm:py-32 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-white/5 px-6">
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <FilterIcon className="w-10 h-10 text-slate-300 dark:text-white/20" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">No articles found</h3>
          <p className="text-slate-500 dark:text-white/40 font-medium mb-10 max-w-xs mx-auto">
            {searchQuery || selectedTag 
              ? "We couldn't find any articles matching your current filters. Try adjusting your search."
              : "The journal is currently empty. Be the first to share your thoughts with the community!"}
          </p>
          
          {!(searchQuery || selectedTag) && profile && (
            <button 
              onClick={onCreatePost}
              className="px-10 py-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
            >
              Create First Post
            </button>
          )}
          
          {(searchQuery || selectedTag) && (
            <button 
              onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
              className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-16 sm:space-y-24">
          {/* Featured Post */}
          {featuredPost && !searchQuery && !selectedTag && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-8 lg:gap-12 bg-white dark:bg-[#0A0A0A] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer"
              onClick={() => onPostClick(featuredPost)}
            >
              <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto relative overflow-hidden">
                <img
                  src={featuredPost.cover_image || 'https://picsum.photos/seed/blog/1200/800'}
                  alt={featuredPost.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 lg:hidden" />
                <div className="absolute bottom-6 left-6 right-6 lg:hidden">
                  <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg mb-2 inline-block">
                    Featured Article
                  </span>
                  <h2 className="text-2xl font-black text-white leading-tight">{featuredPost.title}</h2>
                </div>
              </div>
              
              <div className="lg:col-span-5 p-8 sm:p-12 lg:pl-0 flex flex-col justify-center">
                <div className="hidden lg:flex items-center gap-4 mb-8">
                  <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                    Featured Article
                  </span>
                  <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {new Date(featuredPost.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                
                <h2 className="hidden lg:block text-4xl xl:text-5xl font-black text-slate-900 dark:text-white mb-6 group-hover:text-emerald-600 transition-colors tracking-tighter leading-tight">
                  {featuredPost.title}
                </h2>
                
                <div className="text-slate-500 dark:text-white/40 mb-8 text-lg font-medium leading-relaxed">
                  {featuredPost.content.replace(/[#*`]/g, '').slice(0, 200)}...
                </div>
                
                <div className="hidden lg:flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest mb-10 group-hover:translate-x-1 transition-transform">
                  Read Full Article <ArrowRightIcon className="w-4 h-4 ml-2" />
                </div>
                
                  <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-50 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <img
                        src={featuredPost.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(featuredPost.author?.full_name || 'Author')}&background=random`}
                        alt={featuredPost.author?.full_name || 'Author'}
                        className="w-12 h-12 rounded-2xl border-2 border-white dark:border-white/10 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="block font-black text-slate-900 dark:text-white text-sm">{featuredPost.author?.full_name || 'Unknown Author'}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contributor</span>
                      </div>
                    </div>
                  </div>
              </div>
            </motion.div>
          )}

          {/* Regular Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {(featuredPost && (searchQuery || selectedTag) ? filteredPosts : regularPosts).map((post, index) => (
              <BlogCard 
                key={post.id}
                post={post}
                onClick={onPostClick}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
