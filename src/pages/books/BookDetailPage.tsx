import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Heart,
  Edit3,
  Trash2,
  FileText,
  Calendar,
  CheckCircle2,
  Flame,
  Download,
  ExternalLink,
  RefreshCw,
  Focus,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { booksService, syncMangaManhwaChapters } from '../../services';
import { BookWithReadingState } from '../../types/book.types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { ReadingProgressModal } from '../../components/books/ReadingProgressModal';
import { BookFormModal } from '../../components/books/BookFormModal';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookWithReadingState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPositionPickerOpen, setIsPositionPickerOpen] = useState(false);
  const [isSyncingChapters, setIsSyncingChapters] = useState(false);
  const { success, error } = useToast();

  const loadBook = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await booksService.getBookById(id);
      if (!data) {
        navigate('/books');
        return;
      }
      setBook(data);
    } catch (err: any) {
      error('Failed to load book', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBook();
  }, [id]);

  const handleSyncChapters = async () => {
    if (!book) return;
    setIsSyncingChapters(true);
    try {
      const res = await syncMangaManhwaChapters(book.id, book.title);
      setBook(res.book);
      success(
        `Updated to ${res.latestChapter} chapters!`,
        `Real-time MangaDex info (${res.status || 'Active'})`
      );
    } catch (err: any) {
      error('Chapter sync failed', err.message);
    } finally {
      setIsSyncingChapters(false);
    }
  };


  const handleUpdateProgress = async (updates: any) => {
    if (!book) return;
    try {
      const updated = await booksService.updateReadingProgress(book.id, updates);
      setBook(updated);
      success('Progress saved', updated.title);
    } catch (err: any) {
      error('Error saving progress', err.message);
    }
  };

  const handleToggleWishlist = async () => {
    if (!book) return;
    try {
      const updated = await booksService.toggleWishlist(book.id);
      setBook(updated);
      success(
        updated.readingState?.wishlist ? 'Saved to Wishlist' : 'Removed from Wishlist',
        updated.title
      );
    } catch (err: any) {
      error('Error updating wishlist', err.message);
    }
  };

  const handleDelete = async () => {
    if (!book || !confirm('Permanently delete this book from your vault?')) return;
    try {
      await booksService.deleteBook(book.id);
      success('Book deleted');
      navigate('/books');
    } catch (err: any) {
      error('Failed to delete book', err.message);
    }
  };

  const handleSaveEdit = async (data: any) => {
    if (!book) return;
    try {
      const updated = await booksService.updateBook(book.id, data);
      setBook(updated);
      success('Book updated', updated.title);
    } catch (err: any) {
      error('Failed to update book', err.message);
    }
  };

  const handleUpdateCoverPosition = async (newPos: string) => {
    if (!book) return;
    try {
      const updated = await booksService.updateBook(book.id, { coverImagePosition: newPos });
      setBook(updated);
      success('Cover position updated', `Aligned to ${newPos}`);
      setIsPositionPickerOpen(false);
    } catch (err: any) {
      error('Failed to update cover position', err.message);
    }
  };

  if (isLoading || !book) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-96 rounded-2xl" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4 rounded-xl" />
            <Skeleton className="h-6 w-1/2 rounded-xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const isChapterBased = ['Manga', 'Manhwa', 'Comics'].includes(book.category);
  const status = book.readingState?.status || 'Not Started';
  const wishlist = book.readingState?.wishlist || false;
  const progressPct = book.readingState?.progressPercentage ?? null;

  const currentVal = isChapterBased
    ? book.readingState?.currentChapter ?? 0
    : book.readingState?.currentPage ?? 0;

  const totalVal = isChapterBased ? book.totalChapters : book.totalPages;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Top Navigation & Action Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-black/[0.06] dark:border-white/[0.06]">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Books Vault</span>
        </Link>

        {/* Top Right Corner Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit3 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />}
            className="text-xs font-semibold shadow-sm"
          >
            Edit Book
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            className="text-xs font-semibold"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Detail Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Cover Column */}
        <div className="md:col-span-4 space-y-4">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden glass-panel border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl group">
            <img
              src={book.coverFileUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80'}
              alt={book.title}
              className="w-full h-full object-cover transition-all duration-300"
              style={{ objectPosition: book.coverImagePosition || 'center' }}
            />

            {/* Quick Position Control Button */}
            <div className="absolute top-3 left-3 z-10">
              <button
                type="button"
                onClick={() => setIsPositionPickerOpen(!isPositionPickerOpen)}
                title="Adjust Cover Alignment"
                className="py-1.5 px-2.5 rounded-full glass-panel border border-white/25 hover:border-indigo-400 text-slate-200 hover:text-white transition-all shadow-lg flex items-center gap-1.5 text-xs bg-slate-950/70 backdrop-blur-md"
              >
                <Focus className="w-3.5 h-3.5 text-indigo-400" />
                <span className="capitalize font-medium text-[11px]">{book.coverImagePosition || 'center'}</span>
              </button>
            </div>

            {/* Top Right: Wishlist Toggle */}
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={handleToggleWishlist}
                className="p-2.5 rounded-full glass-panel border border-white/15 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 transition-all shadow-lg bg-slate-950/50 backdrop-blur-md"
              >
                <Heart className={`w-4 h-4 ${wishlist ? 'fill-rose-400 text-rose-400' : ''}`} />
              </button>
            </div>

            {/* Position Picker Popover Panel */}
            {isPositionPickerOpen && (
              <div className="absolute inset-x-3 top-14 p-3.5 rounded-xl bg-slate-950/95 backdrop-blur-xl border border-white/20 shadow-2xl space-y-3 z-20 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
                <div className="flex items-center justify-between text-xs font-semibold pb-1.5 border-b border-white/10">
                  <span className="flex items-center gap-1 text-indigo-400">
                    <Focus className="w-3.5 h-3.5" />
                    <span>Align Cover Image</span>
                  </span>
                  <button
                    onClick={() => setIsPositionPickerOpen(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'top', label: 'Top', icon: <ArrowUp className="w-3 h-3" /> },
                    { id: 'center', label: 'Center', icon: <Focus className="w-3 h-3" /> },
                    { id: 'bottom', label: 'Bottom', icon: <ArrowDown className="w-3 h-3" /> },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleUpdateCoverPosition(preset.id)}
                      className={`flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
                        (book.coverImagePosition || 'center') === preset.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white/10 hover:bg-white/20 text-slate-200'
                      }`}
                    >
                      {preset.icon}
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>

                {/* 9-Point Alignment Grid */}
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">9-Point Grid:</span>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-md border border-white/10">
                    {[
                      { id: 'left top', title: 'Top Left' },
                      { id: 'top', title: 'Top Center' },
                      { id: 'right top', title: 'Top Right' },
                      { id: 'left', title: 'Center Left' },
                      { id: 'center', title: 'Center' },
                      { id: 'right', title: 'Center Right' },
                      { id: 'left bottom', title: 'Bottom Left' },
                      { id: 'bottom', title: 'Bottom Center' },
                      { id: 'right bottom', title: 'Bottom Right' },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        title={pos.title}
                        onClick={() => handleUpdateCoverPosition(pos.id)}
                        className={`w-4 h-4 rounded-xs transition-all flex items-center justify-center ${
                          (book.coverImagePosition || 'center') === pos.id
                            ? 'bg-indigo-600 ring-1 ring-indigo-400'
                            : 'bg-slate-700 hover:bg-indigo-400/50'
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${(book.coverImagePosition || 'center') === pos.id ? 'bg-white' : 'bg-transparent'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PDF Action Box (Cloudflare R2) */}
          {book.pdfFileUrl && (
            <div className="p-4 rounded-2xl glass-card border border-indigo-500/20 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>Attached Digital Document (R2)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{book.pdfFileName || 'Book Document.pdf'}</p>
              <a
                href={book.pdfFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="secondary" size="sm" className="w-full text-xs" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  Open Digital Reader
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="md:col-span-8 space-y-6">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={book.category === 'Manga' ? 'purple' : 'indigo'} size="md">
                {book.category}
              </Badge>
              <Badge
                variant={status === 'Completed' ? 'emerald' : status === 'Reading' ? 'amber' : 'slate'}
                size="md"
              >
                {status}
              </Badge>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {book.language}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {book.title}
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300 font-medium">by {book.author}</p>
          </div>

          {/* Reading Tracker Dashboard Panel */}
          <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Reading Progress
                </span>
              </div>
              {progressPct !== null && (
                <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{progressPct}%</span>
              )}
            </div>

            {/* Position Display */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isChapterBased ? `Chapter ${currentVal}` : `Page ${currentVal}`}
              </span>
              {totalVal && (
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  of {totalVal} {isChapterBased ? 'chapters' : 'pages'}
                </span>
              )}
            </div>

            {/* Bar */}
            {progressPct !== null && (
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsProgressModalOpen(true)}
                leftIcon={<BookOpen className="w-4 h-4" />}
              >
                {status === 'Reading' ? 'Update Position' : 'Start Reading'}
              </Button>

              {status !== 'Completed' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    handleUpdateProgress({
                      status: 'Completed',
                      currentChapter: isChapterBased ? totalVal || currentVal : null,
                      currentPage: !isChapterBased ? totalVal || currentVal : null,
                    })
                  }
                  leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
                >
                  Mark Completed
                </Button>
              )}

              {isChapterBased && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSyncChapters}
                  isLoading={isSyncingChapters}
                  leftIcon={<RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${isSyncingChapters ? 'animate-spin' : ''}`} />}
                  className="text-xs"
                >
                  Sync Chapters
                </Button>
              )}
            </div>
          </div>

          {/* Description */}
          {book.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Synopsis / Notes</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>
          )}

          {/* Meta details footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-black/[0.08] dark:border-white/[0.06] text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Added {formatDate(book.createdAt)}
              </span>
              {book.readingState?.lastReadAt && (
                <span>Last active {formatRelativeTime(book.readingState.lastReadAt)}</span>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Modals */}
      <ReadingProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        book={book}
        onSaveProgress={handleUpdateProgress}
      />

      <BookFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={book}
        onSubmit={handleSaveEdit}
      />
    </div>
  );
};
