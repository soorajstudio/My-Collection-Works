import { supabase } from './client';
import { Book, BookFilterOptions, BookWithReadingState, ReadingState, ReadingStatus } from '../../types/book.types';
import { calculateProgressPercentage } from '../../utils/formatters';

function mapBookFromRow(row: any, stateRow?: any): BookWithReadingState {
  let readingState: ReadingState | undefined;
  if (stateRow) {
    readingState = {
      id: stateRow.id,
      userId: stateRow.user_id,
      bookId: stateRow.book_id,
      status: stateRow.status as ReadingStatus,
      currentChapter: stateRow.current_chapter,
      currentPage: stateRow.current_page,
      progressPercentage: stateRow.progress_percentage,
      wishlist: stateRow.wishlist ?? false,
      lastReadAt: stateRow.last_read_at,
      completedAt: stateRow.completed_at,
      updatedAt: stateRow.updated_at,
    };
  }

  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    author: row.author,
    description: row.description || '',
    category: row.category,
    language: row.language,
    coverFileUrl: row.cover_file_url,
    coverFileKey: row.cover_file_key,
    coverImagePosition: row.cover_image_position || 'center',
    pdfFileUrl: row.pdf_file_url,
    pdfFileKey: row.pdf_file_key,
    pdfFileName: row.pdf_file_name,
    totalPages: row.total_pages,
    totalChapters: row.total_chapters,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    readingState,
  };
}

export const supabaseBooksService = {
  async getBooks(filters?: BookFilterOptions): Promise<BookWithReadingState[]> {
    let query = supabase.from('books').select('*, reading_states(*)').order('created_at', { ascending: false });

    if (filters?.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }
    if (filters?.language && filters.language !== 'All') {
      query = query.eq('language', filters.language);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getBooks warning:', error.message);
      return [];
    }

    let books: BookWithReadingState[] = (data || []).map((row: any) => {
      const stateRow = Array.isArray(row.reading_states) ? row.reading_states[0] : row.reading_states;
      return mapBookFromRow(row, stateRow);
    });

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      books = books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== 'All') {
      books = books.filter((b) => b.readingState?.status === filters.status);
    }

    if (filters?.wishlistOnly) {
      books = books.filter((b) => b.readingState?.wishlist);
    }

    return books;
  },

  async getBookById(id: string): Promise<BookWithReadingState | null> {
    const { data: bookRow, error } = await supabase
      .from('books')
      .select('*, reading_states(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !bookRow) return null;

    const stateRow = Array.isArray(bookRow.reading_states) ? bookRow.reading_states[0] : bookRow.reading_states;
    return mapBookFromRow(bookRow, stateRow);
  },

  async createBook(data: Partial<Book>): Promise<BookWithReadingState> {
    const bookId = `book_${Date.now()}`;
    const ownerId = data.ownerId || 'sooraj_user';

    const insertPayload = {
      id: bookId,
      owner_id: ownerId,
      title: data.title || 'Untitled',
      author: data.author || 'Unknown',
      description: data.description || '',
      category: data.category || 'Other Books',
      language: data.language || 'English',
      cover_file_url: data.coverFileUrl || null,
      cover_file_key: data.coverFileKey || null,
      cover_image_position: data.coverImagePosition || 'center',
      pdf_file_url: data.pdfFileUrl || null,
      pdf_file_key: data.pdfFileKey || null,
      pdf_file_name: data.pdfFileName || null,
      total_pages: data.totalPages ?? null,
      total_chapters: data.totalChapters ?? null,
    };

    const { data: newBook, error } = await supabase
      .from('books')
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw new Error(error.message);

    const stateId = `rs_${Date.now()}`;
    const { data: newState } = await supabase
      .from('reading_states')
      .insert({
        id: stateId,
        user_id: ownerId,
        book_id: newBook.id,
        status: 'Not Started',
        current_chapter: 0,
        current_page: 0,
        progress_percentage: 0,
        wishlist: false,
      })
      .select()
      .single();

    return mapBookFromRow(newBook, newState);
  },

  async updateBook(id: string, data: Partial<Book>): Promise<BookWithReadingState> {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.author !== undefined) updatePayload.author = data.author;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.language !== undefined) updatePayload.language = data.language;
    if (data.coverFileUrl !== undefined) updatePayload.cover_file_url = data.coverFileUrl;
    if (data.coverFileKey !== undefined) updatePayload.cover_file_key = data.coverFileKey;
    if (data.coverImagePosition !== undefined) updatePayload.cover_image_position = data.coverImagePosition;
    if (data.pdfFileUrl !== undefined) updatePayload.pdf_file_url = data.pdfFileUrl;
    if (data.pdfFileKey !== undefined) updatePayload.pdf_file_key = data.pdfFileKey;
    if (data.pdfFileName !== undefined) updatePayload.pdf_file_name = data.pdfFileName;
    if (data.totalPages !== undefined) updatePayload.total_pages = data.totalPages;
    if (data.totalChapters !== undefined) updatePayload.total_chapters = data.totalChapters;

    const { error } = await supabase
      .from('books')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw new Error(error.message);
    const updated = await this.getBookById(id);
    if (!updated) throw new Error('Failed to retrieve updated book');
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
    const book = await this.getBookById(bookId);
    if (!book) throw new Error('Book not found');

    const isChapterBased = ['Manga', 'Manhwa', 'Comics'].includes(book.category);
    const newChapter = updates.currentChapter !== undefined ? updates.currentChapter : (book.readingState?.currentChapter || 0);
    const newPage = updates.currentPage !== undefined ? updates.currentPage : (book.readingState?.currentPage || 0);
    const calculatedPct = isChapterBased
      ? calculateProgressPercentage(book.category, newChapter, book.totalChapters)
      : calculateProgressPercentage(book.category, newPage, book.totalPages);

    let status = updates.status || book.readingState?.status || 'Reading';
    if (calculatedPct === 100) status = 'Completed';

    const payload: any = {
      status,
      current_chapter: newChapter,
      current_page: newPage,
      progress_percentage: calculatedPct,
      last_read_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (updates.wishlist !== undefined) {
      payload.wishlist = updates.wishlist;
    }

    const { data: existing } = await supabase
      .from('reading_states')
      .select('id')
      .eq('book_id', bookId)
      .maybeSingle();

    if (existing) {
      await supabase.from('reading_states').update(payload).eq('book_id', bookId);
    } else {
      await supabase.from('reading_states').insert({
        id: `rs_${Date.now()}`,
        user_id: 'sooraj_user',
        book_id: bookId,
        ...payload,
      });
    }

    const updated = await this.getBookById(bookId);
    if (!updated) throw new Error('Failed to retrieve updated book');
    return updated;
  },

  async deleteBook(id: string): Promise<void> {
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async toggleWishlist(bookId: string): Promise<BookWithReadingState> {
    const book = await this.getBookById(bookId);
    if (!book) throw new Error('Book not found');
    const currentWishlist = book.readingState?.wishlist ?? false;
    return this.updateReadingProgress(bookId, { wishlist: !currentWishlist });
  },
};
