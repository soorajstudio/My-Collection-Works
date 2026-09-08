import { ID, Query, Permission, Role } from 'appwrite';
import { databases, APPWRITE_CONFIG } from './client';
import { Book, BookWithReadingState, ReadingState, BookFilterOptions, ReadingStatus } from '../../types/book.types';
import { calculateProgressPercentage } from '../../utils/formatters';

const COVER_POS_KEY = 'mylibrary_cover_positions_cache';

function getCachedCoverPosition(id: string): string | undefined {
  try {
    const raw = localStorage.getItem(COVER_POS_KEY);
    return raw ? JSON.parse(raw)[id] : undefined;
  } catch {
    return undefined;
  }
}

function setCachedCoverPosition(id: string, pos: string): void {
  try {
    const raw = localStorage.getItem(COVER_POS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[id] = pos;
    localStorage.setItem(COVER_POS_KEY, JSON.stringify(map));
  } catch {}
}

export function extractPositionFromDoc(doc: any): string {
  if (doc.coverImagePosition) return doc.coverImagePosition;
  if (doc.coverFileKey && typeof doc.coverFileKey === 'string' && doc.coverFileKey.includes('#pos:')) {
    try {
      const parsed = decodeURIComponent(doc.coverFileKey.split('#pos:')[1]);
      if (parsed) return parsed;
    } catch {}
  }
  return getCachedCoverPosition(doc.$id) || 'center';
}

export function attachPositionToKey(key: string | null | undefined, position: string | undefined): string | null {
  if (!position) return key || null;
  const baseKey = key ? key.split('#pos:')[0] : '';
  return baseKey ? `${baseKey}#pos:${encodeURIComponent(position)}` : `#pos:${encodeURIComponent(position)}`;
}

export const liveBooksService = {
  async getBooks(filters?: BookFilterOptions): Promise<BookWithReadingState[]> {
    const queries: string[] = [Query.orderDesc('$createdAt'), Query.limit(100)];

    if (filters?.category && filters.category !== 'All') {
      queries.push(Query.equal('category', filters.category));
    }
    if (filters?.language && filters.language !== 'All') {
      queries.push(Query.equal('language', filters.language));
    }

    const booksRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.books,
      queries
    );

    // Fetch all reading states for user
    const statesRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.readingStates,
      [Query.limit(100)]
    );

    const statesMap = new Map<string, ReadingState>();
    for (const doc of statesRes.documents) {
      statesMap.set(doc.bookId, {
        id: doc.$id,
        userId: doc.userId,
        bookId: doc.bookId,
        status: doc.status as ReadingStatus,
        currentChapter: doc.currentChapter,
        currentPage: doc.currentPage,
        progressPercentage: doc.progressPercentage,
        wishlist: doc.wishlist ?? false,
        lastReadAt: doc.lastReadAt,
        updatedAt: doc.updatedAt || doc.$updatedAt,
      });
    }

    let books: BookWithReadingState[] = booksRes.documents.map((doc) => {
      const readingState = statesMap.get(doc.$id);
      return {
        id: doc.$id,
        ownerId: doc.ownerId,
        title: doc.title,
        author: doc.author,
        description: doc.description || '',
        category: doc.category,
        language: doc.language,
        coverFileUrl: doc.coverFileUrl,
        coverFileKey: doc.coverFileKey,
        coverImagePosition: extractPositionFromDoc(doc),
        pdfFileUrl: doc.pdfFileUrl,
        pdfFileKey: doc.pdfFileKey,
        pdfFileName: doc.pdfFileName,
        totalPages: doc.totalPages ?? null,
        totalChapters: doc.totalChapters ?? null,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
        readingState: readingState || undefined,
      };
    });

    // Client-side text search & status filtering
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
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
    try {
      const doc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.books,
        id
      );

      const statesRes = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.readingStates,
        [Query.equal('bookId', id), Query.limit(1)]
      );

      let readingState: ReadingState | null = null;
      if (statesRes.documents.length > 0) {
        const sDoc = statesRes.documents[0];
        readingState = {
          id: sDoc.$id,
          userId: sDoc.userId,
          bookId: sDoc.bookId,
          status: sDoc.status as ReadingStatus,
          currentChapter: sDoc.currentChapter,
          currentPage: sDoc.currentPage,
          progressPercentage: sDoc.progressPercentage,
          wishlist: sDoc.wishlist ?? false,
          lastReadAt: sDoc.lastReadAt,
          updatedAt: sDoc.updatedAt || sDoc.$updatedAt,
        };
      }

      return {
        id: doc.$id,
        ownerId: doc.ownerId,
        title: doc.title,
        author: doc.author,
        description: doc.description || '',
        category: doc.category,
        language: doc.language,
        coverFileUrl: doc.coverFileUrl,
        coverFileKey: doc.coverFileKey,
        coverImagePosition: extractPositionFromDoc(doc),
        pdfFileUrl: doc.pdfFileUrl,
        pdfFileKey: doc.pdfFileKey,
        pdfFileName: doc.pdfFileName,
        totalPages: doc.totalPages ?? null,
        totalChapters: doc.totalChapters ?? null,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
        readingState: readingState || undefined,
      };
    } catch {
      return null;
    }
  },

  async createBook(data: Partial<Book>): Promise<BookWithReadingState> {
    const permissions = data.ownerId
      ? [
          Permission.read(Role.user(data.ownerId)),
          Permission.update(Role.user(data.ownerId)),
          Permission.delete(Role.user(data.ownerId)),
        ]
      : [];

    const effectiveKey = attachPositionToKey(data.coverFileKey, data.coverImagePosition);

    const createPayload: Record<string, any> = {
      ownerId: data.ownerId,
      title: data.title,
      author: data.author,
      description: data.description || '',
      category: data.category,
      language: data.language,
      coverFileUrl: data.coverFileUrl || null,
      coverFileKey: effectiveKey || null,
      coverImagePosition: data.coverImagePosition || 'center',
      pdfFileUrl: data.pdfFileUrl || null,
      pdfFileKey: data.pdfFileKey || null,
      pdfFileName: data.pdfFileName || null,
      totalPages: data.totalPages ?? null,
      totalChapters: data.totalChapters ?? null,
    };

    let bookDoc;
    try {
      bookDoc = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.books,
        ID.unique(),
        createPayload,
        permissions
      );
    } catch (createErr: any) {
      // Graceful fallback if coverImagePosition attribute doesn't exist on remote collection yet
      if (createErr?.message?.includes('coverImagePosition')) {
        delete createPayload.coverImagePosition;
        bookDoc = await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.books,
          ID.unique(),
          createPayload,
          permissions
        );
      } else {
        throw createErr;
      }
    }

    // Create associated initial reading state
    const stateDoc = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.readingStates,
      ID.unique(),
      {
        userId: data.ownerId,
        bookId: bookDoc.$id,
        status: 'Not Started',
        currentChapter: 0,
        currentPage: 0,
        progressPercentage: 0,
        wishlist: false,
        lastReadAt: null,
      },
      permissions
    );

    if (data.coverImagePosition) {
      setCachedCoverPosition(bookDoc.$id, data.coverImagePosition);
    }

    return {
      id: bookDoc.$id,
      ownerId: bookDoc.ownerId,
      title: bookDoc.title,
      author: bookDoc.author,
      description: bookDoc.description,
      category: bookDoc.category,
      language: bookDoc.language,
      coverFileUrl: bookDoc.coverFileUrl,
      coverFileKey: bookDoc.coverFileKey,
      coverImagePosition: extractPositionFromDoc(bookDoc) || data.coverImagePosition || 'center',
      pdfFileUrl: bookDoc.pdfFileUrl,
      pdfFileKey: bookDoc.pdfFileKey,
      pdfFileName: bookDoc.pdfFileName,
      totalPages: bookDoc.totalPages,
      totalChapters: bookDoc.totalChapters,
      createdAt: bookDoc.$createdAt,
      updatedAt: bookDoc.$updatedAt,
      readingState: {
        id: stateDoc.$id,
        userId: stateDoc.userId,
        bookId: stateDoc.bookId,
        status: stateDoc.status as ReadingStatus,
        currentChapter: stateDoc.currentChapter,
        currentPage: stateDoc.currentPage,
        progressPercentage: stateDoc.progressPercentage,
        wishlist: stateDoc.wishlist,
        lastReadAt: stateDoc.lastReadAt,
        updatedAt: stateDoc.$updatedAt,
      },
    };
  },

  async updateBook(id: string, data: Partial<Book>): Promise<BookWithReadingState> {
    if (data.coverImagePosition) {
      setCachedCoverPosition(id, data.coverImagePosition);
    }

    // Fetch existing book key if needed to preserve base key while updating position
    let existingKey: string | undefined = data.coverFileKey;
    if (data.coverImagePosition !== undefined && existingKey === undefined) {
      try {
        const existingDoc = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.books,
          id
        );
        existingKey = existingDoc.coverFileKey || undefined;
      } catch {}
    }

    const finalKey = (existingKey !== undefined || data.coverImagePosition !== undefined)
      ? attachPositionToKey(existingKey, data.coverImagePosition)
      : undefined;

    const updatePayload: Record<string, any> = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.author !== undefined && { author: data.author }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.language !== undefined && { language: data.language }),
      ...(data.coverFileUrl !== undefined && { coverFileUrl: data.coverFileUrl || null }),
      ...(finalKey !== undefined && { coverFileKey: finalKey }),
      ...(data.coverImagePosition !== undefined && { coverImagePosition: data.coverImagePosition }),
      ...(data.pdfFileUrl !== undefined && { pdfFileUrl: data.pdfFileUrl }),
      ...(data.pdfFileKey !== undefined && { pdfFileKey: data.pdfFileKey }),
      ...(data.pdfFileName !== undefined && { pdfFileName: data.pdfFileName }),
      ...(data.totalPages !== undefined && { totalPages: data.totalPages }),
      ...(data.totalChapters !== undefined && { totalChapters: data.totalChapters }),
    };

    let bookDoc;
    try {
      bookDoc = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.books,
        id,
        updatePayload
      );
    } catch (updateErr: any) {
      if (updateErr?.message?.includes('coverImagePosition')) {
        delete updatePayload.coverImagePosition;
        bookDoc = await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.books,
          id,
          updatePayload
        );
      } else {
        throw updateErr;
      }
    }

    const fullBook = await this.getBookById(bookDoc.$id);
    if (!fullBook) throw new Error('Failed to retrieve updated book');
    if (data.coverImagePosition) {
      fullBook.coverImagePosition = data.coverImagePosition;
    }
    return fullBook;
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

    const statesRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.readingStates,
      [Query.equal('bookId', bookId), Query.limit(1)]
    );

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
      currentChapter: newChapter,
      currentPage: newPage,
      progressPercentage: calculatedPct,
      lastReadAt: new Date().toISOString(),
    };
    if (updates.wishlist !== undefined) {
      payload.wishlist = updates.wishlist;
    }

    if (statesRes.documents.length > 0) {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.readingStates,
        statesRes.documents[0].$id,
        payload
      );
    }

    const updatedBook = await this.getBookById(bookId);
    if (!updatedBook) throw new Error('Failed to retrieve updated book');
    return updatedBook;
  },

  async deleteBook(id: string): Promise<void> {
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.books,
      id
    );

    // Delete associated reading state
    try {
      const states = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.readingStates,
        [Query.equal('bookId', id)]
      );
      for (const s of states.documents) {
        await databases.deleteDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.readingStates,
          s.$id
        );
      }
    } catch {
      // Ignore if state deletion fails
    }
  },

  async toggleWishlist(bookId: string): Promise<BookWithReadingState> {
    const book = await this.getBookById(bookId);
    if (!book) throw new Error('Book not found');
    const currentWishlist = book.readingState?.wishlist ?? false;
    return this.updateReadingProgress(bookId, { wishlist: !currentWishlist });
  },
};
