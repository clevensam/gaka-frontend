
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
  views_count?: number;
  downloads_count?: number;
  likes_count?: number;
  created_at?: string;
  moduleCode?: string;
  moduleName?: string;
  moduleId?: string;
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
