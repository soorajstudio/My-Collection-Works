export type BookCategory = 'Manga' | 'Manhwa' | 'Comics' | 'Novel' | 'Other Books';

export type BookLanguage = 'English' | 'Malayalam' | string;

export type ReadingStatus = 'Not Started' | 'Reading' | 'Completed';

export type CoverPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'left top'
  | 'right top'
  | 'left bottom'
  | 'right bottom';

export interface Book {
  id: string;
  ownerId: string;
  title: string;
  author: string;
  description?: string;
  category: BookCategory;
  language: BookLanguage;
  coverFileKey?: string;
  coverFileUrl?: string;
  coverImagePosition?: string;
  pdfFileKey?: string;
  pdfFileName?: string;
  pdfFileUrl?: string;
  totalPages?: number | null;
  totalChapters?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingState {
  id: string;
  userId: string;
  bookId: string;
  status: ReadingStatus;
  currentPage?: number | null;
  currentChapter?: number | null;
  progressPercentage?: number | null;
  wishlist: boolean;
  lastReadAt?: string | null;
  completedAt?: string | null;
  updatedAt: string;
}

export interface BookWithReadingState extends Book {
  readingState?: ReadingState;
}

export interface BookFilterOptions {
  search?: string;
  category?: string;
  language?: string;
  status?: ReadingStatus | 'All';
  wishlistOnly?: boolean;
  sortBy?: 'recent' | 'title' | 'author' | 'progress';
  sortOrder?: 'asc' | 'desc';
}
