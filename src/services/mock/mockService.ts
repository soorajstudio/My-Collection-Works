import { Book, BookWithReadingState, ReadingState, BookFilterOptions, ReadingStatus } from '../../types/book.types';
import { Certificate, CertificateFilterOptions } from '../../types/certificate.types';
import { Project, ProjectFilterOptions } from '../../types/project.types';
import { UserProfile } from '../../types/user.types';
import {
  MainDashboardStats,
  BooksDashboardStats,
  CertificatesDashboardStats,
  ProjectsDashboardStats,
} from '../../types/dashboard.types';
import {
  INITIAL_MOCK_USER,
  INITIAL_MOCK_BOOKS,
  INITIAL_MOCK_CERTIFICATES,
  INITIAL_MOCK_PROJECTS,
} from './mockData';
import { calculateProgressPercentage, getCertificateExpiryStatus } from '../../utils/formatters';

const DATA_VERSION = 'v3_cover_positions';

const STORAGE_KEYS = {
  VERSION: 'mylibrary_data_version',
  USER: 'mylibrary_user',
  BOOKS: 'mylibrary_books',
  CERTIFICATES: 'mylibrary_certificates',
  PROJECTS: 'mylibrary_projects',
  AUTH_TOKEN: 'mylibrary_session',
};

// Initialize default data if not present or if data version changed
function initializeStorage() {
  const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
  if (currentVersion !== DATA_VERSION) {
    localStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION);

    // Smart merge: update initial mock books with new covers/positions while preserving user reading states & custom books
    const existingRaw = localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (existingRaw) {
      try {
        const existingBooks: BookWithReadingState[] = JSON.parse(existingRaw);
        const merged = INITIAL_MOCK_BOOKS.map((initBook) => {
          const matched = existingBooks.find((b) => b.id === initBook.id);
          if (!matched) return initBook;
          return {
            ...initBook,
            readingState: matched.readingState || initBook.readingState,
            coverFileUrl: matched.coverFileUrl || initBook.coverFileUrl,
            coverImagePosition: matched.coverImagePosition || initBook.coverImagePosition || 'center',
          };
        });
        const userAdded = existingBooks.filter((b) => !INITIAL_MOCK_BOOKS.some((ib) => ib.id === b.id));
        localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify([...merged, ...userAdded]));
      } catch {
        localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_MOCK_BOOKS));
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_MOCK_BOOKS));
    }

    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_MOCK_PROJECTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) {
      localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(INITIAL_MOCK_CERTIFICATES));
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(INITIAL_MOCK_USER));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-jwt-token-sooraj');
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_MOCK_BOOKS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) {
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(INITIAL_MOCK_CERTIFICATES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_MOCK_PROJECTS));
  }
}

initializeStorage();

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAuthService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    await delay(150);
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return null;
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  async login(identifier: string, password: string): Promise<UserProfile> {
    await delay(300);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const user: UserProfile = userStr ? JSON.parse(userStr) : INITIAL_MOCK_USER;

    const isEmail = identifier.includes('@');
    const matchesEmail = isEmail && user.email.toLowerCase() === identifier.toLowerCase().trim();
    const matchesUsername = !isEmail && user.username.toLowerCase() === identifier.toLowerCase().trim();

    if (!matchesEmail && !matchesUsername) {
      throw new Error('User not found with provided email or username.');
    }

    // Verify password: check saved registered password or default demo password
    const savedPassword = localStorage.getItem('mylibrary_password_' + user.username) || 'demo123456';
    if (password !== savedPassword) {
      throw new Error('Invalid password. For demo account use "demo123456" or your registered password.');
    }

    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-jwt-token-' + user.userId);
    return user;
  },

  async register(data: { email: string; username: string; password: string }): Promise<UserProfile> {
    await delay(400);
    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }

    const newUser: UserProfile = {
      userId: 'user_' + Math.random().toString(36).substring(2, 9),
      username: data.username.toLowerCase().trim(),
      email: data.email.toLowerCase().trim(),
      displayName: data.username,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    localStorage.setItem('mylibrary_password_' + newUser.username, data.password);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-jwt-token-' + newUser.userId);
    return newUser;
  },

  async logout(): Promise<void> {
    await delay(100);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    await delay(200);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const user: UserProfile = userStr ? JSON.parse(userStr) : INITIAL_MOCK_USER;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    return updated;
  },
};

