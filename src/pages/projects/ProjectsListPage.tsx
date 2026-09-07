import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Grid, List, Plus, Code2 } from 'lucide-react';
import { projectsService } from '../../services';
import { Project, ProjectStatus } from '../../types/project.types';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { ProjectFormModal } from '../../components/projects/ProjectFormModal';
import { PROJECT_CATEGORIES, PROJECT_STATUSES, POPULAR_TECHNOLOGIES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

export const ProjectsListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [status, setStatus] = useState<string>(searchParams.get('status') || 'All');
  const [technology, setTechnology] = useState(searchParams.get('tech') || 'All');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'status'>('recent');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projToEdit, setProjToEdit] = useState<Project | null>(null);

  const { success, error } = useToast();

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectsService.getProjects({
        search,
        category: category !== 'All' ? category : undefined,
        status: status !== 'All' ? (status as ProjectStatus) : undefined,
        technology: technology !== 'All' ? technology : undefined,
        sortBy,
        sortOrder: 'desc',
      });
      setProjects(data);
    } catch (err: any) {
      error('Failed to load projects', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [search, category, status, technology, sortBy]);

  const handleSaveProject = async (data: any) => {
    try {
      if (projToEdit) {
        await projectsService.updateProject(projToEdit.id, data);
        success('Project updated', data.name);
      } else {
        await projectsService.createProject(data);
        success('Project created', data.name);
      }
      loadProjects();
    } catch (err: any) {
      error('Error saving project', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectsService.deleteProject(id);
      success('Project deleted');
      loadProjects();
    } catch (err: any) {
      error('Failed to delete', err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.08] dark:border-white/[0.06]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Software Projects</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {projects.length} {projects.length === 1 ? 'build' : 'builds'} documented in your repository
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setProjToEdit(null);
              setIsAddModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Record Project
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 dark:border-white/[0.07] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search project name, stack, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            {PROJECT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            {PROJECT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
            className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Technologies</option>
            {POPULAR_TECHNOLOGIES.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <Skeleton key={n} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<Code2 className="w-8 h-8" />}
          title="No projects found"
          description={search ? `No projects match "${search}".` : 'Add your first engineering project or application build.'}
          actionLabel="Record Project"
          onAction={() => {
            setProjToEdit(null);
            setIsAddModalOpen(true);
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
          {projects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              viewMode="grid"
              onEdit={(p) => {
                setProjToEdit(p);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              viewMode="list"
              onEdit={(p) => {
                setProjToEdit(p);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ProjectFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setProjToEdit(null);
        }}
        initialData={projToEdit}
        onSubmit={handleSaveProject}
      />
    </div>
  );
};
