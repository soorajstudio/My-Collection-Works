import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Award, Code2, ArrowRight, X, Sparkles } from 'lucide-react';
import { booksService, certificatesService, projectsService } from '../../services';
import { BookWithReadingState } from '../../types/book.types';
import { Certificate } from '../../types/certificate.types';
import { Project } from '../../types/project.types';
import { Badge } from '../common/Badge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<BookWithReadingState[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setBooks([]);
      setCertificates([]);
      setProjects([]);
      return;
    }

    if (!query.trim()) {
      setBooks([]);
      setCertificates([]);
      setProjects([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const [b, c, p] = await Promise.all([
          booksService.getBooks({ search: query }),
          certificatesService.getCertificates({ search: query }),
          projectsService.getProjects({ search: query }),
        ]);
        setBooks(b);
        setCertificates(c);
        setProjects(p);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const totalResults = books.length + certificates.length + projects.length;

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

            <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl rounded-2xl glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl shadow-black/40 overflow-hidden z-10"
          >
            {/* Search Input Header */}
            <div className="flex items-center px-4 py-3.5 border-b border-black/[0.06] dark:border-white/5 gap-3">
              <Search className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across books, certificates, projects..."
                className="w-full bg-transparent border-none text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                ESC
              </kbd>
            </div>

            {/* Search Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
              {isLoading ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400 animate-spin" />
                  <span>Searching vault...</span>
                </div>
              ) : !query.trim() ? (
                <div className="py-10 text-center text-slate-500 dark:text-slate-400 text-xs">
                  Type to search titles, authors, organizations, technologies, or tags.
                </div>
              ) : totalResults === 0 ? (
                <div className="py-10 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No records found matching "{query}".
                </div>
              ) : (
                <>
                  {/* Books Section */}
                  {books.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 px-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Books ({books.length})</span>
                      </div>
                      <div className="space-y-1">
                        {books.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => handleSelect(`/books/${b.id}`)}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] border border-transparent hover:border-slate-200 dark:hover:border-white/5 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={b.coverFileUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100&auto=format&fit=crop&q=80'}
                                alt=""
                                className="w-8 h-10 rounded object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate">
                                  {b.title}
                                </h4>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                                  by {b.author} · {b.category}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {b.readingState && (
                                <Badge variant={b.readingState.status === 'Completed' ? 'emerald' : b.readingState.status === 'Reading' ? 'amber' : 'slate'} size="sm">
                                  {b.readingState.status}
                                </Badge>
                              )}
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-white transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certificates Section */}
                  {certificates.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2 px-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>Certificates ({certificates.length})</span>
                      </div>
                      <div className="space-y-1">
                        {certificates.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleSelect(`/certificates/${c.id}`)}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] border border-transparent hover:border-slate-200 dark:hover:border-white/5 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                <Award className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 truncate">
                                  {c.name}
                                </h4>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                                  {c.issuingOrg} · {c.category}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-white transition-colors shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects Section */}
                  {projects.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 px-1">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Projects ({projects.length})</span>
                      </div>
                      <div className="space-y-1">
                        {projects.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSelect(`/projects/${p.id}`)}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] border border-transparent hover:border-slate-200 dark:hover:border-white/5 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Code2 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 truncate">
                                  {p.name}
                                </h4>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                                  {p.technologies.slice(0, 3).join(', ')} · {p.status}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-white transition-colors shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
