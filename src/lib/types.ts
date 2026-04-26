
export type ResourceType = 'Notes' | 'Past Paper';
export type UserRole = 'admin' | 'student';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  email?: string;
}

export interface AcademicFile {
  id: string;
  title: string;
  type: ResourceType;
  downloadUrl: string;
  viewUrl: string;
  size?: string;
}

export interface Module {
  id: string;
  code: string;
  name: string;
  description: string;
  resources: AcademicFile[];
  year: number;
  semester: number;
}

export interface SearchFilters {
  query: string;
  type: ResourceType | 'All';
}

export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  cover_image?: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface BlogComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile;
}
