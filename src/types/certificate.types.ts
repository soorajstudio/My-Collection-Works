export interface Certificate {
  id: string;
  ownerId: string;
  name: string;
  issuingOrg: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate?: string | null; // YYYY-MM-DD
  hasNoExpiry: boolean;
  credentialId?: string;
  description?: string;
  category: string;
  skills: string[];
  verificationUrl?: string;
  imageFileKey?: string;
  imageFileUrl?: string;
  pdfFileKey?: string;
  pdfFileName?: string;
  pdfFileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateFilterOptions {
  search?: string;
  category?: string;
  organization?: string;
  year?: string;
  expiryStatus?: 'all' | 'valid' | 'expiringSoon' | 'expired' | 'noExpiry';
  sortBy?: 'issueDate' | 'name' | 'organization';
  sortOrder?: 'asc' | 'desc';
}
