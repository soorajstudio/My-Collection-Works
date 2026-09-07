import { BookCategory } from '../types/book.types';
import { booksService } from './index';

export interface ExternalBookCandidate {
  id?: string;
  title: string;
  author: string;
  category: BookCategory;
  language: string;
  description: string;
  coverUrl?: string;
  totalPages?: number | null;
  totalChapters?: number | null;
  source: 'MangaDex' | 'OpenLibrary' | 'GoogleBooks';
  status?: string;
}

/**
 * Normalizes title for fuzzy comparison
 */
function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Searches MangaDex API for Manga & Manhwa
 */
export async function searchMangaDex(query: string): Promise<ExternalBookCandidate[]> {
  try {
    const res = await fetch(
      `https://api.mangadex.org/manga?title=${encodeURIComponent(query)}&limit=6&includes[]=cover_art&includes[]=author&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`
    );
    const data = await res.json();
    if (!data.data || !Array.isArray(data.data)) return [];

    return data.data.map((m: any) => {
      // Extract title
      const titleObj = m.attributes?.title || {};
      const title =
        titleObj.en ||
        titleObj['ja-ro'] ||
        titleObj['ko-ro'] ||
        Object.values(titleObj)[0] ||
        'Untitled';

      // Extract author
      const authorRel = m.relationships?.find((r: any) => r.type === 'author');
      const author = authorRel?.attributes?.name || 'Unknown Creator';

      // Extract cover image
      const coverRel = m.relationships?.find((r: any) => r.type === 'cover_art');
      const coverFileName = coverRel?.attributes?.fileName;
      const coverUrl = coverFileName
        ? `https://uploads.mangadex.org/covers/${m.id}/${coverFileName}.512.jpg`
        : undefined;

      // Extract description
      const descObj = m.attributes?.description || {};
      const description = descObj.en || Object.values(descObj)[0] || '';

      // Determine category from original language
      const origLang = m.attributes?.originalLanguage;
      let category: BookCategory = 'Manga';
      if (origLang === 'ko') category = 'Manhwa';
      else if (origLang === 'zh' || origLang === 'zh-hk') category = 'Comics';

      // Total chapters if marked completed or lastChapter attribute
      const lastCh = parseFloat(m.attributes?.lastChapter);
      const totalChapters = !isNaN(lastCh) && lastCh > 0 ? Math.round(lastCh) : null;

      return {
        id: m.id,
        title: String(title),
        author: String(author),
        category,
        language: origLang === 'ko' ? 'Korean' : origLang === 'ja' ? 'Japanese' : 'English',
        description: String(description).slice(0, 500),
        coverUrl,
        totalChapters,
        source: 'MangaDex',
        status: m.attributes?.status,
      };
    });
  } catch (err) {
    console.warn('MangaDex search failed:', err);
    return [];
  }
}

/**
 * Searches Open Library for novels and general books
 */
export async function searchOpenLibrary(query: string): Promise<ExternalBookCandidate[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const res = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: { 'User-Agent': 'MyLibraryVault/1.0 (collection-tracker)' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    const data = await res.json();
    if (!data.docs || !Array.isArray(data.docs)) return [];

    return data.docs.map((doc: any) => {
      const title = doc.title || 'Untitled Book';
      const author = Array.isArray(doc.author_name) ? doc.author_name[0] : 'Unknown Author';
      const pages = doc.number_of_pages_median || doc.number_of_pages || null;
      const coverUrl = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : undefined;

      // Guess category
      const subjects = (doc.subject || []).map((s: string) => s.toLowerCase());
      let category: BookCategory = 'Novel';
      if (subjects.some((s: string) => s.includes('comic') || s.includes('graphic novel'))) {
        category = 'Comics';
      } else if (subjects.some((s: string) => s.includes('manga'))) {
        category = 'Manga';
      } else if (!subjects.some((s: string) => s.includes('fiction') || s.includes('novel'))) {
        category = 'Other Books';
      }

      return {
        id: doc.key,
        title,
        author,
        category,
        language: 'English',
        description: doc.first_sentence?.[0] || doc.subtitle || '',
        coverUrl,
        totalPages: pages ? parseInt(String(pages), 10) : null,
        source: 'OpenLibrary',
      };
    });
  } catch (err) {
    console.warn('Open Library search failed or timed out:', err);
    return [];
  }
}

/**
 * Searches Google Books API as another fast literature provider
 */
export async function searchGoogleBooks(query: string): Promise<ExternalBookCandidate[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) return [];

    return data.items.map((item: any) => {
      const info = item.volumeInfo || {};
      const title = info.title || 'Untitled';
      const author = Array.isArray(info.authors) ? info.authors.join(', ') : 'Unknown Author';
      const pages = info.pageCount || null;
      const coverUrl =
        info.imageLinks?.thumbnail?.replace('http://', 'https://') ||
        info.imageLinks?.smallThumbnail?.replace('http://', 'https://');

      let category: BookCategory = 'Novel';
      const cats = (info.categories || []).map((c: string) => c.toLowerCase());
      if (cats.some((c: string) => c.includes('comic') || c.includes('graphic novel'))) {
        category = 'Comics';
      } else if (cats.some((c: string) => c.includes('manga'))) {
        category = 'Manga';
      } else if (!cats.some((c: string) => c.includes('fiction'))) {
        category = 'Other Books';
      }

      return {
        id: item.id,
        title,
        author,
        category,
        language: info.language === 'en' ? 'English' : info.language || 'English',
        description: info.description || '',
        coverUrl,
        totalPages: pages,
        source: 'GoogleBooks',
      };
    });
  } catch (err) {
    console.warn('Google Books search failed:', err);
    return [];
  }
}

