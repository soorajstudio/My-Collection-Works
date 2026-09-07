import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code2, CheckCircle2, Clock, Plus, LayoutGrid, BarChart2, Cpu, ArrowRight } from 'lucide-react';
import { dashboardService, projectsService } from '../../services';
import { ProjectsDashboardStats } from '../../types/dashboard.types';
import { Project } from '../../types/project.types';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectFormModal } from '../../components/projects/ProjectFormModal';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

export const ProjectsDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<ProjectsDashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projToEdit, setProjToEdit] = useState<Project | null>(null);
  const { success, error } = useToast();

  const loadData = async () => {
    try {
      const [dashStats, projs] = await Promise.all([
        dashboardService.getProjectsDashboardStats(),
        projectsService.getProjects({ sortBy: 'recent', sortOrder: 'desc' }),
      ]);
      setStats(dashStats);
      setRecentProjects(projs.slice(0, 4));
    } catch (err: any) {
      error('Failed to load project metrics', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('vault_updated', handleUpdate);
    return () => window.removeEventListener('vault_updated', handleUpdate);
  }, []);

  const handleSaveProject = async (data: any) => {
    try {
      if (projToEdit) {
        await projectsService.updateProject(projToEdit.id, data);
        success('Project updated', data.name);
      } else {
        await projectsService.createProject(data);
        success('Project recorded', data.name);
      }
      loadData();
    } catch (err: any) {
      error('Failed to save project', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this project?')) return;
    try {
      await projectsService.deleteProject(id);
      success('Project deleted');
      loadData();
    } catch (err: any) {
      error('Failed to delete', err.message);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.08] dark:border-white/[0.06]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Software Engineering Portfolio
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Projects Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track builds, deployed systems, tech stack frequency, and repository status.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-emerald-500/20">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Projects</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">{stats.totalProjects}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-emerald-500/20">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Shipped / Completed</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">{stats.completedProjects}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-amber-500/20">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">In Active Build</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">{stats.inProgressProjects}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-indigo-500/20">
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Planned / Backlog</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">{stats.plannedProjects}</p>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Status Breakdown */}
        <div className="glass-card rounded-2xl p-6 border border-black/[0.06] dark:border-white/[0.07] space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-500" />
            <span>Status Distribution</span>
          </h3>
          <div className="space-y-3">
            {stats.statusDistribution.map((st) => (
              <div key={st.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{st.status}</span>
                  <span className="text-slate-500 dark:text-slate-400">{st.count} ({st.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      st.status === 'Completed' ? 'bg-emerald-500' : st.status === 'In Progress' ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${st.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Radar / Top Technologies */}
        <div className="glass-card rounded-2xl p-6 border border-black/[0.06] dark:border-white/[0.07] space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>Top Technologies Used</span>
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {stats.technologyCounts.map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 shadow-xs"
              >
                <span className="font-semibold">{tech.name}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                  {tech.count}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Projects Shelf */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Engineering Builds</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentProjects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              onEdit={(p) => {
                setProjToEdit(p);
                setIsAddModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {/* Bottom Browse All Projects Action */}
      <div className="pt-6 pb-2 flex justify-center border-t border-black/[0.06] dark:border-white/[0.06]">
        <Link to="/projects/all" className="w-full sm:w-auto">
          <Button
            variant="secondary"
            size="md"
            className="w-full sm:w-auto px-8 py-3 text-xs sm:text-sm font-bold shadow-sm hover:border-emerald-500/40 transition-all"
            leftIcon={<LayoutGrid className="w-4 h-4 text-emerald-500" />}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Browse All Projects ({stats.totalProjects})
          </Button>
        </Link>
      </div>

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