export const mockBooksService = {
  async getBooks(filters?: BookFilterOptions): Promise<BookWithReadingState[]> {
    await delay(150);
    const booksStr = localStorage.getItem(STORAGE_KEYS.BOOKS);
    let books: BookWithReadingState[] = booksStr ? JSON.parse(booksStr) : [];

    if (filters) {
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        books = books.filter(
          (b) =>
            b.title.toLowerCase().includes(query) ||
            b.author.toLowerCase().includes(query) ||
            b.description?.toLowerCase().includes(query)
        );
      }
      if (filters.category && filters.category !== 'All') {
        books = books.filter((b) => b.category === filters.category);
      }
      if (filters.language && filters.language !== 'All') {
        books = books.filter((b) => b.language === filters.language);
      }
      if (filters.status && filters.status !== 'All') {
        books = books.filter((b) => b.readingState?.status === filters.status);
      }
      if (filters.wishlistOnly) {
        books = books.filter((b) => b.readingState?.wishlist);
      }

      if (filters.sortBy) {
        books.sort((a, b) => {
          if (filters.sortBy === 'title') {
            return (filters.sortOrder === 'desc' ? -1 : 1) * a.title.localeCompare(b.title);
          }
          if (filters.sortBy === 'author') {
            return (filters.sortOrder === 'desc' ? -1 : 1) * a.author.localeCompare(b.author);
          }
          if (filters.sortBy === 'progress') {
            const pA = a.readingState?.progressPercentage || 0;
            const pB = b.readingState?.progressPercentage || 0;
            return (filters.sortOrder === 'asc' ? 1 : -1) * (pB - pA);
          }
          // Default: recent
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return (filters.sortOrder === 'asc' ? 1 : -1) * (dateB - dateA);
        });
      }
    }

    return books;
  },

  async getBookById(id: string): Promise<BookWithReadingState | null> {
    await delay(100);
    const booksStr = localStorage.getItem(STORAGE_KEYS.BOOKS);
    const books: BookWithReadingState[] = booksStr ? JSON.parse(booksStr) : [];
    return books.find((b) => b.id === id) || null;
  },

  async createBook(data: Partial<Book>): Promise<BookWithReadingState> {
    await delay(300);
    const booksStr = localStorage.getItem(STORAGE_KEYS.BOOKS);
    const books: BookWithReadingState[] = booksStr ? JSON.parse(booksStr) : [];

    const newBookId = 'book_' + Date.now();
    const newReadingState: ReadingState = {
      id: 'rs_' + Date.now(),
      userId: data.ownerId || 'user_sooraj_01',
      bookId: newBookId,
      status: 'Not Started',
      currentChapter: 0,
      currentPage: 0,
      progressPercentage: 0,
      wishlist: false,
      lastReadAt: null,
      updatedAt: new Date().toISOString(),
    };

    const newBook: BookWithReadingState = {
      id: newBookId,
      ownerId: data.ownerId || 'user_sooraj_01',
      title: data.title || 'Untitled',
      author: data.author || 'Unknown',
      description: data.description || '',
      category: data.category || 'Other Books',
      language: data.language || 'English',
      coverFileUrl: data.coverFileUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80',
      coverFileKey: data.coverFileKey,
      coverImagePosition: data.coverImagePosition || 'center',
      pdfFileKey: data.pdfFileKey,
      pdfFileName: data.pdfFileName,
      pdfFileUrl: data.pdfFileUrl,
      totalPages: data.totalPages ?? null,
      totalChapters: data.totalChapters ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingState: newReadingState,
    };

    books.unshift(newBook);
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    return newBook;
  },

  async updateBook(id: string, data: Partial<Book>): Promise<BookWithReadingState> {
    await delay(250);
    const booksStr = localStorage.getItem(STORAGE_KEYS.BOOKS);
    const books: BookWithReadingState[] = booksStr ? JSON.parse(booksStr) : [];
    const index = books.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Book not found');

    const cleanData: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        cleanData[k] = v;
      }
    }

    const updated = {
      ...books[index],
      ...cleanData,
      updatedAt: new Date().toISOString(),
    };
    books[index] = updated;
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    } catch (err) {
      console.warn('localStorage quota warning on updateBook:', err);
    }
    return updated;
  },

  async updateReadingProgress(
    bookId: string,
    updates: {
      currentChapter?: number | null;
      currentPage?: number | null;
      status?: ReadingStatus;
      wishlist?: boolean;
    }
  ): Promise<BookWithReadingState> {
    await delay(200);
    const booksStr = localStorage.getItem(STORAGE_KEYS.BOOKS);
    const books: BookWithReadingState[] = booksStr ? JSON.parse(booksStr) : [];
    const index = books.findIndex((b) => b.id === bookId);
    if (index === -1) throw new Error('Book not found');

    const book = books[index];
    const currentState = book.readingState || {
      id: 'rs_' + Date.now(),
      userId: book.ownerId,
      bookId: book.id,
      status: 'Not Started',
      currentChapter: 0,
      currentPage: 0,
      progressPercentage: 0,
      wishlist: false,
      lastReadAt: null,
      updatedAt: new Date().toISOString(),
    };

    const isChapterBased = ['Manga', 'Manhwa', 'Comics'].includes(book.category);
    const newChapter = updates.currentChapter !== undefined ? updates.currentChapter : currentState.currentChapter;
    const newPage = updates.currentPage !== undefined ? updates.currentPage : currentState.currentPage;

    // Calculate progress percentage
    let calculatedPct: number | null = null;
    if (isChapterBased) {
      calculatedPct = calculateProgressPercentage(book.category, newChapter, book.totalChapters);
    } else {
      calculatedPct = calculateProgressPercentage(book.category, newPage, book.totalPages);
    }

    // Determine Status
    let nextStatus: ReadingStatus = updates.status || currentState.status;
    if (!updates.status) {
      if (calculatedPct !== null && calculatedPct >= 100) {
        nextStatus = 'Completed';
      } else if (
        (isChapterBased && (newChapter ?? 0) > 0) ||
        (!isChapterBased && (newPage ?? 0) > 0)
      ) {
        nextStatus = 'Reading';
      }
    }

    const updatedState: ReadingState = {
      ...currentState,
      status: nextStatus,
      currentChapter: isChapterBased ? newChapter : null,
      currentPage: !isChapterBased ? newPage : null,
      progressPercentage: calculatedPct,
      wishlist: updates.wishlist !== undefined ? updates.wishlist : currentState.wishlist,
      completedAt: nextStatus === 'Completed' ? new Date().toISOString() : currentState.completedAt,
      lastReadAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    book.readingState = updatedState;
    books[index] = book;
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    return book;
  },

  async toggleWishlist(bookId: string): Promise<BookWithReadingState> {
    const booksStr = localStorage.getItem(STORAGE_KEYS.BOOKS);
    const books: BookWithReadingState[] = booksStr ? JSON.parse(booksStr) : [];
    const book = books.find((b) => b.id === bookId);
    if (!book) throw new Error('Book not found');
    const currentWishlist = book.readingState?.wishlist ?? false;
    return this.updateReadingProgress(bookId, { wishlist: !currentWishlist });
  },

  async deleteBook(id: string): Promise<void> {
    await delay(200);
    const booksStr = localStorage.getItem(STORAGE_KEYS.BOOKS);
    let books: BookWithReadingState[] = booksStr ? JSON.parse(booksStr) : [];
    books = books.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  },
};

