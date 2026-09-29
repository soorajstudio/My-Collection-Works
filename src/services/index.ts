import {
  supabaseAuthService,
  supabaseBooksService,
  supabaseCertificatesService,
  supabaseProjectsService,
  supabaseDashboardService,
  supabaseStorageService,
} from './supabase';
import {
  mockAuthService,
  mockBooksService,
  mockCertificatesService,
  mockProjectsService,
  mockDashboardService,
} from './mock/mockService';

export const isMockMode = import.meta.env.VITE_USE_MOCK_FALLBACK === 'true';

// Unified Auth Service (Supabase Auth vs Local Mock Driver)
export const authService = isMockMode ? mockAuthService : supabaseAuthService;

// Unified Books Service (Supabase Database vs Local Mock Driver)
export const booksService = isMockMode ? mockBooksService : supabaseBooksService;

// Unified Certificates Service (Supabase Database vs Local Mock Driver)
export const certificatesService = isMockMode ? mockCertificatesService : supabaseCertificatesService;

// Unified Projects Service (Supabase Database vs Local Mock Driver)
export const projectsService = isMockMode ? mockProjectsService : supabaseProjectsService;

// Unified Dashboard Service (Supabase Aggregator vs Local Mock Driver)
export const dashboardService = isMockMode ? mockDashboardService : supabaseDashboardService;

// Unified Storage Service (Supabase Storage)
export const storageService = supabaseStorageService;

export * from './supabase/storage.service';
export * from './bookSearchApi.service';
export * from './supabase';
