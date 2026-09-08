import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { BOOK_CATEGORIES, BOOK_LANGUAGES } from '../../utils/constants';
import { BookCategory, BookWithReadingState } from '../../types/book.types';
import { storageService, searchAllLiterature, ExternalBookCandidate } from '../../services';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Loader2,
  Focus,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
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
  const [coverImagePosition, setCoverImagePosition] = useState<string>('center');
  const [isCustomUrlMode, setIsCustomUrlMode] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileKey, setPdfFileKey] = useState('');
  
  // Smart Search & Auto-Fill states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ExternalBookCandidate[]>([]);
  const [autoFillNotice, setAutoFillNotice] = useState('');

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
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
      setCoverImagePosition(initialData.coverImagePosition || 'center');
      setIsCustomUrlMode(false);
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
      setCoverImagePosition('center');
      setIsCustomUrlMode(false);
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
    setCoverUploadProgress(0);
    setError('');
    try {
      const res = await storageService.uploadFile(file, {
        category: 'books/covers',
        onProgress: (pct) => setCoverUploadProgress(pct),
      });
      setCoverFileUrl(res.fileUrl);
      setCoverFileKey(res.fileKey);
      setCoverUploadProgress(100);
    } catch (err: any) {
      setError(err.message || 'Failed to upload cover image.');
    } finally {
      setIsUploadingCover(false);
      e.target.value = '';
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPdf(true);
    setPdfUploadProgress(0);
    setError('');
    try {
      const res = await storageService.uploadFile(file, {
        category: 'books/pdfs',
        onProgress: (pct) => setPdfUploadProgress(pct),
      });
      setPdfFileName(res.fileName);
      setPdfFileKey(res.fileKey);
      setPdfUploadProgress(100);
    } catch (err: any) {
      setError(err.message || 'Failed to upload PDF.');
    } finally {
      setIsUploadingPdf(false);
      e.target.value = '';
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
        coverFileUrl: coverFileUrl ? coverFileUrl.trim() : null,
        coverFileKey: coverFileKey ? coverFileKey.trim() : null,
        coverImagePosition: coverImagePosition || 'center',
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

        {/* Cover Image & File Attachments */}
        <div className="space-y-4 pt-1">
          {/* Cover Image Configuration Card */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Book Cover Image</span>
              </label>
              {coverFileUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverFileUrl('');
                    setCoverFileKey('');
                  }}
                  className="text-[11px] font-medium text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Remove Cover</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Cover Live Preview Card */}
              <div className="relative w-24 h-32 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md group">
                {coverFileUrl ? (
                  <>
                    <img
                      src={coverFileUrl}
                      alt="Cover preview"
                      className="w-full h-full object-cover transition-all duration-300"
                      style={{ objectPosition: coverImagePosition }}
                    />
                    <div className="absolute inset-x-0 bottom-0 py-0.5 px-1 bg-slate-950/80 backdrop-blur-sm text-[9px] text-center text-slate-300 font-mono truncate">
                      {coverImagePosition}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5 p-2 text-center">
                    <UploadCloud className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] text-slate-400">No cover</span>
                  </div>
                )}
              </div>

              {/* Cover Source Buttons & Position Settings */}
              <div className="flex-1 space-y-3 min-w-0">
                {/* Upload & Direct URL Controls */}
                <div className="flex flex-wrap items-center gap-2">
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
                    <span>{isUploadingCover ? `Uploading (${coverUploadProgress}%)` : coverFileUrl ? 'Replace File' : 'Upload Image'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsCustomUrlMode(!isCustomUrlMode)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 transition-colors"
                  >
                    <LinkIcon className="w-3 h-3" />
                    <span>{isCustomUrlMode ? 'Hide URL' : 'Image URL'}</span>
                  </button>

                  <span className="text-[10px] text-slate-500">JPG, PNG, WebP</span>
                </div>

                {isUploadingCover && (
                  <div className="w-full space-y-1 pt-0.5">
                    <div className="flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      <span>Uploading cover image...</span>
                      <span>{coverUploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-150 ease-out"
                        style={{ width: `${coverUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {isCustomUrlMode && (
                  <div className="pt-0.5 animate-in fade-in duration-200">
                    <input
                      type="url"
                      placeholder="Paste direct image URL (https://...)"
                      value={coverFileUrl}
                      onChange={(e) => {
                        setCoverFileUrl(e.target.value);
                        setCoverFileKey('');
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {/* Cover Image Position Options */}
                {coverFileUrl && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Focus className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Cover Image Position (Focal Point)</span>
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                        {coverImagePosition}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Presets: Top, Center, Bottom */}
                      <div className="flex items-center gap-1">
                        {[
                          { id: 'top', label: 'Top', icon: <ArrowUp className="w-3 h-3" /> },
                          { id: 'center', label: 'Center', icon: <Focus className="w-3 h-3" /> },
                          { id: 'bottom', label: 'Bottom', icon: <ArrowDown className="w-3 h-3" /> },
                        ].map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setCoverImagePosition(preset.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                              coverImagePosition === preset.id
                                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                                : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                            }`}
                          >
                            {preset.icon}
                            <span>{preset.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="h-4 w-px bg-slate-300 dark:bg-white/10 hidden sm:block" />

                      {/* 9-Point Alignment Matrix */}
                      <div className="flex items-center gap-2">
                        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/80 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-800">
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
                              onClick={() => setCoverImagePosition(pos.id)}
                              className={`w-4 h-4 rounded-sm transition-all flex items-center justify-center ${
                                coverImagePosition === pos.id
                                  ? 'bg-indigo-600 ring-1 ring-indigo-400'
                                  : 'bg-slate-300 dark:bg-slate-700 hover:bg-indigo-400/50'
                              }`}
                            >
                              <span className={`w-1 h-1 rounded-full ${coverImagePosition === pos.id ? 'bg-white' : 'bg-transparent'}`} />
                            </button>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-500">9-Point Grid</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Select <strong>Top</strong> to prevent title or faces from being cropped, or pick a custom alignment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PDF Attachment Upload */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Attach PDF (R2)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
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
                  <span>{isUploadingPdf ? `Uploading (${pdfUploadProgress}%)` : pdfFileName ? 'Replace PDF' : 'Upload PDF'}</span>
                </label>
                {isUploadingPdf && (
                  <div className="w-full space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      <span>Uploading PDF document...</span>
                      <span>{pdfUploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-150 ease-out"
                        style={{ width: `${pdfUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {pdfFileName && !isUploadingPdf && (
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
