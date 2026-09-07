import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from '../../utils/constants';
import { Project, ProjectStatus } from '../../types/project.types';
import { storageService } from '../../services';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Project | null;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [category, setCategory] = useState(PROJECT_CATEGORIES[0]);
  const [status, setStatus] = useState<ProjectStatus>('In Progress');
  const [technologiesInput, setTechnologiesInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [appIconUrl, setAppIconUrl] = useState('');
  const [appIconKey, setAppIconKey] = useState('');
  const [apkFileName, setApkFileName] = useState('');
  const [apkFileKey, setApkFileKey] = useState('');
  const [videoEmbedUrl, setVideoEmbedUrl] = useState('');

  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isUploadingApk, setIsUploadingApk] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setShortDescription(initialData.shortDescription);
      setDetailedDescription(initialData.detailedDescription || '');
      setCategory(initialData.category || PROJECT_CATEGORIES[0]);
      setStatus(initialData.status);
      setTechnologiesInput(initialData.technologies?.join(', ') || '');
      setFeaturesInput(initialData.features?.join('\n') || '');
      setStartDate(initialData.startDate || '');
      setCompletionDate(initialData.completionDate || '');
      setGithubUrl(initialData.githubUrl || '');
      setLiveDemoUrl(initialData.liveDemoUrl || '');
      setDownloadUrl(initialData.downloadUrl || '');
      setAppIconUrl(initialData.appIconUrl || '');
      setAppIconKey(initialData.appIconKey || '');
      setApkFileName(initialData.apkFileName || '');
      setApkFileKey(initialData.apkFileKey || '');
      setVideoEmbedUrl(initialData.videoEmbedUrl || '');
    } else {
      setName('');
      setShortDescription('');
      setDetailedDescription('');
      setCategory(PROJECT_CATEGORIES[0]);
      setStatus('In Progress');
      setTechnologiesInput('');
      setFeaturesInput('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setCompletionDate('');
      setGithubUrl('');
      setLiveDemoUrl('');
      setDownloadUrl('');
      setAppIconUrl('');
      setAppIconKey('');
      setApkFileName('');
      setApkFileKey('');
      setVideoEmbedUrl('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingIcon(true);
    setError('');
    try {
      const res = await storageService.uploadFile(file, {
        category: 'projects/icons',
        onProgress: setUploadProgress,
      });
      setAppIconUrl(res.fileUrl);
      setAppIconKey(res.fileKey);
    } catch (err: any) {
      setError(err.message || 'Failed to upload icon.');
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const handleApkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingApk(true);
    setError('');
    try {
      const res = await storageService.uploadFile(file, {
        category: 'projects/apks',
        onProgress: setUploadProgress,
      });
      setApkFileName(res.fileName);
      setApkFileKey(res.fileKey);
    } catch (err: any) {
      setError(err.message || 'Failed to upload APK file.');
    } finally {
      setIsUploadingApk(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortDescription.trim()) {
      setError('Project Name and Short Description are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const techArray = technologiesInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const featuresArray = featuresInput
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      await onSubmit({
        name: name.trim(),
        shortDescription: shortDescription.trim(),
        detailedDescription: detailedDescription.trim() || undefined,
        category,
        status,
        technologies: techArray,
        features: featuresArray,
        startDate: startDate || undefined,
        completionDate: status === 'Completed' ? completionDate || new Date().toISOString().split('T')[0] : undefined,
        githubUrl: githubUrl.trim() || undefined,
        liveDemoUrl: liveDemoUrl.trim() || undefined,
        downloadUrl: downloadUrl.trim() || undefined,
        appIconUrl: appIconUrl || undefined,
        appIconKey: appIconKey || undefined,
        apkFileName: apkFileName || undefined,
        apkFileKey: apkFileKey || undefined,
        videoEmbedUrl: videoEmbedUrl.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Project Record' : 'Record New Project'}
      description="Add a software application, mobile app, or engineering build to your portfolio vault."
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
            label="Project Name *"
            placeholder="e.g. PulseFlow, AetherMart"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {PROJECT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Short Elevator Pitch / Description *"
          placeholder="Brief 1-sentence summary of the project's purpose..."
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          required
        />

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
              {PROJECT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Technologies (comma-separated)"
            placeholder="e.g. React, TypeScript, Appwrite, R2"
            value={technologiesInput}
            onChange={(e) => setTechnologiesInput(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="GitHub Repository"
            placeholder="https://github.com/..."
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
          <Input
            label="Live Demo URL"
            placeholder="https://app.demo.dev"
            value={liveDemoUrl}
            onChange={(e) => setLiveDemoUrl(e.target.value)}
          />
          <Input
            label="Direct Download Link"
            placeholder="https://releases..."
            value={downloadUrl}
            onChange={(e) => setDownloadUrl(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Key Features (One per line)
          </label>
          <textarea
            rows={2}
            value={featuresInput}
            onChange={(e) => setFeaturesInput(e.target.value)}
            placeholder="Real-time multi-cursor sync&#10;End-to-end encryption&#10;Cloudflare R2 streaming"
            className="w-full bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Detailed Architecture & Overview
          </label>
          <textarea
            rows={3}
            value={detailedDescription}
            onChange={(e) => setDetailedDescription(e.target.value)}
            placeholder="Deep technical breakdown, challenges solved, system design..."
            className="w-full bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Media & APK Upload to Cloudflare R2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Project App Icon (R2)
            </label>
            <div className="flex items-center gap-3">
              {appIconUrl ? (
                <img
                  src={appIconUrl}
                  alt="App icon"
                  className="w-12 h-12 object-cover rounded-xl border border-slate-300 dark:border-slate-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  id="proj-icon-input"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleIconUpload}
                  className="hidden"
                />
                <label
                  htmlFor="proj-icon-input"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploadingIcon ? `Uploading (${uploadProgress}%)` : appIconUrl ? 'Change Icon' : 'Upload Icon'}</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Attach APK Build (R2)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="file"
                  id="proj-apk-input"
                  accept=".apk,application/vnd.android.package-archive"
                  onChange={handleApkUpload}
                  className="hidden"
                />
                <label
                  htmlFor="proj-apk-input"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploadingApk ? `Uploading (${uploadProgress}%)` : apkFileName ? 'Replace APK' : 'Upload APK'}</span>
                </label>
                {apkFileName && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 truncate">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{apkFileName}</span>
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
            {initialData ? 'Save Changes' : 'Record Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
