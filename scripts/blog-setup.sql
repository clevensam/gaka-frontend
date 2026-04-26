
-- GAKA PORTAL: BLOG SYSTEM SETUP
-- This file contains the SQL for the blog components only.
-- Note: These tables reference public.portal_users(id).

-- 1. Create Blog Tables
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.portal_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.portal_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_likes (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.portal_users(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

-- 2. Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

-- 3. Security Policies
-- Public Read Access
CREATE POLICY "Public can select blog posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Public can select blog comments" ON public.blog_comments FOR SELECT USING (true);
CREATE POLICY "Public can select blog likes" ON public.blog_likes FOR SELECT USING (true);

-- Registered User Actions
CREATE POLICY "Registered users can insert blog posts" ON public.blog_posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Registered users can update blog posts" ON public.blog_posts FOR UPDATE USING (auth.role() = 'authenticated');

-- Anyone Actions
CREATE POLICY "Anyone can insert comments" ON public.blog_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can toggle likes" ON public.blog_likes FOR ALL USING (true);

-- 4. Sample Data
DO $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT id INTO admin_id FROM public.portal_users WHERE username = 'admin' LIMIT 1;
    
    IF admin_id IS NOT NULL THEN
        INSERT INTO public.blog_posts (author_id, title, content, cover_image, tags)
        VALUES 
        (admin_id, 'Welcome to the Gaka Community Portal', 'We are excited to launch the new Gaka Community Portal. This space is designed for students to share knowledge, resources, and experiences. Feel free to explore the modules and start contributing!', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200', ARRAY['Community', 'Welcome', 'Gaka']),
        (admin_id, 'Tips for Mastering Your University Modules', 'University life can be challenging, but with the right strategies, you can excel in your modules. Here are our top 5 tips for staying ahead of your coursework...', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200', ARRAY['StudyTips', 'Education', 'Success']),
        (admin_id, 'The Future of Technology in Education', 'As technology continues to evolve, the way we learn is changing rapidly. From AI-driven tutoring to immersive VR classrooms, the future of education looks bright...', 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1200', ARRAY['Technology', 'Future', 'Learning'])
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
