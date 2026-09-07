export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) {
      if (diffHours < 1) return 'Just now';
      return `${diffHours}h ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return formatDate(dateString);
  } catch {
    return '';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export interface ExpiryStatus {
  status: 'valid' | 'expiringSoon' | 'expired' | 'noExpiry';
  label: string;
  daysRemaining?: number;
}

export function getCertificateExpiryStatus(
  hasNoExpiry: boolean,
  expiryDate?: string | null
): ExpiryStatus {
  if (hasNoExpiry || !expiryDate) {
    return { status: 'noExpiry', label: 'Lifetime' };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'expired', label: 'Expired', daysRemaining: diffDays };
  }
  if (diffDays <= 60) {
    return {
      status: 'expiringSoon',
      label: `Expires in ${diffDays}d`,
      daysRemaining: diffDays,
    };
  }
  return { status: 'valid', label: 'Active', daysRemaining: diffDays };
}

export function calculateProgressPercentage(
  category: string,
  current?: number | null,
  total?: number | null
): number | null {
  if (current == null || total == null || total <= 0) return null;
  const pct = Math.round((current / total) * 100);
  return Math.min(Math.max(pct, 0), 100);
}
