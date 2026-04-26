import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  HeartIcon, 
  ShareIcon, 
  SaveIcon, 
  MessageSquareIcon, 
  ArrowLeftIcon,
  CalendarIcon,
  TagIcon,
  SendIcon,
  MaximizeIcon,
  XIcon
} from '../shared/Icons';
import { BlogPost, BlogComment, Profile } from '../../lib/types';
import { SEO } from '../shared/SEO';

interface BlogPostViewProps {
  post: BlogPost;
  profile: Profile | null;
  onBack: () => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({ post, profile, onBack }) => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    fetchComments();
    checkIfLiked();
    fetchRelatedPosts();
    window.scrollTo(0, 0);
  }, [post.id]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { comments } = await api.blog.getComments(post.id);
      setComments(comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const checkIfLiked = async () => {
    if (!profile) return;
    try {
      const { liked } = await api.blog.checkLike(post.id);
      setIsLiked(liked);
    } catch (error) {
      // Not liked or error
    }
  };

  const fetchRelatedPosts = async () => {
    // Related posts not available via API, skip for now
  };

  const handleLike = async () => {
    if (!profile) return;
    
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    
    try {
      setIsLiked(newIsLiked);
      setLikesCount(newLikesCount);

      await api.blog.toggleLike({ post_id: post.id });
    } catch (error) {
      console.error('Error handling like:', error);
      setIsLiked(isLiked);
      setLikesCount(likesCount);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const { comment } = await api.blog.createComment({
        post_id: post.id,
        content: newComment.trim()
      });

      const updatedComments = [comment, ...comments];
      setComments(updatedComments);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Custom renderer for images to support lightboxing
  const MarkdownComponents = {
    img: ({ src, alt }: any) => (
      <div className="relative group my-8">
        <img
          src={src}
          alt={alt}
          className="w-full rounded-2xl shadow-lg cursor-zoom-in hover:opacity-95 transition-opacity"
          onClick={() => setLightboxImage(src)}
          referrerPolicy="no-referrer"
        />
        <button
          onClick={() => setLightboxImage(src)}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MaximizeIcon className="w-4 h-4" />
        </button>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <SEO 
        title={post.title} 
        description={post.content.replace(/[#*`]/g, '').slice(0, 160)} 
        image={post.cover_image}
      />
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* Floating Social Bar (Desktop) */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden 2xl:flex flex-col items-center gap-6 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-full shadow-2xl border border-slate-100 dark:border-white/5 z-40">
        <button
          onClick={handleLike}
          className={`group relative p-3.5 rounded-full transition-all ${isLiked ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-500' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
        >
          <HeartIcon className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none">
            {likesCount} Likes
          </span>
        </button>
        <button
          onClick={handleShare}
          className="group relative p-3.5 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
        >
          <ShareIcon className="w-6 h-6" />
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none">
            Share Article
          </span>
        </button>
        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`group relative p-3.5 rounded-full transition-all ${isSaved ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
        >
          <SaveIcon className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none">
            {isSaved ? 'Saved' : 'Save for later'}
          </span>
        </button>
        <div className="w-8 h-px bg-slate-100 dark:bg-white/5" />
        <button
          onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
          className="group relative p-3.5 rounded-full hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
        >
          <MessageSquareIcon className="w-6 h-6" />
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none">
            {comments.length} Comments
          </span>
        </button>
      </div>

      {/* Mobile Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 xl:hidden z-50 w-[92%] max-w-md">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/95 dark:bg-black/95 backdrop-blur-2xl border border-slate-200/50 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-2.5 flex items-center justify-between"
        >
          <button
            onClick={handleLike}
            className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all active:scale-90 ${isLiked ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
          >
            <HeartIcon className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{likesCount}</span>
          </button>
          
          <div className="w-px h-8 bg-slate-100 dark:bg-white/10 mx-1" />
          
          <button
            onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-90"
          >
            <MessageSquareIcon className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">{comments.length}</span>
          </button>
          
          <div className="w-px h-8 bg-slate-100 dark:bg-white/10 mx-1" />
          
          <button
            onClick={handleShare}
            className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-90"
          >
            <ShareIcon className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
          </button>
          
          <div className="w-px h-8 bg-slate-100 dark:bg-white/10 mx-1" />
          
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all active:scale-90 ${isSaved ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
          >
            <SaveIcon className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </motion.div>
      </div>

      {/* Main Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <button
          onClick={onBack}
          className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-all mb-12 group"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Feed
        </button>

        <header className="mb-12 sm:mb-20">
          <div className="flex flex-wrap gap-2 mb-10">
            {post.tags?.map(tag => (
              <span key={tag} className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                {tag}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[0.9] mb-12 tracking-tighter">
            {post.title}
          </h1>
          
          <div className="flex items-center justify-between py-10 border-y border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-5">
              <img
                src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.full_name || 'Author')}&background=random`}
                alt={post.author?.full_name || 'Author'}
                className="w-14 h-14 rounded-2xl border-2 border-white dark:border-white/10 shadow-xl"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-black text-slate-900 dark:text-white text-lg">{post.author?.full_name || 'Unknown Author'}</div>
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {new Date(post.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </header>

        {post.cover_image && (
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-[2rem] sm:rounded-[3rem] overflow-hidden mb-16 sm:mb-24 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5">
            <img
              src={post.cover_image}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="prose prose-lg sm:prose-xl prose-emerald dark:prose-invert max-w-none mb-24 sm:mb-32 font-medium leading-relaxed text-slate-700 dark:text-white/70">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Comments Section */}
        <section id="comments" className="pt-24 sm:pt-32 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              Discussion <span className="text-emerald-500 ml-2">{comments.length}</span>
            </h2>
          </div>

          <form onSubmit={handleComment} className="mb-20">
            <div className="flex gap-6">
              <img
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'Anonymous')}&background=random`}
                alt={profile?.full_name || 'Anonymous'}
                className="w-12 h-12 rounded-2xl flex-shrink-0 border-2 border-white dark:border-white/10 shadow-md"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Join the conversation..."
                  className="w-full p-6 bg-slate-50 dark:bg-white/5 border border-transparent rounded-[2rem] focus:bg-white dark:focus:bg-black focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all resize-none h-40 font-medium dark:text-white"
                />
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="inline-flex items-center px-10 py-4 bg-emerald-600 dark:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <SendIcon className="w-4 h-4 mr-2" />
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div className="space-y-12">
            {loadingComments ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-slate-400 dark:text-white/20 font-black uppercase tracking-widest text-xs py-12">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-6"
                >
                  <img
                    src={comment.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.full_name || 'User')}&background=random`}
                    alt={comment.author?.full_name || 'User'}
                    className="w-12 h-12 rounded-2xl flex-shrink-0 border-2 border-white dark:border-white/10 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <div className="bg-slate-50 dark:bg-white/5 rounded-[2rem] p-8">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-black text-slate-900 dark:text-white text-sm">{comment.author?.full_name || 'Unknown User'}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-white/60 font-medium leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="pt-24 sm:pt-32 mt-24 sm:mt-32 border-t border-slate-100 dark:border-white/5">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-16">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {relatedPosts.map((related) => (
                <div
                  key={related.id}
                  className="group cursor-pointer"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    // Since we don't have a real router, we just rely on the parent updating the post
                  }}
                >
                  <div className="aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5">
                    <img
                      src={related.cover_image || `https://picsum.photos/seed/${related.id}/800/450`}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors leading-tight tracking-tight">
                    {related.title}
                  </h3>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 md:p-12"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-8 right-8 p-3 text-white/50 hover:text-white transition-colors"
            >
              <XIcon className="w-8 h-8" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxImage}
              alt="Enlarged view"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
