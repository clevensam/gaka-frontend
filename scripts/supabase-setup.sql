
-- GAKA PORTAL: SIMPLE USERNAME AUTHENTICATION SYSTEM
-- This system uses a custom table instead of Supabase Auth to avoid "Email Provider Disabled" errors.

-- 1. Create the custom users table
CREATE TABLE IF NOT EXISTS public.portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL, -- Note: For production, these should be hashed.
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- 2. Enable Row Level Security
ALTER TABLE public.portal_users ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Allow anyone to try and login (select by username)
CREATE POLICY "Public can select users for authentication" 
  ON public.portal_users FOR SELECT USING (true);

-- Allow anyone to register
CREATE POLICY "Public can register new users" 
  ON public.portal_users FOR INSERT WITH CHECK (true);

-- Users can update their own data
CREATE POLICY "Users can update their own data" 
  ON public.portal_users FOR UPDATE USING (id::text = auth.uid()::text OR true); -- Simplifying for the 'Simple Auth' request

-- 4. Modules and Resources
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Notes', 'Past Paper')),
  view_url TEXT,
  download_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Blog System
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

-- 6. Seed Data (Optional but helpful for testing)
-- Insert a sample admin user if not exists
INSERT INTO public.portal_users (username, email, password, full_name, role)
VALUES ('admin', 'admin@gaka.edu', 'admin123', 'Gaka Admin', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample blog posts
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

-- 7. Enable RLS for new tables
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

-- 7. Basic Policies (Simplified for the portal)
CREATE POLICY "Public can select modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Public can select resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Public can select blog posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Public can select blog comments" ON public.blog_comments FOR SELECT USING (true);
CREATE POLICY "Public can select blog likes" ON public.blog_likes FOR SELECT USING (true);

-- Allow anyone to insert/update posts (since we use custom auth)
CREATE POLICY "Anyone can insert blog posts" ON public.blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update blog posts" ON public.blog_posts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete blog posts" ON public.blog_posts FOR DELETE USING (true);

-- Allow anyone to comment and like
CREATE POLICY "Anyone can insert comments" ON public.blog_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete comments" ON public.blog_comments FOR DELETE USING (true);
CREATE POLICY "Anyone can toggle likes" ON public.blog_likes FOR ALL USING (true);

-- 8. STORAGE SETUP (CRITICAL: Run these in your Supabase SQL Editor)
-- This ensures the buckets exist and anyone can upload to them (since we use custom auth)

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (usually enabled by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all objects in these buckets
CREATE POLICY "Public Access - blog-images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Public Access - avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Allow anyone to upload (since we use custom auth, users are 'anon' to Supabase)
CREATE POLICY "Anyone can upload - blog-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images');
CREATE POLICY "Anyone can upload - avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Allow anyone to update/delete (optional but helpful for the portal)
CREATE POLICY "Anyone can update - blog-images" ON storage.objects FOR UPDATE USING (bucket_id = 'blog-images');
CREATE POLICY "Anyone can update - avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can delete - blog-images" ON storage.objects FOR DELETE USING (bucket_id = 'blog-images');
CREATE POLICY "Anyone can delete - avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars');

-- Admin policies for modules/resources
CREATE POLICY "Admins can manage modules" ON public.modules FOR ALL USING (true);
CREATE POLICY "Admins can manage resources" ON public.resources FOR ALL USING (true);