export const mockCertificatesService = {
  async getCertificates(filters?: CertificateFilterOptions): Promise<Certificate[]> {
    await delay(150);
    const certsStr = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    let certs: Certificate[] = certsStr ? JSON.parse(certsStr) : [];

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        certs = certs.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.issuingOrg.toLowerCase().includes(q) ||
            c.skills.some((s) => s.toLowerCase().includes(q))
        );
      }
      if (filters.category && filters.category !== 'All') {
        certs = certs.filter((c) => c.category === filters.category);
      }
      if (filters.organization && filters.organization !== 'All') {
        certs = certs.filter((c) => c.issuingOrg === filters.organization);
      }
      if (filters.year && filters.year !== 'All') {
        certs = certs.filter((c) => c.issueDate.startsWith(filters.year!));
      }
      if (filters.expiryStatus && filters.expiryStatus !== 'all') {
        certs = certs.filter((c) => {
          const st = getCertificateExpiryStatus(c.hasNoExpiry, c.expiryDate).status;
          return st === filters.expiryStatus;
        });
      }

      if (filters.sortBy) {
        certs.sort((a, b) => {
          if (filters.sortBy === 'name') {
            return (filters.sortOrder === 'desc' ? -1 : 1) * a.name.localeCompare(b.name);
          }
          if (filters.sortBy === 'organization') {
            return (filters.sortOrder === 'desc' ? -1 : 1) * a.issuingOrg.localeCompare(b.issuingOrg);
          }
          // Default issueDate
          return (filters.sortOrder === 'asc' ? 1 : -1) * (new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
        });
      }
    }

    return certs;
  },

  async getCertificateById(id: string): Promise<Certificate | null> {
    await delay(100);
    const certsStr = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    const certs: Certificate[] = certsStr ? JSON.parse(certsStr) : [];
    return certs.find((c) => c.id === id) || null;
  },

  async createCertificate(data: Partial<Certificate>): Promise<Certificate> {
    await delay(300);
    const certsStr = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    const certs: Certificate[] = certsStr ? JSON.parse(certsStr) : [];

    const newCert: Certificate = {
      id: 'cert_' + Date.now(),
      ownerId: data.ownerId || 'user_sooraj_01',
      name: data.name || 'Untitled Certificate',
      issuingOrg: data.issuingOrg || 'Organization',
      issueDate: data.issueDate || new Date().toISOString().split('T')[0],
      expiryDate: data.hasNoExpiry ? null : data.expiryDate,
      hasNoExpiry: !!data.hasNoExpiry,
      credentialId: data.credentialId,
      description: data.description,
      category: data.category || 'Professional Skills',
      skills: data.skills || [],
      verificationUrl: data.verificationUrl,
      imageFileUrl: data.imageFileUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80',
      imageFileKey: data.imageFileKey,
      pdfFileKey: data.pdfFileKey,
      pdfFileName: data.pdfFileName,
      pdfFileUrl: data.pdfFileUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    certs.unshift(newCert);
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
    return newCert;
  },

  async updateCertificate(id: string, data: Partial<Certificate>): Promise<Certificate> {
    await delay(250);
    const certsStr = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    const certs: Certificate[] = certsStr ? JSON.parse(certsStr) : [];
    const index = certs.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Certificate not found');

    const updated = {
      ...certs[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    certs[index] = updated;
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
    return updated;
  },

  async deleteCertificate(id: string): Promise<void> {
    await delay(200);
    const certsStr = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    let certs: Certificate[] = certsStr ? JSON.parse(certsStr) : [];
    certs = certs.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certs));
  },
};

