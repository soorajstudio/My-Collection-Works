import { supabase } from './client';
import { Project, ProjectFilterOptions } from '../../types/project.types';

export const supabaseProjectsService = {
  async getProjects(filters?: ProjectFilterOptions): Promise<Project[]> {
    let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getProjects warning:', error.message);
      return [];
    }

    let projects: Project[] = (data || []).map((doc: any) => ({
      id: doc.id,
      ownerId: doc.owner_id,
      name: doc.title,
      shortDescription: doc.tagline || '',
      detailedDescription: doc.description,
      category: doc.category || 'Web Application',
      technologies: doc.tech_stack || [],
      features: [],
      status: doc.status || 'Planned',
      githubUrl: doc.github_url,
      liveDemoUrl: doc.live_url,
      appIconUrl: doc.icon_url,
      screenshotUrls: doc.screenshots || [],
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    }));

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      projects = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.technologies.some((t) => t.toLowerCase().includes(q))
      );
    }

    return projects;
  },

  async getProjectById(id: string): Promise<Project | null> {
    const { data: doc, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !doc) return null;

    return {
      id: doc.id,
      ownerId: doc.owner_id,
      name: doc.title,
      shortDescription: doc.tagline || '',
      detailedDescription: doc.description,
      category: doc.category || 'Web Application',
      technologies: doc.tech_stack || [],
      features: [],
      status: doc.status || 'Planned',
      githubUrl: doc.github_url,
      liveDemoUrl: doc.live_url,
      appIconUrl: doc.icon_url,
      screenshotUrls: doc.screenshots || [],
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    };
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const projectId = `proj_${Date.now()}`;
    const payload = {
      id: projectId,
      owner_id: data.ownerId || 'sooraj_user',
      title: data.name || 'Untitled Project',
      tagline: data.shortDescription || '',
      description: data.detailedDescription || '',
      category: data.category || 'Web Application',
      status: data.status || 'Planned',
      github_url: data.githubUrl || null,
      live_url: data.liveDemoUrl || null,
      icon_url: data.appIconUrl || null,
      tech_stack: data.technologies || [],
      screenshots: data.screenshotUrls || [],
    };

    const { data: created, error } = await supabase
      .from('projects')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      id: created.id,
      ownerId: created.owner_id,
      name: created.title,
      shortDescription: created.tagline,
      detailedDescription: created.description,
      category: created.category,
      technologies: created.tech_stack || [],
      features: [],
      status: created.status,
      githubUrl: created.github_url,
      liveDemoUrl: created.live_url,
      appIconUrl: created.icon_url,
      screenshotUrls: created.screenshots || [],
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    };
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (data.name !== undefined) payload.title = data.name;
    if (data.shortDescription !== undefined) payload.tagline = data.shortDescription;
    if (data.detailedDescription !== undefined) payload.description = data.detailedDescription;
    if (data.category !== undefined) payload.category = data.category;
    if (data.status !== undefined) payload.status = data.status;
    if (data.technologies !== undefined) payload.tech_stack = data.technologies;
    if (data.githubUrl !== undefined) payload.github_url = data.githubUrl;
    if (data.liveDemoUrl !== undefined) payload.live_url = data.liveDemoUrl;
    if (data.appIconUrl !== undefined) payload.icon_url = data.appIconUrl;
    if (data.screenshotUrls !== undefined) payload.screenshots = data.screenshotUrls;

    const { error } = await supabase.from('projects').update(payload).eq('id', id);
    if (error) throw new Error(error.message);

    const updated = await this.getProjectById(id);
    if (!updated) throw new Error('Failed to retrieve updated project');
    return updated;
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
