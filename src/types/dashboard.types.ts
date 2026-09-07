import { BookWithReadingState } from './book.types';
import { Certificate } from './certificate.types';
import { Project } from './project.types';

export interface MainDashboardStats {
  totalBooks: number;
  currentlyReading: number;
  completedBooks: number;
  wishlistCount: number;
  totalCertificates: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  continueReadingList: BookWithReadingState[];
  recentBooks: BookWithReadingState[];
  recentCertificates: Certificate[];
  recentProjects: Project[];
}

export interface BooksDashboardStats {
  totalBooks: number;
  currentlyReading: number;
  completedBooks: number;
  notStartedBooks: number;
  wishlistCount: number;
  overallProgressPercentage: number;
  categoryDistribution: { name: string; count: number; percentage: number }[];
  languageDistribution: { name: string; count: number; percentage: number }[];
  recentlyAdded: BookWithReadingState[];
  recentlyCompleted: BookWithReadingState[];
}

export interface CertificatesDashboardStats {
  totalCertificates: number;
  earnedThisYear: number;
  expiringSoon: number;
  expired: number;
  noExpiry: number;
  categoryDistribution: { name: string; count: number }[];
  organizationDistribution: { name: string; count: number }[];
  yearlyDistribution: { year: string; count: number }[];
}

export interface ProjectsDashboardStats {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  plannedProjects: number;
  archivedProjects: number;
  statusDistribution: { status: string; count: number; percentage: number }[];
  technologyCounts: { name: string; count: number }[];
  categoryDistribution: { name: string; count: number }[];
}
