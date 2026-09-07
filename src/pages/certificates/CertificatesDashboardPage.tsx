import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldAlert, Calendar, ShieldCheck, Plus, LayoutGrid, BarChart2, ArrowRight } from 'lucide-react';
import { dashboardService, certificatesService } from '../../services';
import { CertificatesDashboardStats } from '../../types/dashboard.types';
import { Certificate } from '../../types/certificate.types';
import { CertificateCard } from '../../components/certificates/CertificateCard';
import { CertificateFormModal } from '../../components/certificates/CertificateFormModal';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

export const CertificatesDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<CertificatesDashboardStats | null>(null);
  const [recentCerts, setRecentCerts] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [certToEdit, setCertToEdit] = useState<Certificate | null>(null);
  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const [dashStats, certs] = await Promise.all([
        dashboardService.getCertificatesDashboardStats(),
        certificatesService.getCertificates({ sortBy: 'issueDate', sortOrder: 'desc' }),
      ]);
      setStats(dashStats);
      setRecentCerts(certs.slice(0, 4));
    } catch (err: any) {
      error('Failed to load certificates statistics', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('vault_updated', handleUpdate);
    return () => window.removeEventListener('vault_updated', handleUpdate);
  }, []);

  const handleSaveCert = async (data: any) => {
    try {
      if (certToEdit) {
        await certificatesService.updateCertificate(certToEdit.id, data);
        success('Certificate updated', data.name);
      } else {
        await certificatesService.createCertificate(data);
        success('Certificate added', data.name);
      }
      loadData();
    } catch (err: any) {
      error('Failed to save certificate', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this certificate record?')) return;
    try {
      await certificatesService.deleteCertificate(id);
      success('Certificate deleted');
      loadData();
    } catch (err: any) {
      error('Failed to delete', err.message);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 rounded-3xl" />
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
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.08] dark:border-white/[0.06]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
            Professional Credentials
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Certificates Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Verified qualifications, examinations, and license expiry monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-purple-500/20">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Certificates</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">{stats.totalCertificates}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-emerald-500/20">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Earned This Year</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">{stats.earnedThisYear}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-amber-500/20">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Expiring Soon (60d)</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">{stats.expiringSoon}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-indigo-500/20">
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Lifetime (No Expiry)</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">{stats.noExpiry}</p>
        </div>
      </div>

      {/* Visualizations: Category & Organization Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Breakdown */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-white/[0.07] space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Category Distribution</span>
          </h3>
          <div className="space-y-3">
            {stats.categoryDistribution.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{cat.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">{cat.count} certs</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${Math.round((cat.count / (stats.totalCertificates || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Organizations */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-white/[0.07] space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Issuing Organizations</span>
          </h3>
          <div className="space-y-3">
            {stats.organizationDistribution.map((org) => (
              <div key={org.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{org.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">{org.count} certs</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.round((org.count / (stats.totalCertificates || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Certificates Shelf */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Certificates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentCerts.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              onEdit={(c) => {
                setCertToEdit(c);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Bottom Browse All Certificates Action */}
      <div className="pt-6 pb-2 flex justify-center border-t border-black/[0.08] dark:border-white/[0.06]">
        <Link to="/certificates/all" className="w-full sm:w-auto">
          <Button
            variant="secondary"
            size="md"
            className="w-full sm:w-auto px-8 py-3 text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/5 hover:border-purple-500/40 transition-all"
            leftIcon={<LayoutGrid className="w-4 h-4 text-purple-400" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Browse All Certificates ({stats.totalCertificates})
          </Button>
        </Link>
      </div>

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
