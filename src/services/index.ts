import { APPWRITE_CONFIG } from './appwrite/client';
import { liveAuthService } from './appwrite/auth.service';
import { liveBooksService } from './appwrite/books.service';
import { liveCertificatesService } from './appwrite/certificates.service';
import { liveProjectsService } from './appwrite/projects.service';
import { liveDashboardService } from './appwrite/dashboard.service';
import {
  mockAuthService,
  mockBooksService,
  mockCertificatesService,
  mockProjectsService,
  mockDashboardService,
} from './mock/mockService';
import { r2StorageService } from './storage/r2.service';

export const isMockMode = APPWRITE_CONFIG.isMock;

// Unified Auth Service (Live Appwrite Auth vs. Local Mock Driver)
export const authService = isMockMode ? mockAuthService : liveAuthService;

// Unified Books Service (Live Appwrite Database vs. Local Mock Driver)
export const booksService = isMockMode ? mockBooksService : liveBooksService;

// Unified Certificates Service (Live Appwrite Database vs. Local Mock Driver)
export const certificatesService = isMockMode ? mockCertificatesService : liveCertificatesService;

// Unified Projects Service (Live Appwrite Database vs. Local Mock Driver)
export const projectsService = isMockMode ? mockProjectsService : liveProjectsService;

// Unified Dashboard Service (Live Appwrite Aggregator vs. Local Mock Driver)
export const dashboardService = isMockMode ? mockDashboardService : liveDashboardService;

// Unified Storage Service
export const storageService = r2StorageService;

export * from './storage/r2.service';
export * from './bookSearchApi.service';

