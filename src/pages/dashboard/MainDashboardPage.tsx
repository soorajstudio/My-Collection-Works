import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Code2, Heart, ArrowRight, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { HeroSection } from '../../components/hero/HeroSection';
import { ContinueReadingSection } from '../../components/dashboard/ContinueReadingSection';
import { ReadingProgressModal } from '../../components/books/ReadingProgressModal';
import { BookCard } from '../../components/books/BookCard';
import { CertificateCard } from '../../components/certificates/CertificateCard';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { dashboardService, booksService, certificatesService, projectsService } from '../../services';
import { MainDashboardStats } from '../../types/dashboard.types';
import { BookWithReadingState } from '../../types/book.types';
import { Certificate } from '../../types/certificate.types';
import { Project } from '../../types/project.types';
import { useToast } from '../../context/ToastContext';

export const MainDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<MainDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBookForProgress, setSelectedBookForProgress] = useState<BookWithReadingState | null>(null);
  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const data = await dashboardService.getMainDashboardStats();
      setStats(data);
    } catch (err: any) {
      error('Failed to load dashboard data', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for vault update events
    const handleVaultUpdate = () => loadData();
    window.addEventListener('vault_updated', handleVaultUpdate);
    return () => window.removeEventListener('vault_updated', handleVaultUpdate);
  }, []);

  const handleUpdateProgress = async (updates: any) => {
    if (!selectedBookForProgress) return;
    try {
      await booksService.updateReadingProgress(selectedBookForProgress.id, updates);
      success('Progress saved!', `Updated reading status for ${selectedBookForProgress.title}`);
      loadData();
    } catch (err: any) {
      error('Failed to update progress', err.message);
    }
  };

  const handleToggleWishlist = async (bookId: string) => {
    try {
      const updated = await booksService.toggleWishlist(bookId);
      success(
        updated.readingState?.wishlist ? 'Added to Wishlist' : 'Removed from Wishlist',
        updated.title
      );
      loadData();
    } catch (err: any) {
      error('Failed to toggle wishlist', err.message);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to remove this book from your vault?')) return;
    try {
      await booksService.deleteBook(id);
      success('Book removed');
      loadData();
    } catch (err: any) {
      error('Failed to delete book', err.message);
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await certificatesService.deleteCertificate(id);
      success('Certificate removed');
      loadData();
    } catch (err: any) {
      error('Failed to delete certificate', err.message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectsService.deleteProject(id);
      success('Project removed');
      loadData();
    } catch (err: any) {
      error('Failed to delete project', err.message);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-72 w-full rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* High-End Hero Section with Editorial Intro & Parallax Showcase */}
      <HeroSection
        stats={{
          totalBooks: stats.totalBooks,
          totalCertificates: stats.totalCertificates,
          totalProjects: stats.totalProjects,
          currentlyReading: stats.currentlyReading,
        }}
        onExplore={() => {
          const el = document.getElementById('collection-overview');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onQuickAdd={() => {
          window.dispatchEvent(new CustomEvent('open_quick_add'));
        }}
      />

      {/* Collection Overview Section */}
      <div id="collection-overview" className="space-y-8">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-5">
          
          {/* Card 1: Books */}
          <Link to="/books" className="glass-card rounded-2xl p-4 sm:p-5 border border-indigo-500/20 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Literature Vault</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats.totalBooks}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{stats.currentlyReading} Reading</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.completedBooks} Done</span>
            </div>
          </Link>

          {/* Card 2: Wishlist */}
          <Link to="/wishlist" className="glass-card rounded-2xl p-4 sm:p-5 border border-rose-500/20 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Reading Wishlist</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats.wishlistCount}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Saved for later reading</p>
          </Link>

          {/* Card 3: Certificates */}
          <Link to="/certificates" className="glass-card rounded-2xl p-4 sm:p-5 border border-purple-500/20 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Credentials</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats.totalCertificates}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Verified certifications</p>
          </Link>

          {/* Card 4: Projects */}
          <Link to="/projects" className="glass-card rounded-2xl p-4 sm:p-5 border border-emerald-500/20 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Projects Showcase</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Code2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats.totalProjects}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{stats.activeProjects} Active</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{stats.completedProjects} Shipped</span>
            </div>
          </Link>

        </div>

        {/* Continue Reading Shelf (Prominent) */}
        <ContinueReadingSection
          books={stats.continueReadingList}
          onQuickUpdate={(book) => setSelectedBookForProgress(book)}
        />

        {/* Recently Added Books */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">Recent Books</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">Latest additions to your personal digital library</p>
            </div>
            <Link to="/books" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
              <span>View All Books</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {stats.recentBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onUpdateProgress={(b) => setSelectedBookForProgress(b)}
                onToggleWishlist={handleToggleWishlist}
                onEdit={() => {}}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        </div>

        {/* Recent Certificates & Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Certificates Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">Certifications</h2>
              <Link to="/certificates" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentCertificates.map((cert) => (
                <CertificateCard
                  key={cert.id}
                  certificate={cert}
                  viewMode="list"
                  onEdit={() => {}}
                  onDelete={handleDeleteCert}
                />
              ))}
            </div>
          </div>

          {/* Projects Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">Software Projects</h2>
              <Link to="/projects" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {stats.recentProjects.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  viewMode="list"
                  onEdit={() => {}}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Reading Progress Quick Modal */}
      <ReadingProgressModal
        isOpen={!!selectedBookForProgress}
        onClose={() => setSelectedBookForProgress(null)}
        book={selectedBookForProgress}
        onSaveProgress={handleUpdateProgress}
      />
    </div>
  );
};
