import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Grid, List, Plus, Award } from 'lucide-react';
import { certificatesService } from '../../services';
import { Certificate, CertificateFilterOptions } from '../../types/certificate.types';
import { CertificateCard } from '../../components/certificates/CertificateCard';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { CertificateFormModal } from '../../components/certificates/CertificateFormModal';
import { CERTIFICATE_CATEGORIES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

export const CertificatesListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [expiryStatus, setExpiryStatus] = useState<string>(searchParams.get('expiry') || 'all');
  const [sortBy, setSortBy] = useState<'issueDate' | 'name' | 'organization'>('issueDate');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [certToEdit, setCertToEdit] = useState<Certificate | null>(null);

  const { success, error } = useToast();

  const loadCertificates = async () => {
    setIsLoading(true);
    try {
      const data = await certificatesService.getCertificates({
        search,
        category: category !== 'All' ? category : undefined,
        expiryStatus: expiryStatus !== 'all' ? (expiryStatus as any) : undefined,
        sortBy,
        sortOrder: 'desc',
      });
      setCertificates(data);
    } catch (err: any) {
      error('Failed to load certificates', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, [search, category, expiryStatus, sortBy]);

  const handleSaveCert = async (data: any) => {
    try {
      if (certToEdit) {
        await certificatesService.updateCertificate(certToEdit.id, data);
        success('Certificate updated', data.name);
      } else {
        await certificatesService.createCertificate(data);
        success('Certificate created', data.name);
      }
      loadCertificates();
    } catch (err: any) {
      error('Error saving', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await certificatesService.deleteCertificate(id);
      success('Certificate deleted');
      loadCertificates();
    } catch (err: any) {
      error('Error deleting', err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.08] dark:border-white/[0.06]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Certificates & Licenses</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {certificates.length} {certificates.length === 1 ? 'credential' : 'credentials'} in vault
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setCertToEdit(null);
              setIsAddModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Certificate
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/[0.07]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search cert name, issuer, skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            {CERTIFICATE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={expiryStatus}
            onChange={(e) => setExpiryStatus(e.target.value)}
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Expiry States</option>
            <option value="valid">Active (Valid)</option>
            <option value="expiringSoon">Expiring Soon (&lt; 60 days)</option>
            <option value="noExpiry">Lifetime (No Expiry)</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="issueDate">Most Recent Issue Date</option>
            <option value="name">Name (A-Z)</option>
            <option value="organization">Organization (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <Skeleton key={n} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={<Award className="w-8 h-8" />}
          title="No certificates found"
          description={search ? `No credentials match "${search}".` : 'Add your first professional certificate or license.'}
          actionLabel="Add Certificate"
          onAction={() => {
            setCertToEdit(null);
            setIsAddModalOpen(true);
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              viewMode="grid"
              onEdit={(c) => {
                setCertToEdit(c);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              viewMode="list"
              onEdit={(c) => {
                setCertToEdit(c);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CertificateFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setCertToEdit(null);
        }}
        initialData={certToEdit}
        onSubmit={handleSaveCert}
      />
    </div>
  );
};
