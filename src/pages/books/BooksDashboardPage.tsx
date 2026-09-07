import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Heart,
  Plus,
  BarChart2,
  Search,
  Grid,
  List,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { dashboardService, booksService, syncMangaManhwaChapters } from '../../services';
import { BooksDashboardStats } from '../../types/dashboard.types';
import { BookWithReadingState, ReadingStatus } from '../../types/book.types';
import { BookCard } from '../../components/books/BookCard';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ReadingProgressModal } from '../../components/books/ReadingProgressModal';
import { BookFormModal } from '../../components/books/BookFormModal';
import { BOOK_CATEGORIES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

export const BooksDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<BooksDashboardStats | null>(null);
  const [books, setBooks] = useState<BookWithReadingState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooksLoading, setIsBooksLoading] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Catalog Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [status, setStatus] = useState<string>('All');
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'author' | 'progress'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [selectedBookForProgress, setSelectedBookForProgress] = useState<BookWithReadingState | null>(null);
  const [bookToEdit, setBookToEdit] = useState<BookWithReadingState | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { success, error, info } = useToast();

  const loadData = async (filterOnly = false) => {
    if (!filterOnly) setIsLoading(true);
    else setIsBooksLoading(true);

    try {
      const [statsData, booksData] = await Promise.all([
        dashboardService.getBooksDashboardStats(),
        booksService.getBooks({
          search,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          status: status !== 'All' ? (status as ReadingStatus) : undefined,
          wishlistOnly: wishlistOnly || undefined,
          sortBy,
        }),
      ]);
      setStats(statsData);
      setBooks(booksData);
    } catch (err: any) {
      error('Failed to load books catalog', err.message);
    } finally {
      setIsLoading(false);
      setIsBooksLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData(true);
    window.addEventListener('vault_updated', handleUpdate);
    return () => window.removeEventListener('vault_updated', handleUpdate);
  }, []);

  useEffect(() => {
    loadData(true);
  }, [search, selectedCategory, status, wishlistOnly, sortBy]);

  const handleUpdateProgress = async (updates: any) => {
    if (!selectedBookForProgress) return;
    try {
      await booksService.updateReadingProgress(selectedBookForProgress.id, updates);
      success('Progress saved', selectedBookForProgress.title);
      loadData(true);
    } catch (err: any) {
      error('Error updating progress', err.message);
    }
  };

  const handleToggleWishlist = async (bookId: string) => {
    try {
      const updated = await booksService.toggleWishlist(bookId);
      success(
        updated.readingState?.wishlist ? 'Saved to Wishlist' : 'Removed from Wishlist',
        updated.title
      );
      loadData(true);
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Permanently remove this book from vault?')) return;
    try {
      await booksService.deleteBook(id);
      success('Book removed');
      loadData(true);
    } catch (err: any) {
      error('Failed to remove book', err.message);
    }
  };

  const handleSaveBook = async (data: any) => {
    try {
      if (bookToEdit) {
        await booksService.updateBook(bookToEdit.id, data);
        success('Book updated', data.title);
      } else {
        await booksService.createBook(data);
        success('Book added to vault', data.title);
      }
      loadData(true);
    } catch (err: any) {
      error('Failed to save book', err.message);
    }
  };

  const handleSyncAllChapters = async () => {
    const mangaManhwaList = books.filter((b) =>
      ['Manga', 'Manhwa'].includes(b.category)
    );

    if (mangaManhwaList.length === 0) {
      info('No Manga or Manhwa in catalog to synchronize.');
      return;
    }

    setIsSyncingAll(true);
    info('Syncing real-time chapters from MangaDex...', `Checking ${mangaManhwaList.length} series`);

    let syncedCount = 0;
    for (const b of mangaManhwaList) {
      try {
        await syncMangaManhwaChapters(b.id, b.title);
        syncedCount++;
      } catch (e) {
        console.warn(`Failed to sync ${b.title}:`, e);
      }
    }

    setIsSyncingAll(false);
    success(
      `Real-time sync complete!`,
      `Updated ${syncedCount} of ${mangaManhwaList.length} series from MangaDex`
    );
    loadData(true);
  };

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.08] dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Literature & Manga Vault
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Books Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time reading metrics, category filtering, live chapter synchronization, and progress tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSyncAllChapters}
            isLoading={isSyncingAll}
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 text-indigo-500 ${isSyncingAll ? 'animate-spin' : ''}`}
              />
            }
            className="text-xs font-semibold shadow-sm"
          >
            Sync Real-Time Chapters
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setBookToEdit(null);
              setIsAddModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="text-xs font-semibold shadow-sm"
          >
            Add Book
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="glass-card rounded-2xl p-4 border border-indigo-500/20">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Books
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {stats.totalBooks}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-amber-500/20">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Currently Reading
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {stats.currentlyReading}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-emerald-500/20">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Completed
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {stats.completedBooks}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-700/40">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Not Started
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {stats.notStartedBooks}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-rose-500/20 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wider">
            Wishlist
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {stats.wishlistCount}
          </p>
        </div>
      </div>

      {/* Overall Progress Progress Bar Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Overall Reading Progress</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Weighted progress across your active and finished readings
            </p>
          </div>
          <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">
            {stats.overallProgressPercentage}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm shadow-indigo-500/50"
            style={{ width: `${stats.overallProgressPercentage}%` }}
          />
        </div>
      </div>

      {/* Catalog Filter & Control Center */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Vault Catalog
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {books.length} {books.length === 1 ? 'Book' : 'Books'}
            </span>
          </div>

          {/* Grid / List View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Card */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/[0.07] space-y-4 shadow-sm">
          
          {/* Top Row: Search and Selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by title, author, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="Reading">Currently Reading</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="recent">Recently Added</option>
              <option value="title">Title (A-Z)</option>
              <option value="author">Author (A-Z)</option>
              <option value="progress">Highest Progress</option>
            </select>
          </div>

          {/* Bottom Row: "All Categories" Pill Filter Bar & Wishlist Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/[0.06] dark:border-white/5 text-xs">
            
            {/* Category Filter Pills (Replaces old language filter) */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1 text-xs">
                Category:
              </span>

              {/* "All Categories" Pill */}
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300'
                }`}
              >
                All Categories
              </button>

              {/* Dynamic Category Pills */}
              {BOOK_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Wishlist Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={wishlistOnly}
                onChange={(e) => setWishlistOnly(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                Wishlist Only
              </span>
            </label>

          </div>
        </div>

        {/* Books Catalog Grid / List */}
        {isBooksLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5 pt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <Skeleton key={n} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-8 h-8 text-indigo-500" />}
            title={search || selectedCategory !== 'All' ? 'No matching books found' : 'Your book vault is empty'}
            description={
              search || selectedCategory !== 'All'
                ? 'Try adjusting your search query, category filter, or status.'
                : 'Add your first book, manga, or novel to start tracking your reading journey.'
            }
            actionLabel="Add Book"
            onAction={() => {
              setBookToEdit(null);
              setIsAddModalOpen(true);
            }}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5 pt-2">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                viewMode="grid"
                onUpdateProgress={(b) => setSelectedBookForProgress(b)}
                onToggleWishlist={handleToggleWishlist}
                onEdit={(b) => {
                  setBookToEdit(b);
                  setIsAddModalOpen(true);
                }}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                viewMode="list"
                onUpdateProgress={(b) => setSelectedBookForProgress(b)}
                onToggleWishlist={handleToggleWishlist}
                onEdit={(b) => {
                  setBookToEdit(b);
                  setIsAddModalOpen(true);
                }}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        )}

      </div>

      {/* Category Distribution Visualization */}
      <div className="glass-card rounded-2xl p-6 border border-black/[0.06] dark:border-white/[0.07] space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span>Category Breakdown</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.categoryDistribution.map((cat) => (
            <div
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 space-y-1.5 cursor-pointer hover:border-indigo-500/40 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{cat.name}</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {cat.count} ({cat.percentage}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200/70 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <ReadingProgressModal
        isOpen={!!selectedBookForProgress}
        onClose={() => setSelectedBookForProgress(null)}
        book={selectedBookForProgress}
        onSaveProgress={handleUpdateProgress}
      />

      <BookFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setBookToEdit(null);
        }}
        initialData={bookToEdit}
        onSubmit={handleSaveBook}
      />
    </div>
  );
};
export default BooksDashboardPage;
