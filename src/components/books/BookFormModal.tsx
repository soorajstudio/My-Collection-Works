import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { BOOK_CATEGORIES, BOOK_LANGUAGES } from '../../utils/constants';
import { BookCategory, BookWithReadingState } from '../../types/book.types';
import { storageService, searchAllLiterature, ExternalBookCandidate } from '../../services';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Sparkles, Search, Loader2 } from 'lucide-react';
import { Badge } from '../common/Badge';

interface BookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: BookWithReadingState | null;
}

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<BookCategory>('Novel');
  const [language, setLanguage] = useState('English');
  const [description, setDescription] = useState('');
  const [totalPages, setTotalPages] = useState<string>('');
  const [totalChapters, setTotalChapters] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<string>('');
  const [currentChapter, setCurrentChapter] = useState<string>('');
  const [coverFileUrl, setCoverFileUrl] = useState('');
  const [coverFileKey, setCoverFileKey] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileKey, setPdfFileKey] = useState('');
  
  // Smart Search & Auto-Fill states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ExternalBookCandidate[]>([]);
  const [autoFillNotice, setAutoFillNotice] = useState('');

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isChapterBased = ['Manga', 'Manhwa', 'Comics'].includes(category);


  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAuthor(initialData.author);
      setCategory(initialData.category);
      setLanguage(initialData.language);
      setDescription(initialData.description || '');
      setCoverFileUrl(initialData.coverFileUrl || '');
      setCoverFileKey(initialData.coverFileKey || '');
      setPdfFileName(initialData.pdfFileName || '');
      setPdfFileKey(initialData.pdfFileKey || '');
      setTotalPages(initialData.totalPages != null ? String(initialData.totalPages) : '');
      setTotalChapters(initialData.totalChapters != null ? String(initialData.totalChapters) : '');
      setCurrentPage(initialData.readingState?.currentPage != null ? String(initialData.readingState.currentPage) : '');
      setCurrentChapter(initialData.readingState?.currentChapter != null ? String(initialData.readingState.currentChapter) : '');
    } else {
      setTitle('');
      setAuthor('');
      setCategory('Novel');
      setLanguage('English');
      setDescription('');
      setTotalPages('');
      setTotalChapters('');
      setCurrentPage('');
      setCurrentChapter('');
      setCoverFileUrl('');
      setCoverFileKey('');
      setPdfFileName('');
      setPdfFileKey('');
    }
    setSearchQuery('');
    setSearchResults([]);
    setAutoFillNotice('');
    setError('');
  }, [initialData, isOpen]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setAutoFillNotice('');
    try {
      const results = await searchAllLiterature(searchQuery.trim());
      setSearchResults(results);
      if (results.length === 0) {
        setAutoFillNotice('No online matches found. You can enter details manually.');
      }
    } catch (err: any) {
      setAutoFillNotice('Search temporarily unavailable. Please enter details manually.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCandidate = (candidate: ExternalBookCandidate) => {
    setTitle(candidate.title);
    setAuthor(candidate.author);
    setCategory(candidate.category);
    setLanguage(candidate.language);
    if (candidate.description) setDescription(candidate.description);
    if (candidate.coverUrl) {
      setCoverFileUrl(candidate.coverUrl);
      setCoverFileKey('');
    }
    if (candidate.totalChapters != null) {
      setTotalChapters(String(candidate.totalChapters));
    }
    if (candidate.totalPages != null) {
      setTotalPages(String(candidate.totalPages));
    }
    setSearchResults([]);
    setAutoFillNotice(
      `✨ Auto-filled details from ${candidate.source}! You can review or edit any field below.`
    );
  };


  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    setError('');
    try {
      const res = await storageService.uploadFile(file, {
        category: 'books/covers',
        onProgress: setUploadProgress,
      });
      setCoverFileUrl(res.fileUrl);
      setCoverFileKey(res.fileKey);
    } catch (err: any) {
      setError(err.message || 'Failed to upload cover image.');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPdf(true);
    setError('');
    try {
      const res = await storageService.uploadFile(file, {
        category: 'books/pdfs',
        onProgress: setUploadProgress,
      });
      setPdfFileName(res.fileName);
      setPdfFileKey(res.fileKey);
    } catch (err: any) {
      setError(err.message || 'Failed to upload PDF.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setError('Title and Author are required fields.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        author: author.trim(),
        category,
        language,
        description: description.trim(),
        coverFileUrl: coverFileUrl || undefined,
        coverFileKey: coverFileKey || undefined,
        pdfFileName: pdfFileName || undefined,
        pdfFileKey: pdfFileKey || undefined,
        totalPages: !isChapterBased && totalPages ? parseInt(totalPages, 10) : null,
        totalChapters: isChapterBased && totalChapters ? parseInt(totalChapters, 10) : null,
        currentPage: !isChapterBased && currentPage ? parseInt(currentPage, 10) : null,
        currentChapter: isChapterBased && currentChapter ? parseInt(currentChapter, 10) : null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save book record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Book Record' : 'Add New Book'}
      description="Record literature, manga, comics, or educational books into your archive."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Search & Auto-Fill from Web */}
        {!initialData && (
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Quick Search & Auto-Fill</span>
              </label>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                MangaDex & Open Library
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search title (e.g. Solo Leveling, One Piece, Atomic Habits)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleSearch()}
                disabled={isSearching || !searchQuery.trim()}
                leftIcon={isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                className="text-xs shrink-0"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Auto-fill notification */}
            {autoFillNotice && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium animate-in fade-in">
                {autoFillNotice}
              </p>
            )}

            {/* Search Results Dropdown / List */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 border-t border-indigo-100 dark:border-indigo-500/10 pt-2.5">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Select a match to auto-fill details:
                </p>
                <div className="space-y-2">
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.coverUrl ? (
                          <img
                            src={item.coverUrl}
                            alt=""
                            className="w-9 h-12 object-cover rounded-md shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-12 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 text-xs">
                            📖
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                              {item.category}
                            </span>
                            <span className="text-[10px] text-slate-400">via {item.source}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">
                            by {item.author}
                            {item.totalChapters ? ` • ${item.totalChapters} Ch` : item.totalPages ? ` • ${item.totalPages} Pg` : ''}
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleSelectCandidate(item)}
                        className="text-xs shrink-0 py-1 px-3 h-8"
                      >
                        Auto-Fill
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Book Title *"
            placeholder="e.g. One Piece, Atomic Habits"

            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label="Author / Creator *"
            placeholder="e.g. Eiichiro Oda, James Clear"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BookCategory)}
              className="w-full bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {BOOK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {BOOK_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Page vs Chapter Inputs */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/5 space-y-3">
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {isChapterBased ? 'Chapter Tracking (Manga / Manhwa / Comics)' : 'Page Tracking (Novels / Other Books)'}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {isChapterBased ? (
              <>
                <Input
                  label="Current Chapter"
                  type="number"
                  placeholder="e.g. 25"
                  min="0"
                  value={currentChapter}
                  onChange={(e) => setCurrentChapter(e.target.value)}
                />
                <Input
                  label="Total Chapters (if known)"
                  type="number"
                  placeholder="e.g. 100"
                  min="1"
                  value={totalChapters}
                  onChange={(e) => setTotalChapters(e.target.value)}
                />
              </>
            ) : (
              <>
                <Input
                  label="Current Page"
                  type="number"
                  placeholder="e.g. 120"
                  min="0"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(e.target.value)}
                />
                <Input
                  label="Total Pages (if known)"
                  type="number"
                  placeholder="e.g. 350"
                  min="1"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                />
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Description / Synopsis
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key themes, notes, or brief synopsis..."
            className="w-full bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* File Uploads (Cover & PDF) to Cloudflare R2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Cover Image Upload */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Cover Image (R2)
            </label>
            <div className="flex items-center gap-3">
              {coverFileUrl ? (
                <img
                  src={coverFileUrl}
                  alt="Cover preview"
                  className="w-12 h-14 object-cover rounded-lg border border-slate-300 dark:border-slate-700"
                />
              ) : (
                <div className="w-12 h-14 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  id="book-cover-input"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                <label
                  htmlFor="book-cover-input"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploadingCover ? `Uploading (${uploadProgress}%)` : coverFileUrl ? 'Change Cover' : 'Upload Cover'}</span>
                </label>
                <p className="text-[10px] text-slate-500 mt-1">JPEG, PNG, WebP up to 5MB</p>
              </div>
            </div>
          </div>

          {/* PDF Attachment Upload */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Attach PDF (R2)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-14 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="book-pdf-input"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <label
                  htmlFor="book-pdf-input"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploadingPdf ? `Uploading (${uploadProgress}%)` : pdfFileName ? 'Replace PDF' : 'Upload PDF'}</span>
                </label>
                {pdfFileName && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 truncate">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{pdfFileName}</span>
                  </p>
                )}
                <p className="text-[10px] text-slate-500 mt-0.5">PDF documents up to 50MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.06] dark:border-white/5">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            {initialData ? 'Save Changes' : 'Record Book'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
