import { supabase } from './client';
import { Certificate, CertificateFilterOptions } from '../../types/certificate.types';

export const supabaseCertificatesService = {
  async getCertificates(filters?: CertificateFilterOptions): Promise<Certificate[]> {
    let query = supabase.from('certificates').select('*').order('created_at', { ascending: false });

    if (filters?.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }
    if (filters?.organization && filters.organization !== 'All') {
      query = query.eq('issuer', filters.organization);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getCertificates warning:', error.message);
      return [];
    }

    let certs: Certificate[] = (data || []).map((row: any) => ({
      id: row.id,
      ownerId: row.owner_id,
      name: row.title,
      issuingOrg: row.issuer,
      issueDate: row.issue_date,
      expiryDate: row.expiry_date || null,
      hasNoExpiry: !row.expiry_date,
      credentialId: row.credential_id,
      description: row.description,
      category: row.category || 'Professional Skills',
      skills: row.skills || [],
      verificationUrl: row.credential_url,
      imageFileUrl: row.file_url,
      imageFileKey: row.file_key,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      certs = certs.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.issuingOrg.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    return certs;
  },

  async getCertificateById(id: string): Promise<Certificate | null> {
    const { data: row, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !row) return null;

    return {
      id: row.id,
      ownerId: row.owner_id,
      name: row.title,
      issuingOrg: row.issuer,
      issueDate: row.issue_date,
      expiryDate: row.expiry_date || null,
      hasNoExpiry: !row.expiry_date,
      credentialId: row.credential_id,
      description: row.description,
      category: row.category || 'Professional Skills',
      skills: row.skills || [],
      verificationUrl: row.credential_url,
      imageFileUrl: row.file_url,
      imageFileKey: row.file_key,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  async createCertificate(data: Partial<Certificate>): Promise<Certificate> {
    const certId = `cert_${Date.now()}`;
    const payload = {
      id: certId,
      owner_id: data.ownerId || 'sooraj_user',
      title: data.name || 'Untitled Certificate',
      issuer: data.issuingOrg || 'Unknown Issuer',
      issue_date: data.issueDate || new Date().toISOString(),
      expiry_date: data.expiryDate || null,
      credential_id: data.credentialId || null,
      credential_url: data.verificationUrl || null,
      category: data.category || 'Professional Skills',
      file_url: data.imageFileUrl || data.pdfFileUrl || null,
      file_key: data.imageFileKey || data.pdfFileKey || null,
    };

    const { data: created, error } = await supabase
      .from('certificates')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: created.id,
      ownerId: created.owner_id,
      name: created.title,
      issuingOrg: created.issuer,
      issueDate: created.issue_date,
      expiryDate: created.expiry_date,
      hasNoExpiry: !created.expiry_date,
      credentialId: created.credential_id,
      category: created.category,
      skills: [],
      verificationUrl: created.credential_url,
      imageFileUrl: created.file_url,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    };
  },

  async updateCertificate(id: string, data: Partial<Certificate>): Promise<Certificate> {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (data.name !== undefined) payload.title = data.name;
    if (data.issuingOrg !== undefined) payload.issuer = data.issuingOrg;
    if (data.issueDate !== undefined) payload.issue_date = data.issueDate;
    if (data.expiryDate !== undefined) payload.expiry_date = data.hasNoExpiry ? null : data.expiryDate;
    if (data.credentialId !== undefined) payload.credential_id = data.credentialId;
    if (data.description !== undefined) payload.description = data.description;
    if (data.category !== undefined) payload.category = data.category;
    if (data.verificationUrl !== undefined) payload.credential_url = data.verificationUrl;
    if (data.imageFileUrl !== undefined || data.pdfFileUrl !== undefined) {
      payload.file_url = data.imageFileUrl || data.pdfFileUrl;
      payload.file_key = data.imageFileKey || data.pdfFileKey;
    }

    const { error } = await supabase.from('certificates').update(payload).eq('id', id);
    if (error) throw new Error(error.message);

    const updated = await this.getCertificateById(id);
    if (!updated) throw new Error('Failed to retrieve updated certificate');
    return updated;
  },

  async deleteCertificate(id: string): Promise<void> {
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
