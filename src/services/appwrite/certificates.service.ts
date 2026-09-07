import { ID, Query, Permission, Role } from 'appwrite';
import { databases, APPWRITE_CONFIG } from './client';
import { Certificate, CertificateFilterOptions } from '../../types/certificate.types';
import { getCertificateExpiryStatus } from '../../utils/formatters';

export const liveCertificatesService = {
  async getCertificates(filters?: CertificateFilterOptions): Promise<Certificate[]> {
    const queries: string[] = [Query.orderDesc('$createdAt'), Query.limit(100)];

    if (filters?.category && filters.category !== 'All') {
      queries.push(Query.equal('category', filters.category));
    }
    if (filters?.organization && filters.organization !== 'All') {
      queries.push(Query.equal('issuer', filters.organization));
    }

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.certificates,
      queries
    );

    let certs: Certificate[] = res.documents.map((doc) => ({
      id: doc.$id,
      ownerId: doc.ownerId,
      name: doc.title,
      issuingOrg: doc.issuer,
      issueDate: doc.issueDate,
      expiryDate: doc.expiryDate || null,
      hasNoExpiry: doc.hasNoExpiry ?? false,
      credentialId: doc.credentialId,
      description: doc.description,
      category: doc.category || 'Professional Skills',
      skills: doc.skills || [],
      verificationUrl: doc.verificationUrl,
      imageFileUrl: doc.fileType !== 'pdf' ? doc.fileUrl : undefined,
      imageFileKey: doc.fileType !== 'pdf' ? doc.fileKey : undefined,
      pdfFileUrl: doc.fileType === 'pdf' ? doc.fileUrl : undefined,
      pdfFileKey: doc.fileType === 'pdf' ? doc.fileKey : undefined,
      pdfFileName: doc.fileName,
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    }));

    // Client-side search and filters
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      certs = certs.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.issuingOrg.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filters?.year && filters.year !== 'All') {
      certs = certs.filter((c) => c.issueDate.startsWith(filters.year!));
    }

    if (filters?.expiryStatus && filters.expiryStatus !== 'all') {
      certs = certs.filter((c) => {
        const st = getCertificateExpiryStatus(c.hasNoExpiry, c.expiryDate).status;
        return st === filters.expiryStatus;
      });
    }

    if (filters?.sortBy) {
      certs.sort((a, b) => {
        if (filters.sortBy === 'name') {
          return (filters.sortOrder === 'desc' ? -1 : 1) * a.name.localeCompare(b.name);
        }
        if (filters.sortBy === 'organization') {
          return (filters.sortOrder === 'desc' ? -1 : 1) * a.issuingOrg.localeCompare(b.issuingOrg);
        }
        return (filters.sortOrder === 'asc' ? 1 : -1) * (new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
      });
    }

    return certs;
  },

  async getCertificateById(id: string): Promise<Certificate | null> {
    try {
      const doc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.certificates,
        id
      );

      return {
        id: doc.$id,
        ownerId: doc.ownerId,
        name: doc.title,
        issuingOrg: doc.issuer,
        issueDate: doc.issueDate,
        expiryDate: doc.expiryDate || null,
        hasNoExpiry: doc.hasNoExpiry ?? false,
        credentialId: doc.credentialId,
        description: doc.description,
        category: doc.category || 'Professional Skills',
        skills: doc.skills || [],
        verificationUrl: doc.verificationUrl,
        imageFileUrl: doc.fileType !== 'pdf' ? doc.fileUrl : undefined,
        imageFileKey: doc.fileType !== 'pdf' ? doc.fileKey : undefined,
        pdfFileUrl: doc.fileType === 'pdf' ? doc.fileUrl : undefined,
        pdfFileKey: doc.fileType === 'pdf' ? doc.fileKey : undefined,
        pdfFileName: doc.fileName,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      };
    } catch {
      return null;
    }
  },

  async createCertificate(data: Partial<Certificate>): Promise<Certificate> {
    const permissions = data.ownerId
      ? [
          Permission.read(Role.user(data.ownerId)),
          Permission.update(Role.user(data.ownerId)),
          Permission.delete(Role.user(data.ownerId)),
        ]
      : [];

    const fileUrl = data.pdfFileUrl || data.imageFileUrl || null;
    const fileKey = data.pdfFileKey || data.imageFileKey || null;
    const fileType = data.pdfFileUrl ? 'pdf' : 'image';

    const doc = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.certificates,
      ID.unique(),
      {
        ownerId: data.ownerId,
        title: data.name,
        issuer: data.issuingOrg,
        issueDate: data.issueDate,
        expiryDate: data.hasNoExpiry ? null : data.expiryDate,
        hasNoExpiry: !!data.hasNoExpiry,
        credentialId: data.credentialId || null,
        description: data.description || null,
        category: data.category || 'Professional Skills',
        skills: data.skills || [],
        verificationUrl: data.verificationUrl || null,
        fileUrl,
        fileKey,
        fileType,
        fileName: data.pdfFileName || null,
      },
      permissions
    );

    return {
      id: doc.$id,
      ownerId: doc.ownerId,
      name: doc.title,
      issuingOrg: doc.issuer,
      issueDate: doc.issueDate,
      expiryDate: doc.expiryDate,
      hasNoExpiry: doc.hasNoExpiry,
      credentialId: doc.credentialId,
      description: doc.description,
      category: doc.category,
      skills: doc.skills,
      verificationUrl: doc.verificationUrl,
      imageFileUrl: data.imageFileUrl,
      imageFileKey: data.imageFileKey,
      pdfFileUrl: data.pdfFileUrl,
      pdfFileKey: data.pdfFileKey,
      pdfFileName: data.pdfFileName,
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    };
  },

  async updateCertificate(id: string, data: Partial<Certificate>): Promise<Certificate> {
    const payload: any = {};
    if (data.name !== undefined) payload.title = data.name;
    if (data.issuingOrg !== undefined) payload.issuer = data.issuingOrg;
    if (data.issueDate !== undefined) payload.issueDate = data.issueDate;
    if (data.expiryDate !== undefined) payload.expiryDate = data.hasNoExpiry ? null : data.expiryDate;
    if (data.hasNoExpiry !== undefined) payload.hasNoExpiry = data.hasNoExpiry;
    if (data.credentialId !== undefined) payload.credentialId = data.credentialId;
    if (data.description !== undefined) payload.description = data.description;
    if (data.category !== undefined) payload.category = data.category;
    if (data.skills !== undefined) payload.skills = data.skills;
    if (data.verificationUrl !== undefined) payload.verificationUrl = data.verificationUrl;
    if (data.imageFileUrl !== undefined || data.pdfFileUrl !== undefined) {
      payload.fileUrl = data.pdfFileUrl || data.imageFileUrl;
      payload.fileKey = data.pdfFileKey || data.imageFileKey;
      payload.fileType = data.pdfFileUrl ? 'pdf' : 'image';
      payload.fileName = data.pdfFileName;
    }

    const doc = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.certificates,
      id,
      payload
    );

    const full = await this.getCertificateById(doc.$id);
    if (!full) throw new Error('Failed to retrieve updated certificate');
    return full;
  },

  async deleteCertificate(id: string): Promise<void> {
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.certificates,
      id
    );
  },
};