export const mockProjectsService = {
  async getProjects(filters?: ProjectFilterOptions): Promise<Project[]> {
    await delay(150);
    const projStr = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    let projects: Project[] = projStr ? JSON.parse(projStr) : [];

    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        projects = projects.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q) ||
            p.technologies.some((t) => t.toLowerCase().includes(q))
        );
      }
      if (filters.category && filters.category !== 'All') {
        projects = projects.filter((p) => p.category === filters.category);
      }
      if (filters.technology && filters.technology !== 'All') {
        projects = projects.filter((p) => p.technologies.includes(filters.technology!));
      }
      if (filters.status && filters.status !== 'All') {
        projects = projects.filter((p) => p.status === filters.status);
      }

      if (filters.sortBy) {
        projects.sort((a, b) => {
          if (filters.sortBy === 'name') {
            return (filters.sortOrder === 'desc' ? -1 : 1) * a.name.localeCompare(b.name);
          }
          if (filters.sortBy === 'status') {
            return (filters.sortOrder === 'desc' ? -1 : 1) * a.status.localeCompare(b.status);
          }
          // Default: recent
          return (filters.sortOrder === 'asc' ? 1 : -1) * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });
      }
    }

    return projects;
  },

  async getProjectById(id: string): Promise<Project | null> {
    await delay(100);
    const projStr = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const projects: Project[] = projStr ? JSON.parse(projStr) : [];
    return projects.find((p) => p.id === id) || null;
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    await delay(300);
    const projStr = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const projects: Project[] = projStr ? JSON.parse(projStr) : [];

    const newProject: Project = {
      id: 'proj_' + Date.now(),
      ownerId: data.ownerId || 'user_sooraj_01',
      name: data.name || 'Untitled Project',
      shortDescription: data.shortDescription || '',
      detailedDescription: data.detailedDescription,
      category: data.category || 'Web Application',
      technologies: data.technologies || [],
      features: data.features || [],
      status: data.status || 'Planned',
      startDate: data.startDate,
      completionDate: data.completionDate,
      githubUrl: data.githubUrl,
      liveDemoUrl: data.liveDemoUrl,
      downloadUrl: data.downloadUrl,
      tags: data.tags || [],
      appIconUrl: data.appIconUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&auto=format&fit=crop&q=80',
      appIconKey: data.appIconKey,
      screenshotUrls: data.screenshotUrls || [],
      screenshotKeys: data.screenshotKeys,
      apkFileKey: data.apkFileKey,
      apkFileName: data.apkFileName,
      apkFileUrl: data.apkFileUrl,
      videoFileKey: data.videoFileKey,
      videoFileUrl: data.videoFileUrl,
      videoEmbedUrl: data.videoEmbedUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.unshift(newProject);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return newProject;
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    await delay(250);
    const projStr = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const projects: Project[] = projStr ? JSON.parse(projStr) : [];
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Project not found');

    const updated = {
      ...projects[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    projects[index] = updated;
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return updated;
  },

  async deleteProject(id: string): Promise<void> {
    await delay(200);
    const projStr = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    let projects: Project[] = projStr ? JSON.parse(projStr) : [];
    projects = projects.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },
};

export const mockDashboardService = {
  async getMainDashboardStats(): Promise<MainDashboardStats> {
    const books = await mockBooksService.getBooks();
    const certs = await mockCertificatesService.getCertificates();
    const projects = await mockProjectsService.getProjects();

    const currentlyReading = books.filter((b) => b.readingState?.status === 'Reading').length;
    const completedBooks = books.filter((b) => b.readingState?.status === 'Completed').length;
    const wishlistCount = books.filter((b) => b.readingState?.wishlist).length;

    const activeProjects = projects.filter((p) => p.status === 'In Progress').length;
    const completedProjects = projects.filter((p) => p.status === 'Completed').length;

    // Continue Reading: reading status == 'Reading', sorted by lastReadAt desc
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
    const books = await mockBooksService.getBooks();
    const currentlyReading = books.filter((b) => b.readingState?.status === 'Reading').length;
    const completedBooks = books.filter((b) => b.readingState?.status === 'Completed').length;
    const notStartedBooks = books.filter((b) => !b.readingState || b.readingState.status === 'Not Started').length;
    const wishlistCount = books.filter((b) => b.readingState?.wishlist).length;

    // Calculate overall reading progress % across all started books
    const startedBooks = books.filter((b) => (b.readingState?.progressPercentage ?? 0) > 0);
    const overallProgress = startedBooks.length > 0
      ? Math.round(startedBooks.reduce((acc, b) => acc + (b.readingState?.progressPercentage || 0), 0) / startedBooks.length)
      : 0;

    // Category distribution
    const catMap: Record<string, number> = {};
    books.forEach((b) => {
      catMap[b.category] = (catMap[b.category] || 0) + 1;
    });
    const categoryDistribution = Object.entries(catMap).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / (books.length || 1)) * 100),
    }));

    // Language distribution
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
        const tA = a.readingState?.completedAt ? new Date(a.readingState.completedAt).getTime() : 0;
        const tB = b.readingState?.completedAt ? new Date(b.readingState.completedAt).getTime() : 0;
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
    const certs = await mockCertificatesService.getCertificates();
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
    const projects = await mockProjectsService.getProjects();

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
