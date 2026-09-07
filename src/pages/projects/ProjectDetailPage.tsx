import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Globe,
  Download,
  Calendar,
  CheckCircle2,
  Edit3,
  Trash2,
  Code2,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { GitHubIcon } from '../../components/common/GitHubIcon';
import { projectsService } from '../../services';
import { Project } from '../../types/project.types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { ProjectFormModal } from '../../components/projects/ProjectFormModal';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { success, error } = useToast();

  const loadProject = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await projectsService.getProjectById(id);
      if (!data) {
        navigate('/projects');
        return;
      }
      setProject(data);
    } catch (err: any) {
      error('Failed to load project', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleDelete = async () => {
    if (!project || !confirm('Permanently delete this project record?')) return;
    try {
      await projectsService.deleteProject(project.id);
      success('Project deleted');
      navigate('/projects');
    } catch (err: any) {
      error('Failed to delete', err.message);
    }
  };

  const handleSaveEdit = async (data: any) => {
    if (!project) return;
    try {
      const updated = await projectsService.updateProject(project.id, data);
      setProject(updated);
      success('Project updated', updated.name);
    } catch (err: any) {
      error('Failed to update', err.message);
    }
  };

  if (isLoading || !project) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const statusVariant =
    project.status === 'Completed'
      ? 'emerald'
      : project.status === 'In Progress'
      ? 'amber'
      : project.status === 'Planned'
      ? 'indigo'
      : 'slate';

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Top Header Bar: Back Navigation & Top-Right Actions */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-black/[0.06] dark:border-white/[0.06]">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        {/* Top Right Corner Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit3 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />}
            className="text-xs font-semibold shadow-sm"
          >
            Edit Project
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

      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 space-y-8">
        
        {/* Header with App Icon and Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-black/[0.08] dark:border-white/5">
          <div className="flex items-start gap-4">
            <img
              src={project.appIconUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=160&auto=format&fit=crop&q=80'}
              alt={project.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shadow-xl"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant} size="md">{project.status}</Badge>
                <Badge variant="cyan" size="md">{project.category}</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {project.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                {project.shortDescription}
              </p>
            </div>
          </div>

          {/* External Links */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {project.liveDemoUrl && (
              <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="sm" leftIcon={<Globe className="w-4 h-4" />}>
                  Live Demo
                </Button>
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm" leftIcon={<GitHubIcon className="w-4 h-4" />}>
                  GitHub
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* APK Release Asset Box (Cloudflare R2) */}
        {project.apkFileName && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-slate-50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Android Package Release (APK)</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">{project.apkFileName}</p>
              </div>
            </div>
            {project.apkFileUrl || project.downloadUrl ? (
              <a
                href={project.apkFileUrl || project.downloadUrl}
                download={project.apkFileName}
                className="shrink-0"
              >
                <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}>
                  Download APK
                </Button>
              </a>
            ) : null}
          </div>
        )}

        {/* Technologies Stack */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Technologies & Stack</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Key Features List */}
        {project.features && project.features.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Key Features & Deliverables
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {project.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Description */}
        {project.detailedDescription && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Architecture & System Overview
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {project.detailedDescription}
            </p>
          </div>
        )}

        {/* Dates & Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Project Initiated</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{formatDate(project.startDate)}</p>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Completion Date</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {project.completionDate ? formatDate(project.completionDate) : 'Ongoing active development'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-black/[0.08] dark:border-white/5 text-xs text-slate-500 dark:text-slate-400">
          Added to vault {formatDate(project.createdAt)}
        </div>

      </div>

      <ProjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={project}
        onSubmit={handleSaveEdit}
      />
    </div>
  );
};
