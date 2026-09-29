import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { PROJECT_STATUSES } from '../../utils/constants';
import { Project, ProjectStatus } from '../../types/project.types';
import { storageService } from '../../services';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Globe,
  Smartphone,
  Image as ImageIcon,
  X,
  ExternalLink,
  FileCode,
} from 'lucide-react';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Project | null;
  initialType?: 'website' | 'app';
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialType = 'website',
}) => {
  const [projectType, setProjectType] = useState<'website' | 'app'>(initialType);
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Completed');
  const [technologiesInput, setTechnologiesInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [appIconUrl, setAppIconUrl] = useState('');
  const [appIconKey, setAppIconKey] = useState('');
  const [apkFileName, setApkFileName] = useState('');
  const [apkFileUrl, setApkFileUrl] = useState('');
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);

  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [iconUploadProgress, setIconUploadProgress] = useState(0);
  const [isUploadingApk, setIsUploadingApk] = useState(false);
  const [apkUploadProgress, setApkUploadProgress] = useState(0);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      const isApp =
        initialData.projectType === 'app' ||
        initialData.category === 'Mobile Application' ||
        Boolean(initialData.apkFileUrl || initialData.apkFileName);

      setProjectType(isApp ? 'app' : 'website');
      setName(initialData.name);
      setShortDescription(initialData.shortDescription);
      setDetailedDescription(initialData.detailedDescription || '');
      setStatus(initialData.status || 'Completed');
      setTechnologiesInput(initialData.technologies?.join(', ') || '');
      setGithubUrl(initialData.githubUrl || '');
      setLiveDemoUrl(initialData.liveDemoUrl || '');
      setAppIconUrl(initialData.appIconUrl || '');
      setAppIconKey(initialData.appIconKey || '');
      setApkFileName(initialData.apkFileName || '');
      setApkFileUrl(initialData.apkFileUrl || '');
      setScreenshotUrls(initialData.screenshotUrls || []);
    } else {
      setProjectType(initialType);
      setName('');
      setShortDescription('');
      setDetailedDescription('');
      setStatus('Completed');
      setTechnologiesInput(initialType === 'app' ? 'React Native, Android' : 'React, Tailwind CSS');
      setGithubUrl('');
      setLiveDemoUrl('');
      setAppIconUrl('');
      setAppIconKey('');
      setApkFileName('');
      setApkFileUrl('');
      setScreenshotUrls([]);
    }
    setError('');
  }, [initialData, initialType, isOpen]);

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingIcon(true);
    setIconUploadProgress(0);
    setError('');
    try {
      const res = await storageService.uploadFile(file, {
        category: 'projects/icons',
        onProgress: (pct) => setIconUploadProgress(pct),
      });
      setAppIconUrl(res.fileUrl);
      setAppIconKey(res.fileKey);
      setIconUploadProgress(100);
    } catch (err: any) {
      setError(err.message || 'Failed to upload icon.');
    } finally {
      setIsUploadingIcon(false);
      e.target.value = '';
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploadingImages(true);
    setImageUploadProgress(0);
    setError('');

    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const res = await storageService.uploadFile(file, {
          category: 'projects/screenshots',
          onProgress: (pct) => {
            const overall = Math.round(((i + pct / 100) / files.length) * 100);
            setImageUploadProgress(overall);
          },
        });
        newUrls.push(res.fileUrl);
      } catch (err: any) {
        setError(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    setScreenshotUrls((prev) => [...prev, ...newUrls]);
    setImageUploadProgress(100);
    setIsUploadingImages(false);
    e.target.value = '';
  };

  const removeScreenshot = (indexToRemove: number) => {
    setScreenshotUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleApkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingApk(true);
    setApkUploadProgress(0);
    setError('');
    try {
      const res = await storageService.uploadFile(file, {
        category: 'projects/apks',
        onProgress: (pct) => setApkUploadProgress(pct),
      });
      setApkFileName(res.fileName || file.name);
      setApkFileUrl(res.fileUrl);
      setApkUploadProgress(100);
    } catch (err: any) {
      setError(err.message || 'Failed to upload APK file.');
    } finally {
      setIsUploadingApk(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(`${projectType === 'website' ? 'Website Heading' : 'App Name'} is required.`);
      return;
    }
    if (!shortDescription.trim()) {
      setError('Description is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const techArray = technologiesInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSubmit({
        name: name.trim(),
        projectType,
        category: projectType === 'website' ? 'Web Application' : 'Mobile Application',
        shortDescription: shortDescription.trim(),
        detailedDescription: detailedDescription.trim() || undefined,
        status,
        technologies: techArray,
        githubUrl: githubUrl.trim() || undefined,
        liveDemoUrl: projectType === 'website' ? liveDemoUrl.trim() || undefined : undefined,
        apkFileUrl: projectType === 'app' ? apkFileUrl.trim() || undefined : undefined,
        apkFileName: projectType === 'app' ? apkFileName.trim() || undefined : undefined,
        appIconUrl: appIconUrl || undefined,
        appIconKey: appIconKey || undefined,
        screenshotUrls: screenshotUrls.length > 0 ? screenshotUrls : undefined,
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
      title={initialData ? `Edit ${projectType === 'website' ? 'Website' : 'Mobile App'}` : 'Add Website or Mobile App'}
      description="Document and showcase websites and mobile applications created by you."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Type Switcher: Website vs Mobile App */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Select Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setProjectType('website')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                projectType === 'website'
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${projectType === 'website' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Website</p>
                <p className="text-[11px] opacity-80">Portfolio, web app, or host site</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setProjectType('app')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                projectType === 'app'
                  ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${projectType === 'app' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Mobile App</p>
                <p className="text-[11px] opacity-80">Android app & APK release build</p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Heading (Title) */}
        <div>
          <Input
            label={projectType === 'website' ? 'Website Heading / Title *' : 'App Heading / Name *'}
            placeholder={projectType === 'website' ? 'e.g. My Modern Portfolio, AetherMart' : 'e.g. PulseFlow Mobile, School Zone Alert'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* 3. Description */}
        <div className="space-y-3">
          <Input
            label="Brief Description / Pitch *"
            placeholder="Short 1-2 sentence summary of what this website or app does..."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Detailed Overview <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              placeholder="Features, how it works, tech details, or architecture..."
              className="w-full bg-white dark:bg-slate-900/70 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 4. Images Upload Section (Screenshots & Previews) */}
        <div className="space-y-2.5 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                <span>{projectType === 'website' ? 'Website Screenshots & Images' : 'App Screenshots & Images'}</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload one or multiple preview images to showcase your {projectType === 'website' ? 'website' : 'app'}.
              </p>
            </div>

            <label
              htmlFor="screenshot-multi-upload"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Add Images</span>
            </label>
            <input
              type="file"
              id="screenshot-multi-upload"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImagesUpload}
              className="hidden"
            />
          </div>

          {/* Upload Progress */}
          {isUploadingImages && (
            <div className="space-y-1 py-1">
              <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                <span>Uploading screenshots to Supabase Storage...</span>
                <span>{imageUploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-150"
                  style={{ width: `${imageUploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Thumbnails Gallery */}
          {screenshotUrls.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {screenshotUrls.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-white/10 bg-slate-950">
                  <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors opacity-90 group-hover:opacity-100"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-black/60 text-white">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-5 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
              No images uploaded yet. Click <strong>"Add Images"</strong> to upload screenshots.
            </div>
          )}
        </div>

        {/* 5. Link / File Section: Host Link (for Website) vs APK File (for App) */}
        {projectType === 'website' ? (
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Live Host Link <span className="text-indigo-600 dark:text-indigo-400 font-normal lowercase">(optional)</span>
              </label>
            </div>
            <Input
              placeholder="https://my-website.com, https://my-portfolio.vercel.app"
              value={liveDemoUrl}
              onChange={(e) => setLiveDemoUrl(e.target.value)}
            />
            <p className="text-[11px] text-slate-500">
              Where your website is hosted. You can leave this blank if it's currently offline.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                App APK File <span className="text-emerald-600 dark:text-emerald-400 font-normal lowercase">(optional)</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="file"
                id="proj-apk-upload"
                accept=".apk,application/vnd.android.package-archive"
                onChange={handleApkUpload}
                className="hidden"
              />
              <label
                htmlFor="proj-apk-upload"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isUploadingApk ? `Uploading (${apkUploadProgress}%)` : apkFileName ? 'Replace APK File' : 'Upload APK Build (.apk)'}</span>
              </label>

              {apkFileName && !isUploadingApk && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">{apkFileName}</span>
                </div>
              )}
            </div>

            {isUploadingApk && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Uploading APK to Supabase Storage...</span>
                  <span>{apkUploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-150"
                    style={{ width: `${apkUploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500">
              Upload your Android build directly so visitors can download and test it. This is not mandatory.
            </p>
          </div>
        )}

        {/* 6. Extra Optional Information (Icon, Tech, Repo) */}
        <div className="pt-2 border-t border-slate-200/80 dark:border-white/5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Technologies Used (optional)"
              placeholder="e.g. React, Next.js, Node.js"
              value={technologiesInput}
              onChange={(e) => setTechnologiesInput(e.target.value)}
            />

            <Input
              label="GitHub Repository (optional)"
              placeholder="https://github.com/..."
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* Optional Icon */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Icon / Logo <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="flex items-center gap-3">
                {appIconUrl ? (
                  <img src={appIconUrl} alt="Icon" className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-700" />
                ) : null}
                <input
                  type="file"
                  id="proj-icon-opt-upload"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="hidden"
                />
                <label
                  htmlFor="proj-icon-opt-upload"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors border border-slate-300 dark:border-slate-700"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploadingIcon ? `Uploading (${iconUploadProgress}%)` : appIconUrl ? 'Change Icon' : 'Upload Icon'}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.06] dark:border-white/5">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            {initialData ? 'Save Changes' : projectType === 'website' ? 'Record Website' : 'Record Mobile App'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
