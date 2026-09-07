import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { CERTIFICATE_CATEGORIES } from '../../utils/constants';
import { Certificate } from '../../types/certificate.types';
import { storageService } from '../../services';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface CertificateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Certificate | null;
}

export const CertificateFormModal: React.FC<CertificateFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [issuingOrg, setIssuingOrg] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [hasNoExpiry, setHasNoExpiry] = useState(false);
  const [credentialId, setCredentialId] = useState('');
  const [category, setCategory] = useState(CERTIFICATE_CATEGORIES[0]);
  const [skillsInput, setSkillsInput] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [description, setDescription] = useState('');
  const [imageFileUrl, setImageFileUrl] = useState('');
  const [imageFileKey, setImageFileKey] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfFileKey, setPdfFileKey] = useState('');

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setIssuingOrg(initialData.issuingOrg);
      setIssueDate(initialData.issueDate);
      setExpiryDate(initialData.expiryDate || '');
      setHasNoExpiry(initialData.hasNoExpiry);
      setCredentialId(initialData.credentialId || '');
      setCategory(initialData.category || CERTIFICATE_CATEGORIES[0]);
      setSkillsInput(initialData.skills?.join(', ') || '');
      setVerificationUrl(initialData.verificationUrl || '');
      setDescription(initialData.description || '');
      setImageFileUrl(initialData.imageFileUrl || '');
      setImageFileKey(initialData.imageFileKey || '');
      setPdfFileName(initialData.pdfFileName || '');
      setPdfFileKey(initialData.pdfFileKey || '');
    } else {
      setName('');
      setIssuingOrg('');
      setIssueDate(new Date().toISOString().split('T')[0]);
      setExpiryDate('');
      setHasNoExpiry(false);
      setCredentialId('');
      setCategory(CERTIFICATE_CATEGORIES[0]);
      setSkillsInput('');
      setVerificationUrl('');
      setDescription('');
      setImageFileUrl('');
      setImageFileKey('');
      setPdfFileName('');
      setPdfFileKey('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setImageUploadProgress(0);
    setError('');
    try {
      const res = await storageService.uploadFile(file, {
        category: 'certificates/images',
        onProgress: (pct) => setImageUploadProgress(pct),
      });
      setImageFileUrl(res.fileUrl);
      setImageFileKey(res.fileKey);
      setImageUploadProgress(100);
    } catch (err: any) {
      setError(err.message || 'Failed to upload certificate preview image.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPdf(true);
    setPdfUploadProgress(0);
    setError('');
    try {
      const res = await storageService.uploadFile(file, {
        category: 'certificates/pdfs',
        onProgress: (pct) => setPdfUploadProgress(pct),
      });
      setPdfFileName(res.fileName);
      setPdfFileKey(res.fileKey);
      setPdfUploadProgress(100);
    } catch (err: any) {
      setError(err.message || 'Failed to upload certificate PDF.');
    } finally {
      setIsUploadingPdf(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !issuingOrg.trim() || !issueDate) {
      setError('Certificate Name, Issuing Organization, and Issue Date are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await onSubmit({
        name: name.trim(),
        issuingOrg: issuingOrg.trim(),
        issueDate,
        expiryDate: hasNoExpiry ? null : expiryDate || null,
        hasNoExpiry,
        credentialId: credentialId.trim() || undefined,
        category,
        skills: skillsArray,
        verificationUrl: verificationUrl.trim() || undefined,
        description: description.trim() || undefined,
        imageFileUrl: imageFileUrl || undefined,
        imageFileKey: imageFileKey || undefined,
        pdfFileName: pdfFileName || undefined,
        pdfFileKey: pdfFileKey || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save certificate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Certificate' : 'Add New Certificate'}
      description="Record a verified credential or certification into your archive."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Certificate Name *"
            placeholder="e.g. AWS Solutions Architect"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Issuing Organization *"
            placeholder="e.g. Amazon Web Services, Meta, Coursera"
            value={issuingOrg}
            onChange={(e) => setIssuingOrg(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Issue Date *"
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Expiry Date
              </label>
              <label className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasNoExpiry}
                  onChange={(e) => setHasNoExpiry(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                />
                <span>No Expiry</span>
              </label>
            </div>
            <Input
              type="date"
              disabled={hasNoExpiry}
              value={hasNoExpiry ? '' : expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={hasNoExpiry ? 'opacity-40 cursor-not-allowed' : ''}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {CERTIFICATE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Credential ID"
            placeholder="e.g. AWS-SAA-109281"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
          />
        </div>

        <Input
          label="Verification URL"
          placeholder="https://example.com/verify/..."
          value={verificationUrl}
          onChange={(e) => setVerificationUrl(e.target.value)}
        />

        <Input
          label="Skills & Tags (comma-separated)"
          placeholder="e.g. React, Cloud Architecture, Python, Security"
          value={skillsInput}
          onChange={(e) => setSkillsInput(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Description / Overview
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Topics covered, exam scores, or details..."
            className="w-full bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Media Uploads */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Certificate Image Preview (R2)
            </label>
            <div className="flex items-center gap-3">
              {imageFileUrl ? (
                <img
                  src={imageFileUrl}
                  alt="Cert preview"
                  className="w-14 h-12 object-cover rounded-lg border border-slate-300 dark:border-slate-700"
                />
              ) : (
                <div className="w-14 h-12 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  id="cert-image-input"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="cert-image-input"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploadingImage ? `Uploading (${imageUploadProgress}%)` : imageFileUrl ? 'Change Image' : 'Upload Image'}</span>
                </label>
                {isUploadingImage && (
                  <div className="w-full space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      <span>Uploading preview image...</span>
                      <span>{imageUploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-150 ease-out"
                        style={{ width: `${imageUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Certificate PDF (R2)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-12 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  id="cert-pdf-input"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <label
                  htmlFor="cert-pdf-input"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploadingPdf ? `Uploading (${pdfUploadProgress}%)` : pdfFileName ? 'Replace PDF' : 'Upload PDF'}</span>
                </label>
                {isUploadingPdf && (
                  <div className="w-full space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      <span>Uploading PDF document...</span>
                      <span>{pdfUploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-150 ease-out"
                        style={{ width: `${pdfUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {pdfFileName && !isUploadingPdf && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 truncate">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{pdfFileName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.06] dark:border-white/5">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            {initialData ? 'Save Changes' : 'Record Certificate'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
