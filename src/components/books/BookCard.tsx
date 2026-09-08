import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, BookOpen, Edit3, Trash2 } from 'lucide-react';
import { BookWithReadingState } from '../../types/book.types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface BookCardProps {
  book: BookWithReadingState;
  viewMode?: 'grid' | 'list';
  onUpdateProgress: (book: BookWithReadingState) => void;
  onToggleWishlist: (bookId: string) => void;
  onEdit: (book: BookWithReadingState) => void;
  onDelete: (bookId: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  viewMode = 'grid',
  onUpdateProgress,
  onToggleWishlist,
  onEdit,
  onDelete,
}) => {
  const isChapterBased = ['Manga', 'Manhwa', 'Comics'].includes(book.category);
  const status = book.readingState?.status || 'Not Started';
  const wishlist = book.readingState?.wishlist || false;
  const progressPct = book.readingState?.progressPercentage ?? null;

  const currentVal = isChapterBased
    ? book.readingState?.currentChapter ?? 0
    : book.readingState?.currentPage ?? 0;

  const totalVal = isChapterBased ? book.totalChapters : book.totalPages;

  const statusVariant =
    status === 'Completed' ? 'emerald' : status === 'Reading' ? 'amber' : 'slate';

  const categoryVariant =
    book.category === 'Manga'
      ? 'purple'
      : book.category === 'Manhwa'
      ? 'rose'
      : book.category === 'Comics'
      ? 'cyan'
      : book.category === 'Novel'
      ? 'indigo'
      : 'slate';

  if (viewMode === 'list') {
    return (
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group border border-slate-200/80 dark:border-white/[0.07]">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link to={`/books/${book.id}`} className="shrink-0">
            <img
              src={book.coverFileUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&auto=format&fit=crop&q=80'}
              alt={book.title}
              className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform"
              style={{ objectPosition: book.coverImagePosition || 'center' }}
            />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <Badge variant={categoryVariant}>{book.category}</Badge>
              <Badge variant={statusVariant}>{status}</Badge>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{book.language}</span>
            </div>
            <Link to={`/books/${book.id}`} className="block">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors truncate">
                {book.title}
              </h3>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">by {book.author}</p>
            {totalVal != null && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {isChapterBased ? `Ch ${currentVal} / ${totalVal}` : `Pg ${currentVal} / ${totalVal}`}
                {progressPct !== null && ` (${progressPct}%)`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(book)}
            title="Edit Book Details & Cover"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <Edit3 className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleWishlist(book.id)}
            className={wishlist ? 'text-rose-500 dark:text-rose-400 hover:text-rose-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}
          >
            <Heart className={`w-4 h-4 ${wishlist ? 'fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400' : ''}`} />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onUpdateProgress(book)}
            leftIcon={<BookOpen className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />}
          >
            {status === 'Reading' ? 'Update' : 'Track'}
          </Button>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-slate-200/80 dark:border-white/[0.07] hover:border-indigo-500/30 transition-all duration-300">
      <div>
        {/* Cover with Floating Badges */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
          <Link to={`/books/${book.id}`} className="block w-full h-full">
            <img
              src={book.coverFileUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80'}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              style={{ objectPosition: book.coverImagePosition || 'center' }}
            />
          </Link>

          {/* Top Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={categoryVariant}>{book.category}</Badge>
          </div>

          {/* Top Right: Actions (Edit & Wishlist) */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(book);
              }}
              title="Edit Book Details & Cover"
              className="p-2 rounded-full glass-panel border border-white/20 text-slate-300 hover:text-white bg-slate-950/60 hover:bg-slate-900 transition-colors shadow-lg opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleWishlist(book.id)}
              className="p-2 rounded-full glass-panel border border-white/20 text-slate-400 hover:text-rose-500 bg-slate-950/60 hover:bg-slate-900 transition-colors shadow-lg"
            >
              <Heart className={`w-3.5 h-3.5 ${wishlist ? 'fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400' : ''}`} />
            </button>
          </div>

          {/* Bottom Overlay Progress Bar */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent">
            <div className="flex items-center justify-between text-[11px] text-slate-200 font-medium mb-1">
              <span>
                {isChapterBased ? `Ch. ${currentVal}` : `Pg. ${currentVal}`}
                {totalVal ? ` / ${totalVal}` : ''}
              </span>
              {progressPct !== null && (
                <span className="text-indigo-300 font-bold">{progressPct}%</span>
              )}
            </div>
            {progressPct !== null && (
              <div className="w-full h-1.5 bg-black/60 backdrop-blur-sm rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant={statusVariant}>{status}</Badge>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{book.language}</span>
          </div>

          <Link to={`/books/${book.id}`} className="block">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
              {book.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">by {book.author}</p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 pt-0 border-t border-slate-100 dark:border-white/5 mt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onUpdateProgress(book)}
          className="w-full text-xs"
          leftIcon={<BookOpen className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />}
        >
          {status === 'Reading' ? 'Progress' : 'Start'}
        </Button>
      </div>
    </div>
  );
};
