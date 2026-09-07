import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { BookFormModal } from '../books/BookFormModal';
import { CertificateFormModal } from '../certificates/CertificateFormModal';
import { ProjectFormModal } from '../projects/ProjectFormModal';
import { booksService, certificatesService, projectsService } from '../../services';
import { useToast } from '../../context/ToastContext';

export const AppLayout: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeAddModal, setActiveAddModal] = useState<'book' | 'certificate' | 'project' | null>(null);
  const { success, error } = useToast();

  const handleCreateBook = async (data: any) => {
    try {
      await booksService.createBook(data);
      success('Book added successfully!', `${data.title} is now in your collection.`);
      window.dispatchEvent(new CustomEvent('vault_updated'));
    } catch (err: any) {
      error('Failed to add book', err.message);
    }
  };

  const handleCreateCertificate = async (data: any) => {
    try {
      await certificatesService.createCertificate(data);
      success('Certificate recorded!', `${data.name} has been archived.`);
      window.dispatchEvent(new CustomEvent('vault_updated'));
    } catch (err: any) {
      error('Failed to add certificate', err.message);
    }
  };

  const handleCreateProject = async (data: any) => {
    try {
      await projectsService.createProject(data);
      success('Project archived!', `${data.name} is now in your showcase.`);
      window.dispatchEvent(new CustomEvent('vault_updated'));
    } catch (err: any) {
      error('Failed to add project', err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#07090e] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAddModal={(type) => setActiveAddModal(type)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex-1 flex w-full">
        {/* Left Desktop Sidebar */}
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Global Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Quick Add Modals */}
      <BookFormModal
        isOpen={activeAddModal === 'book'}
        onClose={() => setActiveAddModal(null)}
        onSubmit={handleCreateBook}
      />

      <CertificateFormModal
        isOpen={activeAddModal === 'certificate'}
        onClose={() => setActiveAddModal(null)}
        onSubmit={handleCreateCertificate}
      />

      <ProjectFormModal
        isOpen={activeAddModal === 'project'}
        onClose={() => setActiveAddModal(null)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};
