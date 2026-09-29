import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Download, Edit3, Trash2 } from 'lucide-react';
import { GitHubIcon } from '../common/GitHubIcon';
import { Project } from '../../types/project.types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface ProjectCardProps {
  project: Project;
  viewMode?: 'grid' | 'list';
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode = 'grid',
  onEdit,
  onDelete,
}) => {
  const statusVariant =
    project.status === 'Completed'
      ? 'emerald'
      : project.status === 'In Progress'
      ? 'amber'
      : project.status === 'Planned'
      ? 'indigo'
      : 'slate';

  const isApp =
    project.projectType === 'app' ||
    project.category === 'Mobile Application' ||
    Boolean(project.apkFileUrl || project.apkFileName);

  const displayIcon =
    project.appIconUrl ||
    (project.screenshotUrls && project.screenshotUrls.length > 0 ? project.screenshotUrls[0] : null) ||
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=120&auto=format&fit=crop&q=80';

  if (viewMode === 'list') {
    return (
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link to={`/projects/${project.id}`} className="shrink-0">
            <img
              src={displayIcon}
              alt={project.name}
              className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md group-hover:scale-105 transition-transform"
            />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <Badge variant={statusVariant}>{project.status}</Badge>
              {isApp ? (
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                  📱 Mobile App
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  🌐 Website
                </span>
              )}
              {project.apkFileName && (
                <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  APK
                </span>
              )}
              {project.screenshotUrls && project.screenshotUrls.length > 0 && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  {project.screenshotUrls.length} {project.screenshotUrls.length === 1 ? 'image' : 'images'}
                </span>
              )}
            </div>
            <Link to={`/projects/${project.id}`}>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors truncate">
                {project.name}
              </h3>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{project.shortDescription}</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              title="GitHub Repository"
            >
              <GitHubIcon className="w-4 h-4" />
            </a>
          )}
          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800/60 transition-colors"
              title="Visit Website"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
          {(project.apkFileUrl || project.downloadUrl) && (
            <a
              href={project.apkFileUrl || project.downloadUrl}
              download={project.apkFileName || `${project.name}.apk`}
              className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800/60 transition-colors"
              title={`Download APK (${project.apkFileName || 'app-release.apk'})`}
            >
              <Download className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-slate-200/80 dark:border-white/[0.07] hover:border-emerald-500/40 transition-all duration-300 p-5">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <img
            src={displayIcon}
            alt=""
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-md group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={statusVariant}>{project.status}</Badge>
            {isApp ? (
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                📱 App
              </span>
            ) : (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                🌐 Website
              </span>
            )}
            {project.apkFileName && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                APK
              </span>
            )}
          </div>
        </div>

        <Link to={`/projects/${project.id}`} className="block">
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors line-clamp-1">
            {project.name}
          </h3>
        </Link>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
          {project.shortDescription}
        </p>

        {project.screenshotUrls && project.screenshotUrls.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 overflow-hidden">
            {project.screenshotUrls.slice(0, 3).map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="preview"
                className="w-14 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
              />
            ))}
            {project.screenshotUrls.length > 3 && (
              <span className="text-[10px] font-semibold text-slate-500 px-1.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md">
                +{project.screenshotUrls.length - 3}
              </span>
            )}
          </div>
        )}

        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {project.technologies.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className="text-[10px] text-slate-500 self-center font-medium">
                +{project.technologies.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-white/5 mt-4">
        <Link to={`/projects/${project.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full text-xs">
            Inspect Build
          </Button>
        </Link>
        <div className="flex items-center gap-1">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              title="GitHub Repository"
            >
              <GitHubIcon className="w-4 h-4" />
            </a>
          )}
          {project.liveDemoUrl && (
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
              title="Visit Website"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
          {(project.apkFileUrl || project.downloadUrl) && (
            <a
              href={project.apkFileUrl || project.downloadUrl}
              download={project.apkFileName || `${project.name}.apk`}
              className="p-1.5 rounded-lg text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              title={`Download APK (${project.apkFileName || 'app-release.apk'})`}
            >
              <Download className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
