import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { BookWithReadingState } from '../../types/book.types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatRelativeTime } from '../../utils/formatters';

interface ContinueReadingSectionProps {
  books: BookWithReadingState[];
  onQuickUpdate: (book: BookWithReadingState) => void;
}

export const ContinueReadingSection: React.FC<ContinueReadingSectionProps> = ({
  books,
  onQuickUpdate,
}) => {
  if (books.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Continue Reading
          </h2>
        </div>
        <Link
          to="/books?status=Reading"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <span>View All Active</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {books.map((book) => {
          const isChapterBased = ['Manga', 'Manhwa', 'Comics'].includes(book.category);
          const current = isChapterBased
            ? book.readingState?.currentChapter ?? 0
            : book.readingState?.currentPage ?? 0;
          const total = isChapterBased ? book.totalChapters : book.totalPages;
          const pct = book.readingState?.progressPercentage ?? 0;

          return (
            <div
              key={book.id}
              className="glass-card rounded-2xl p-4 flex flex-col justify-between border border-slate-200/80 dark:border-amber-500/15 hover:border-amber-500/40 transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={book.coverFileUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=160&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-12 h-16 object-cover rounded-xl shadow-md shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge variant={book.category === 'Manga' ? 'purple' : 'indigo'} size="sm">
                      {book.category}
                    </Badge>
                  </div>
                  <Link to={`/books/${book.id}`}>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors truncate">
                      {book.title}
                    </h4>
                  </Link>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">by {book.author}</p>
                </div>
              </div>

              {/* Progress information */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    {isChapterBased ? `Chapter ${current}` : `Page ${current}`}
                    {total ? ` / ${total}` : ''}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{pct}%</span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {book.readingState?.lastReadAt && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Active {formatRelativeTime(book.readingState.lastReadAt)}
                  </p>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onQuickUpdate(book)}
                  className="w-full text-xs mt-1"
                  leftIcon={<BookOpen className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />}
                >
                  Update Position
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
