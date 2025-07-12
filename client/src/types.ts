import { Key, ReactNode } from "react";

// types.d.ts or interfaces.ts
export interface Timestamps {
  created_at?: string;
  updated_at?: string;
}

export interface EntityWithId {
  _id?: string;
}

// ========== EDUCATION ==========
export interface Education extends EntityWithId {
  school: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date: string | null;
  description: string;
}

// ========== EXPERIENCE ==========
export interface Experience extends EntityWithId {
  title: string;
  position?: string; // Alias for title if needed
  company: string;
  start_date: string;
  end_date: string | null;
  description: string;
}

// ========== CANDIDATE TYPES ==========
export interface BaseCandidate {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  avatar?: File | string;
  resume?: File | string;
}

export interface ProfessionalFormation {
  title: string;
  institution: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface Project {
  name: string;
  description: string;
  link?: string;
}

export interface CandidateSignupData extends BaseCandidate {
  password: string;
  confirm_password: string;
  terms_accepted: boolean;
  education: Education[];
  experience: Experience[];
  professional_formation: ProfessionalFormation[];
  projects: Project[];
}

export interface CandidateProfile extends BaseCandidate, EntityWithId, Timestamps {
  education: Education[];
  experience: Experience[];
  status?: 'active' | 'archived';
}

export interface SimpleCandidate extends EntityWithId {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  skills?: string[];
  education?: any;
  experience?: any;
  resume_url?: string;
  adminCV?: string;
  status?: string;
}

// ========== COMPANY TYPES ==========
export interface CompanyInfo extends EntityWithId, Timestamps {
  company_name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  description: string;
  industry: string;
  company_size: string;
  founded_year: string;
  verified: boolean;
  logo_url: string | null;
}

// ========== JOB TYPES ==========
export interface JobPost extends EntityWithId, Timestamps {
  company_id?: string;
  job_title: string;
  salary: string;
  looking_for_profile: string;
  required_experience: string;
  required_skills: string[];
  status: 'active' | 'draft' | 'closed';
  applicants?: number;
}

// ========== API RESPONSES ==========
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
}

export interface JobApiResponse extends ApiResponse<JobPost | JobPost[]> {}
export interface CandidateApiResponse extends ApiResponse<CandidateProfile | CandidateProfile[]> {}
export interface CompanyApiResponse extends ApiResponse<CompanyInfo> {}

// ========== FORM TYPES ==========
export interface JobFormData
  extends Omit<JobPost, '_id' | 'created_at' | 'updated_at' | 'company_id' | 'applicants'> {
  required_skills_input: string; // For form input as comma-separated string
}

export interface CandidateFormData
  extends Omit<CandidateSignupData, 'avatar' | 'resume' | 'terms_accepted' | 'confirm_password'> {
  avatar?: string;
  resume?: string;
}