import React, { useState, useEffect } from 'react';
import { Heart, BookOpen } from 'lucide-react';
import { booksService } from '../../services';
import { BookWithReadingState } from '../../types/book.types';
import { BookCard } from '../../components/books/BookCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { ReadingProgressModal } from '../../components/books/ReadingProgressModal';
import { BookFormModal } from '../../components/books/BookFormModal';
import { useToast } from '../../context/ToastContext';

export const WishlistPage: React.FC = () => {
  const [books, setBooks] = useState<BookWithReadingState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookForProgress, setBookForProgress] = useState<BookWithReadingState | null>(null);
  const [bookToEdit, setBookToEdit] = useState<BookWithReadingState | null>(null);
  const { success, error } = useToast();

  const loadWishlist = async () => {
    setIsLoading(true);
    try {
      const data = await booksService.getBooks({ wishlistOnly: true });
      setBooks(data);
    } catch (err: any) {
      error('Failed to load wishlist', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleToggleWishlist = async (bookId: string) => {
    try {
      const updated = await booksService.toggleWishlist(bookId);
      success(
        updated.readingState?.wishlist ? 'Saved to Wishlist' : 'Removed from Wishlist',
        updated.title
      );
      loadWishlist();
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  const handleUpdateProgress = async (updates: any) => {
    if (!bookForProgress) return;
    try {
      await booksService.updateReadingProgress(bookForProgress.id, updates);
      success('Progress saved', bookForProgress.title);
      loadWishlist();
    } catch (err: any) {
      error('Error updating progress', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete book?')) return;
    try {
      await booksService.deleteBook(id);
      success('Book removed');
      loadWishlist();
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.08] dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 dark:text-rose-400 dark:fill-rose-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-rose-500 dark:text-rose-400">Curated Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Reading Wishlist</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Titles you intend to read or acquire next. Stored without duplicating book records.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-rose-400" />}
          title="Your wishlist is empty"
          description="Browse your books catalog and click the heart icon on any title to save it to your reading wishlist."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onUpdateProgress={(b) => setBookForProgress(b)}
              onToggleWishlist={handleToggleWishlist}
              onEdit={(b) => setBookToEdit(b)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ReadingProgressModal
        isOpen={!!bookForProgress}
        onClose={() => setBookForProgress(null)}
        book={bookForProgress}
        onSaveProgress={handleUpdateProgress}
      />

      <BookFormModal
        isOpen={!!bookToEdit}
        onClose={() => setBookToEdit(null)}
        initialData={bookToEdit}
        onSubmit={async (data) => {
          if (!bookToEdit) return;
          await booksService.updateBook(bookToEdit.id, data);
          success('Book updated');
          loadWishlist();
        }}
      />
    </div>
  );
};