/**
 * Unified Search across MangaDex (Manga/Manhwa) and Books/Novels
 */
export async function searchAllLiterature(query: string): Promise<ExternalBookCandidate[]> {
  if (!query.trim()) return [];

  // Run MangaDex and literature searches in parallel
  const [mangaResults, bookResults] = await Promise.allSettled([
    searchMangaDex(query),
    searchGoogleBooks(query).then(async (res) => {
      if (res.length > 0) return res;
      return searchOpenLibrary(query);
    }),
  ]);

  const results: ExternalBookCandidate[] = [];

  if (mangaResults.status === 'fulfilled') {
    results.push(...mangaResults.value);
  }
  if (bookResults.status === 'fulfilled') {
    results.push(...bookResults.value);
  }

  // Deduplicate and rank by query match
  const cleanQ = normalizeTitle(query);
  results.sort((a, b) => {
    const aMatch = normalizeTitle(a.title) === cleanQ;
    const bMatch = normalizeTitle(b.title) === cleanQ;
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  return results.slice(0, 8);
}

/**
 * Fetches real-time latest chapter count for a manga or manhwa from MangaDex
 */
export async function fetchRealtimeChapterCount(
  title: string
): Promise<{ latestChapter: number; matchedTitle: string; status?: string } | null> {
  try {
    const cleanTarget = normalizeTitle(title);
    const searchRes = await fetch(
      `https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=10&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`
    );
    const searchData = await searchRes.json();
    if (!searchData.data || searchData.data.length === 0) return null;

    // Pick best match by comparing title & altTitles
    let bestManga = searchData.data[0];
    let bestScore = -1;

    for (const m of searchData.data) {
      const allTitles: string[] = [...Object.values(m.attributes?.title || {}) as string[]];
      if (Array.isArray(m.attributes?.altTitles)) {
        for (const alt of m.attributes.altTitles) {
          allTitles.push(...(Object.values(alt) as string[]));
        }
      }

      for (const t of allTitles) {
        const cleanT = normalizeTitle(String(t));
        if (cleanT === cleanTarget) {
          bestManga = m;
          bestScore = 100;
          break;
        }
        if (cleanT.includes(cleanTarget) || cleanTarget.includes(cleanT)) {
          const score = 50 - Math.abs(cleanT.length - cleanTarget.length);
          if (score > bestScore) {
            bestScore = score;
            bestManga = m;
          }
        }
      }
      if (bestScore === 100) break;
    }

    const matchedTitle =
      bestManga.attributes?.title?.en ||
      Object.values(bestManga.attributes?.title || {})[0] ||
      title;

    // 1. Check lastChapter attribute on manga record
    const lastChapterAttr = parseFloat(bestManga.attributes?.lastChapter);

    // 2. Check aggregate endpoint
    let maxAggCh = 0;
    try {
      const aggRes = await fetch(`https://api.mangadex.org/manga/${bestManga.id}/aggregate`);
      const aggData = await aggRes.json();
      if (aggData.volumes) {
        for (const v of Object.values(aggData.volumes) as any[]) {
          if (v.chapters) {
            for (const chKey of Object.keys(v.chapters)) {
              const num = parseFloat(chKey);
              if (!isNaN(num) && num > maxAggCh) maxAggCh = num;
            }
          }
        }
      }
    } catch {}

    // 3. Check feed endpoint
    let maxFeedCh = 0;
    try {
      const feedRes = await fetch(
        `https://api.mangadex.org/manga/${bestManga.id}/feed?order[chapter]=desc&limit=10&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`
      );
      const feedData = await feedRes.json();
      if (feedData.data && Array.isArray(feedData.data)) {
        for (const item of feedData.data) {
          const num = parseFloat(item.attributes?.chapter);
          if (!isNaN(num) && num > maxFeedCh) maxFeedCh = num;
        }
      }
    } catch {}

    const highest = Math.max(
      !isNaN(lastChapterAttr) ? lastChapterAttr : 0,
      maxAggCh,
      maxFeedCh
    );

    if (highest <= 0) return null;

    return {
      latestChapter: Math.round(highest),
      matchedTitle: String(matchedTitle),
      status: bestManga.attributes?.status,
    };
  } catch (err) {
    console.error('Failed to fetch real-time chapters from MangaDex:', err);
    return null;
  }
}

/**
 * Synchronizes real-time chapter count for a book in Appwrite Cloud DB
 */
export async function syncMangaManhwaChapters(bookId: string, title: string) {
  const result = await fetchRealtimeChapterCount(title);
  if (!result || !result.latestChapter) {
    throw new Error(`Could not find real-time chapter count for "${title}" on MangaDex.`);
  }

  // Update book in Appwrite database
  const updatedBook = await booksService.updateBook(bookId, {
    totalChapters: result.latestChapter,
  });

  return {
    book: updatedBook,
    latestChapter: result.latestChapter,
    matchedTitle: result.matchedTitle,
    status: result.status,
  };
}
