import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Calendar,
  ExternalLink,
  FileText,
  ShieldCheck,
  Edit3,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { certificatesService } from '../../services';
import { Certificate } from '../../types/certificate.types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { CertificateFormModal } from '../../components/certificates/CertificateFormModal';
import { formatDate, getCertificateExpiryStatus } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const CertificateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { success, error } = useToast();

  const loadCert = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await certificatesService.getCertificateById(id);
      if (!data) {
        navigate('/certificates');
        return;
      }
      setCert(data);
    } catch (err: any) {
      error('Failed to load certificate', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCert();
  }, [id]);

  const handleDelete = async () => {
    if (!cert || !confirm('Permanently delete this certificate record?')) return;
    try {
      await certificatesService.deleteCertificate(cert.id);
      success('Certificate deleted');
      navigate('/certificates');
    } catch (err: any) {
      error('Failed to delete', err.message);
    }
  };

  const handleSaveEdit = async (data: any) => {
    if (!cert) return;
    try {
      const updated = await certificatesService.updateCertificate(cert.id, data);
      setCert(updated);
      success('Certificate updated', updated.name);
    } catch (err: any) {
      error('Failed to update', err.message);
    }
  };

  if (isLoading || !cert) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const expiry = getCertificateExpiryStatus(cert.hasNoExpiry, cert.expiryDate);

  const expiryVariant =
    expiry.status === 'valid'
      ? 'emerald'
      : expiry.status === 'expiringSoon'
      ? 'amber'
      : expiry.status === 'expired'
      ? 'rose'
      : 'purple';

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      {/* Top Header Bar: Back Navigation & Top-Right Actions */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-black/[0.06] dark:border-white/[0.06]">
        <Link
          to="/certificates"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Certificates</span>
        </Link>

        {/* Top Right Corner Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit3 className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />}
            className="text-xs font-semibold shadow-sm"
          >
            Edit Certificate
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            className="text-xs font-semibold"
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 space-y-6">
        
        {/* Certificate Preview Image */}
        {cert.imageFileUrl && (
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl">
            <img
              src={cert.imageFileUrl}
              alt={cert.name}
              className="w-full h-full object-contain bg-slate-100 dark:bg-slate-950"
            />
          </div>
        )}

        {/* Header & Meta */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="purple" size="md">{cert.category}</Badge>
            <Badge variant={expiryVariant} size="md">{expiry.label}</Badge>
            {cert.credentialId && (
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                ID: {cert.credentialId}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {cert.name}
          </h1>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
            Issued by {cert.issuingOrg}
          </p>
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Issue Date</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{formatDate(cert.issueDate)}</p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Expiry Date</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {cert.hasNoExpiry ? 'No Expiry (Lifetime Credential)' : formatDate(cert.expiryDate)}
            </p>
          </div>
        </div>

        {/* Skills Tag Cloud */}
        {cert.skills && cert.skills.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Verified Skills & Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {cert.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {cert.description && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Credential Description
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {cert.description}
            </p>
          </div>
        )}

        {/* External verification & PDF Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-black/[0.08] dark:border-white/5">
          {cert.verificationUrl && (
            <a
              href={cert.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="primary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                Verify with Issuer
              </Button>
            </a>
          )}

          {cert.pdfFileUrl && (
            <a
              href={cert.pdfFileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary" size="sm" leftIcon={<FileText className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />}>
                View Certificate PDF (R2)
              </Button>
            </a>
          )}
        </div>

      </div>

      <CertificateFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={cert}
        onSubmit={handleSaveEdit}
      />
    </div>
  );
};
