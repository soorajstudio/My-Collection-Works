import { supabase } from './client';
import { Project, ProjectFilterOptions } from '../../types/project.types';

function mapProjectFromRow(doc: any): Project {
  const isMobile =
    doc.category === 'Mobile Application' ||
    doc.category === 'Mobile App' ||
    Boolean(doc.live_url && (doc.live_url.includes('.apk') || doc.live_url.includes('#apk=')));

  const projectType: 'website' | 'app' = isMobile ? 'app' : 'website';

  let apkFileUrl: string | undefined = undefined;
  let apkFileName: string | undefined = undefined;
  let liveDemoUrl: string | undefined = doc.live_url || undefined;

  if (isMobile && doc.live_url) {
    if (doc.live_url.includes('#apk=')) {
      const parts = doc.live_url.split('#apk=');
      apkFileUrl = parts[0];
      apkFileName = decodeURIComponent(parts[1]);
      liveDemoUrl = undefined;
    } else if (doc.live_url.endsWith('.apk')) {
      apkFileUrl = doc.live_url;
      apkFileName = doc.live_url.split('/').pop()?.split('?')[0] || 'app-release.apk';
      liveDemoUrl = undefined;
    }
  }

  return {
    id: doc.id,
    ownerId: doc.owner_id,
    name: doc.title,
    shortDescription: doc.tagline || '',
    detailedDescription: doc.description,
    category: doc.category || (isMobile ? 'Mobile Application' : 'Web Application'),
    projectType,
    technologies: doc.tech_stack || [],
    features: doc.features || [],
    status: doc.status || 'Planned',
    githubUrl: doc.github_url || undefined,
    liveDemoUrl,
    apkFileUrl,
    apkFileName,
    appIconUrl: doc.icon_url || undefined,
    screenshotUrls: Array.isArray(doc.screenshots) ? doc.screenshots : [],
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  };
}

export const supabaseProjectsService = {
  async getProjects(filters?: ProjectFilterOptions): Promise<Project[]> {
    let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'All') {
      query = query.eq('status', filters.status);
    }
    if (filters?.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase getProjects warning:', error.message);
      return [];
    }

    let projects: Project[] = (data || []).map(mapProjectFromRow);

    if (filters?.projectType && filters.projectType !== 'all') {
      projects = projects.filter((p) => p.projectType === filters.projectType);
    }

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
    return mapProjectFromRow(doc);
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const projectId = `proj_${Date.now()}`;
    const isApp = data.projectType === 'app' || data.category === 'Mobile Application';
    const effectiveCategory = isApp ? 'Mobile Application' : (data.category || 'Web Application');

    let effectiveLiveUrl = data.liveDemoUrl || null;
    if (isApp && data.apkFileUrl) {
      effectiveLiveUrl = data.apkFileName
        ? `${data.apkFileUrl}#apk=${encodeURIComponent(data.apkFileName)}`
        : data.apkFileUrl;
    }

    const payload = {
      id: projectId,
      owner_id: data.ownerId || 'sooraj_user',
      title: data.name || 'Untitled Project',
      tagline: data.shortDescription || '',
      description: data.detailedDescription || '',
      category: effectiveCategory,
      status: data.status || 'Planned',
      github_url: data.githubUrl || null,
      live_url: effectiveLiveUrl,
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
    return mapProjectFromRow(created);
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const isApp = data.projectType === 'app' || data.category === 'Mobile Application';
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) payload.title = data.name;
    if (data.shortDescription !== undefined) payload.tagline = data.shortDescription;
    if (data.detailedDescription !== undefined) payload.description = data.detailedDescription;
    if (data.category !== undefined) payload.category = data.category;
    else if (data.projectType !== undefined) {
      payload.category = isApp ? 'Mobile Application' : 'Web Application';
    }
    if (data.status !== undefined) payload.status = data.status;
    if (data.technologies !== undefined) payload.tech_stack = data.technologies;
    if (data.githubUrl !== undefined) payload.github_url = data.githubUrl;

    if (isApp && data.apkFileUrl !== undefined) {
      payload.live_url = data.apkFileUrl
        ? (data.apkFileName ? `${data.apkFileUrl}#apk=${encodeURIComponent(data.apkFileName)}` : data.apkFileUrl)
        : null;
    } else if (data.liveDemoUrl !== undefined) {
      payload.live_url = data.liveDemoUrl;
    }

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
