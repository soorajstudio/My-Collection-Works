import {
  MainDashboardStats,
  BooksDashboardStats,
  CertificatesDashboardStats,
  ProjectsDashboardStats,
} from '../../types/dashboard.types';
import { liveBooksService } from './books.service';
import { liveCertificatesService } from './certificates.service';
import { liveProjectsService } from './projects.service';
import { getCertificateExpiryStatus } from '../../utils/formatters';

export const liveDashboardService = {
  async getMainDashboardStats(): Promise<MainDashboardStats> {
    const [books, certs, projects] = await Promise.all([
      liveBooksService.getBooks(),
      liveCertificatesService.getCertificates(),
      liveProjectsService.getProjects(),
    ]);

    const currentlyReading = books.filter((b) => b.readingState?.status === 'Reading').length;
    const completedBooks = books.filter((b) => b.readingState?.status === 'Completed').length;
    const wishlistCount = books.filter((b) => b.readingState?.wishlist).length;

    const activeProjects = projects.filter((p) => p.status === 'In Progress').length;
    const completedProjects = projects.filter((p) => p.status === 'Completed').length;

    const continueReadingList = books
      .filter((b) => b.readingState?.status === 'Reading')
      .sort((a, b) => {
        const tA = a.readingState?.lastReadAt ? new Date(a.readingState.lastReadAt).getTime() : 0;
        const tB = b.readingState?.lastReadAt ? new Date(b.readingState.lastReadAt).getTime() : 0;
        return tB - tA;
      })
      .slice(0, 4);

    return {
      totalBooks: books.length,
      currentlyReading,
      completedBooks,
      wishlistCount,
      totalCertificates: certs.length,
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      continueReadingList,
      recentBooks: books.slice(0, 3),
      recentCertificates: certs.slice(0, 3),
      recentProjects: projects.slice(0, 3),
    };
  },

  async getBooksDashboardStats(): Promise<BooksDashboardStats> {
    const books = await liveBooksService.getBooks();
    const currentlyReading = books.filter((b) => b.readingState?.status === 'Reading').length;
    const completedBooks = books.filter((b) => b.readingState?.status === 'Completed').length;
    const notStartedBooks = books.filter((b) => !b.readingState || b.readingState.status === 'Not Started').length;
    const wishlistCount = books.filter((b) => b.readingState?.wishlist).length;

    const startedBooks = books.filter((b) => (b.readingState?.progressPercentage ?? 0) > 0);
    const overallProgress = startedBooks.length > 0
      ? Math.round(startedBooks.reduce((acc, b) => acc + (b.readingState?.progressPercentage || 0), 0) / startedBooks.length)
      : 0;

    const catMap: Record<string, number> = {};
    books.forEach((b) => {
      catMap[b.category] = (catMap[b.category] || 0) + 1;
    });
    const categoryDistribution = Object.entries(catMap).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / (books.length || 1)) * 100),
    }));

    const langMap: Record<string, number> = {};
    books.forEach((b) => {
      langMap[b.language] = (langMap[b.language] || 0) + 1;
    });
    const languageDistribution = Object.entries(langMap).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / (books.length || 1)) * 100),
    }));

    const recentlyCompleted = books
      .filter((b) => b.readingState?.status === 'Completed')
      .sort((a, b) => {
        const tA = a.readingState?.lastReadAt ? new Date(a.readingState.lastReadAt).getTime() : 0;
        const tB = b.readingState?.lastReadAt ? new Date(b.readingState.lastReadAt).getTime() : 0;
        return tB - tA;
      })
      .slice(0, 4);

    return {
      totalBooks: books.length,
      currentlyReading,
      completedBooks,
      notStartedBooks,
      wishlistCount,
      overallProgressPercentage: overallProgress,
      categoryDistribution,
      languageDistribution,
      recentlyAdded: books.slice(0, 4),
      recentlyCompleted,
    };
  },

  async getCertificatesDashboardStats(): Promise<CertificatesDashboardStats> {
    const certs = await liveCertificatesService.getCertificates();
    const currentYear = new Date().getFullYear().toString();

    const earnedThisYear = certs.filter((c) => c.issueDate.startsWith(currentYear)).length;
    let expiringSoon = 0;
    let expired = 0;
    let noExpiry = 0;

    certs.forEach((c) => {
      const st = getCertificateExpiryStatus(c.hasNoExpiry, c.expiryDate).status;
      if (st === 'expiringSoon') expiringSoon++;
      else if (st === 'expired') expired++;
      else if (st === 'noExpiry') noExpiry++;
    });

    const catMap: Record<string, number> = {};
    const orgMap: Record<string, number> = {};
    const yearMap: Record<string, number> = {};

    certs.forEach((c) => {
      catMap[c.category] = (catMap[c.category] || 0) + 1;
      orgMap[c.issuingOrg] = (orgMap[c.issuingOrg] || 0) + 1;
      const yr = c.issueDate.split('-')[0];
      if (yr) yearMap[yr] = (yearMap[yr] || 0) + 1;
    });

    return {
      totalCertificates: certs.length,
      earnedThisYear,
      expiringSoon,
      expired,
      noExpiry,
      categoryDistribution: Object.entries(catMap).map(([name, count]) => ({ name, count })),
      organizationDistribution: Object.entries(orgMap).map(([name, count]) => ({ name, count })),
      yearlyDistribution: Object.entries(yearMap).map(([year, count]) => ({ year, count })),
    };
  },

  async getProjectsDashboardStats(): Promise<ProjectsDashboardStats> {
    const projects = await liveProjectsService.getProjects();

    const completedProjects = projects.filter((p) => p.status === 'Completed').length;
    const inProgressProjects = projects.filter((p) => p.status === 'In Progress').length;
    const plannedProjects = projects.filter((p) => p.status === 'Planned').length;
    const archivedProjects = projects.filter((p) => p.status === 'Archived').length;

    const statusDistribution = [
      { status: 'Completed', count: completedProjects, percentage: Math.round((completedProjects / (projects.length || 1)) * 100) },
      { status: 'In Progress', count: inProgressProjects, percentage: Math.round((inProgressProjects / (projects.length || 1)) * 100) },
      { status: 'Planned', count: plannedProjects, percentage: Math.round((plannedProjects / (projects.length || 1)) * 100) },
      { status: 'Archived', count: archivedProjects, percentage: Math.round((archivedProjects / (projects.length || 1)) * 100) },
    ];

    const techMap: Record<string, number> = {};
    const catMap: Record<string, number> = {};

    projects.forEach((p) => {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
      p.technologies.forEach((t) => {
        techMap[t] = (techMap[t] || 0) + 1;
      });
    });

    const technologyCounts = Object.entries(techMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalProjects: projects.length,
      completedProjects,
      inProgressProjects,
      plannedProjects,
      archivedProjects,
      statusDistribution,
      technologyCounts,
      categoryDistribution: Object.entries(catMap).map(([name, count]) => ({ name, count })),
    };
  },
};
