import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import { uploadImage } from '../../lib/storage';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  XIcon, 
  SendIcon, 
  SaveIcon, 
  EyeIcon, 
  ImageIcon, 
  TagIcon, 
  GlobeIcon,
  CheckIcon,
  ArrowLeftIcon,
  PlusIcon
} from '../shared/Icons';
import { Profile } from '../../lib/types';

interface BlogEditorProps {
  profile: Profile;
  onClose: () => void;
  onPublish: () => void;
}

type EditorStep = 'write' | 'preview';

export const BlogEditor: React.FC<BlogEditorProps> = ({ profile, onClose, onPublish }) => {
  const [step, setStep] = useState<EditorStep>('write');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedPostId, setPublishedPostId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSuggestedTags();
  }, []);

  const handleUpload = async (file: File): Promise<string | null> => {
    return await uploadImage(file, profile.id);
  };

  const fetchSuggestedTags = async () => {
    try {
      const response = await api.blog.getPosts();
      const data = response.posts;
      
      const tagCounts: Record<string, number> = {};
      data.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag)
        .slice(0, 10);
      
      setSuggestedTags(sortedTags);
    } catch (err) {
      console.error('Error fetching suggested tags:', err);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setIsPublishing(true);
    try {
      const { post } = await api.blog.createPost({
        title: title.trim(),
        content: content.trim(),
        cover_image: coverImage.trim() || undefined,
        tags
      });
      
      window.dispatchEvent(new CustomEvent('blog-post-published'));
      
      setPublishedPostId(post.id);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error publishing post:', error);
      alert('Failed to publish post. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const copyToClipboard = () => {
    if (!publishedPostId) return;
    const url = `${window.location.origin}/blog/${publishedPostId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-black z-[100] flex flex-col"
    >
      {/* Editor Header */}
      <header className="h-20 border-b border-slate-100 dark:border-white/5 px-4 sm:px-8 flex items-center justify-between bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
          >
            <XIcon className="w-6 h-6" />
          </button>
          <div className="hidden sm:block h-8 w-px bg-slate-100 dark:border-white/5" />
          <div className="hidden md:flex items-center gap-3">
            {[
              { id: 'write', label: '1. WRITE' },
              { id: 'preview', label: '2. PREVIEW' }
            ].map((s) => (
              <span 
                key={s.id}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  step === s.id 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                    : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                {s.label}
              </span>
            ))}
          </div>
          <div className="md:hidden text-[10px] font-black uppercase tracking-widest text-emerald-600">
            Step {step === 'write' ? '1' : '2'}/2
          </div>
        </div>

        <div className="flex items-center gap-3">
          {step !== 'write' && (
            <button
              onClick={() => setStep('write')}
              className="px-6 py-3 text-slate-500 dark:text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"
            >
              Back
            </button>
          )}
          
          {step === 'write' && (
            <button
              onClick={() => setStep('preview')}
              disabled={!title.trim() || !content.trim()}
              className="px-10 py-3.5 bg-emerald-400/80 dark:bg-emerald-500/40 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-full shadow-xl shadow-emerald-500/10 hover:bg-emerald-500/60 disabled:opacity-50 transition-all"
            >
              PREVIEW
            </button>
          )}

          {step === 'preview' && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="inline-flex items-center px-10 py-3.5 bg-emerald-600 dark:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-full shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50 transition-all"
            >
              {isPublishing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <SendIcon className="w-4 h-4 mr-2" />
              )}
              Publish
            </button>
          )}
        </div>
      </header>

      {/* Editor Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-black">
        <AnimatePresence mode="wait">
          {step === 'write' && (
            <motion.div
              key="write"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 sm:py-12">
                <div className="max-w-3xl mx-auto space-y-12">
                  {/* Title & Cover Section */}
                  <div className="space-y-12">
                    <div className="space-y-8">
                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 ml-2">
                          ARTICLE TITLE
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter a catchy title..."
                          className="w-full p-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500/50 outline-none transition-all text-xl sm:text-2xl font-black dark:text-white tracking-tight leading-tight placeholder:text-slate-200 dark:placeholder:text-white/10"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 ml-2">
                          COVER IMAGE
                        </label>
                        <div className="flex flex-col gap-4">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={coverImage}
                              onChange={(e) => setCoverImage(e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="flex-1 p-6 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl focus:ring-8 focus:ring-emerald-500/5 focus:border-emerald-500/50 outline-none transition-all font-bold dark:text-white"
                            />
                            <button
                              onClick={() => coverInputRef.current?.click()}
                              className="p-6 bg-emerald-600 text-white rounded-3xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 group"
                              title="Upload from computer"
                            >
                              <ImageIcon className="w-7 h-7 group-hover:scale-110 transition-transform" />
                            </button>
                            <input 
                              type="file"
                              ref={coverInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const url = await handleUpload(file);
                                  if (url) setCoverImage(url);
                                }
                              }}
                            />
                          </div>
                          <button
                            onClick={() => setCoverImage(`https://picsum.photos/seed/${Date.now()}/1200/600`)}
                            className="w-full px-8 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-600 dark:text-white/60 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:border-emerald-500/50 transition-all shadow-sm"
                          >
                            Randomize Cover
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                          Tags (Optional)
                        </label>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                              {tag}
                              <button onClick={() => removeTag(tag)} className="ml-3 hover:text-emerald-800 dark:hover:text-emerald-200">
                                <XIcon className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="relative">
                          <TagIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Add tags..."
                            className="w-full pl-14 pr-6 py-5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all font-bold dark:text-white"
                          />
                        </div>

                        {suggestedTags.length > 0 && (
                          <div className="mt-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Suggested Tags</span>
                            <div className="flex flex-wrap gap-2">
                              {suggestedTags
                                .filter(tag => !tags.includes(tag))
                                .map(tag => (
                                  <button
                                    key={tag}
                                    onClick={() => setTags([...tags, tag])}
                                    className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                                  >
                                    + {tag}
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Editor Section */}
                  <div className="relative min-h-[500px] rounded-[3rem] border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-black transition-all overflow-hidden">
                    <div className="p-6 border-b border-slate-50 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Article Content</span>
                    </div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Start writing your masterpiece..."
                      className="w-full min-h-[400px] p-8 sm:p-12 outline-none resize-none font-mono text-lg leading-relaxed bg-transparent dark:text-white/80"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-24"
            >
              <div className="bg-white dark:bg-[#0A0A0A] rounded-[3rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="p-8 sm:p-20">
                  <div className="flex items-center gap-5 mb-12">
                    <img
                      src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=random`}
                      alt={profile.full_name}
                      className="w-14 h-14 rounded-2xl border-2 border-white dark:border-white/10 shadow-xl"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-black text-slate-900 dark:text-white text-lg">{profile.full_name}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Draft Preview</div>
                    </div>
                  </div>

                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-12 leading-[1.1] tracking-tighter">{title}</h1>
                  
                  {coverImage && (
                    <div className="aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 shadow-2xl border border-slate-100 dark:border-white/5">
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}

                  <div className="prose prose-lg sm:prose-xl prose-emerald dark:prose-invert max-w-none font-medium leading-relaxed text-slate-700 dark:text-white/70">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#0A0A0A] w-full max-w-md rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-slate-100 dark:border-white/5 text-center"
            >
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckIcon className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Post Published!</h3>
              <p className="text-slate-500 dark:text-white/40 font-medium mb-10">Your masterpiece is now live for the world to see.</p>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 flex items-center justify-between gap-4">
                  <span className="text-xs font-mono text-slate-400 truncate flex-1 text-left">
                    {`${window.location.origin}/blog/${publishedPostId}`}
                  </span>
                  <button 
                    onClick={copyToClipboard}
                    className="shrink-0 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                
                <button
                  onClick={onPublish}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all"
                >
                  Back to Blog
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
