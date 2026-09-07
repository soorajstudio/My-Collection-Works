import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ExternalLink, FileText, Calendar, Edit3, Trash2 } from 'lucide-react';
import { Certificate } from '../../types/certificate.types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatDate, getCertificateExpiryStatus } from '../../utils/formatters';

interface CertificateCardProps {
  certificate: Certificate;
  viewMode?: 'grid' | 'list';
  onEdit: (cert: Certificate) => void;
  onDelete: (id: string) => void;
  onPreviewPdf?: (cert: Certificate) => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  viewMode = 'grid',
  onEdit,
  onDelete,
  onPreviewPdf,
}) => {
  const expiry = getCertificateExpiryStatus(certificate.hasNoExpiry, certificate.expiryDate);

  const expiryVariant =
    expiry.status === 'valid'
      ? 'emerald'
      : expiry.status === 'expiringSoon'
      ? 'amber'
      : expiry.status === 'expired'
      ? 'rose'
      : 'purple';

  if (viewMode === 'list') {
    return (
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group border border-slate-200/80 dark:border-white/[0.07]">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link to={`/certificates/${certificate.id}`} className="shrink-0">
            <img
              src={certificate.imageFileUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&auto=format&fit=crop&q=80'}
              alt={certificate.name}
              className="w-16 h-12 sm:w-20 sm:h-14 object-cover rounded-xl border border-slate-200 dark:border-white/10 shadow-md group-hover:scale-105 transition-transform"
            />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <Badge variant="purple">{certificate.category}</Badge>
              <Badge variant={expiryVariant}>{expiry.label}</Badge>
            </div>
            <Link to={`/certificates/${certificate.id}`}>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors truncate">
                {certificate.name}
              </h3>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
              {certificate.issuingOrg} · Issued {formatDate(certificate.issueDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
          {certificate.verificationUrl && (
            <a
              href={certificate.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              title="Verify Credential"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {certificate.pdfFileUrl && onPreviewPdf && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPreviewPdf(certificate)}
              leftIcon={<FileText className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />}
            >
              PDF
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-slate-200/80 dark:border-white/[0.07] hover:border-purple-500/30 transition-all duration-300">
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
          <img
            src={certificate.imageFileUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80'}
            alt={certificate.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Badge variant="purple">{certificate.category}</Badge>
            <Badge variant={expiryVariant}>{expiry.label}</Badge>
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-[11px] text-slate-300 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-purple-400" />
              <span>Issued {formatDate(certificate.issueDate)}</span>
            </p>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <Link to={`/certificates/${certificate.id}`} className="block">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors line-clamp-1">
              {certificate.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{certificate.issuingOrg}</p>

          {certificate.skills && certificate.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {certificate.skills.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 text-[10px] rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50"
                >
                  {s}
                </span>
              ))}
              {certificate.skills.length > 3 && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 self-center">
                  +{certificate.skills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 pt-0 border-t border-slate-100 dark:border-white/5 mt-2">
        <Link to={`/certificates/${certificate.id}`} className="block w-full">
          <Button variant="secondary" size="sm" className="w-full text-xs">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};
