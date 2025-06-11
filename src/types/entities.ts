
import type { Tables } from '@/integrations/supabase/types';

// Core domain types
export interface User extends Tables<'users'> {
  matches?: Match[];
  swipes?: Swipe[];
}

export interface Vacancy extends Tables<'vacancies'> {
  employer?: User;
  matches?: Match[];
}

export interface Match extends Tables<'matches'> {
  participant_a_user?: User;
  participant_b_user?: User;
  vacancy?: Vacancy;
  isExpired?: boolean;
  timeLeft?: number;
}

export interface Swipe extends Tables<'swipes'> {
  target?: User | Vacancy;
}

// UI State types
export interface SwipeState {
  currentIndex: number;
  isLoading: boolean;
  targets: (User | Vacancy)[];
  error?: string;
}

export interface MatchState {
  showModal: boolean;
  matchData: User | Vacancy | null;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// Form types
export interface UserProfileForm {
  first_name: string;
  last_name?: string;
  city?: string;
  skills?: string[];
  experience?: string;
  achievement?: string;
  salary_expectation?: number;
  portfolio_url?: string;
  resume_url?: string;
  company?: string;
}

export interface VacancyForm {
  title: string;
  description: string;
  city: string;
  skills_required?: string[];
  salary_min?: number;
  salary_max?: number;
  team_lead_name?: string;
  team_lead_avatar?: string;
}

// Constants
export const USER_ROLES = {
  SEEKER: 'seeker' as const,
  EMPLOYER: 'employer' as const,
} as const;

export const SWIPE_DIRECTIONS = {
  LIKE: 'like' as const,
  DISLIKE: 'dislike' as const,
} as const;

export const TARGET_TYPES = {
  USER: 'user' as const,
  VACANCY: 'vacancy' as const,
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type SwipeDirection = typeof SWIPE_DIRECTIONS[keyof typeof SWIPE_DIRECTIONS];
export type TargetType = typeof TARGET_TYPES[keyof typeof TARGET_TYPES];
