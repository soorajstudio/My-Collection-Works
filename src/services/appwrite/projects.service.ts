import { ID, Query, Permission, Role } from 'appwrite';
import { databases, APPWRITE_CONFIG } from './client';
import { Project, ProjectFilterOptions } from '../../types/project.types';

export const liveProjectsService = {
  async getProjects(filters?: ProjectFilterOptions): Promise<Project[]> {
    const queries: string[] = [Query.orderDesc('$createdAt'), Query.limit(100)];

    if (filters?.status && filters.status !== 'All') {
      queries.push(Query.equal('status', filters.status));
    }

    const res = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.projects,
      queries
    );

    let projects: Project[] = res.documents.map((doc) => ({
      id: doc.$id,
      ownerId: doc.ownerId,
      name: doc.title,
      shortDescription: doc.tagline || '',
      detailedDescription: doc.description,
      category: 'Web Application',
      technologies: doc.technologies || [],
      features: [],
      status: doc.status,
      githubUrl: doc.githubUrl,
      liveDemoUrl: doc.liveDemoUrl,
      appIconUrl: doc.iconUrl,
      appIconKey: doc.iconKey,
      apkFileUrl: doc.apkUrl,
      apkFileKey: doc.apkKey,
      apkFileName: doc.apkFileName,
      screenshotUrls: doc.screenshots || [],
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
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

    if (filters?.technology && filters.technology !== 'All') {
      projects = projects.filter((p) => p.technologies.includes(filters.technology!));
    }

    if (filters?.sortBy) {
      projects.sort((a, b) => {
        if (filters.sortBy === 'name') {
          return (filters.sortOrder === 'desc' ? -1 : 1) * a.name.localeCompare(b.name);
        }
        if (filters.sortBy === 'status') {
          return (filters.sortOrder === 'desc' ? -1 : 1) * a.status.localeCompare(b.status);
        }
        return (filters.sortOrder === 'asc' ? 1 : -1) * (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
    }

    return projects;
  },

  async getProjectById(id: string): Promise<Project | null> {
    try {
      const doc = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.projects,
        id
      );

      return {
        id: doc.$id,
        ownerId: doc.ownerId,
        name: doc.title,
        shortDescription: doc.tagline || '',
        detailedDescription: doc.description,
        category: 'Web Application',
        technologies: doc.technologies || [],
        features: [],
        status: doc.status,
        githubUrl: doc.githubUrl,
        liveDemoUrl: doc.liveDemoUrl,
        appIconUrl: doc.iconUrl,
        appIconKey: doc.iconKey,
        apkFileUrl: doc.apkUrl,
        apkFileKey: doc.apkKey,
        apkFileName: doc.apkFileName,
        screenshotUrls: doc.screenshots || [],
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      };
    } catch {
      return null;
    }
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const permissions = data.ownerId
      ? [
          Permission.read(Role.user(data.ownerId)),
          Permission.update(Role.user(data.ownerId)),
          Permission.delete(Role.user(data.ownerId)),
        ]
      : [];

    const doc = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.projects,
      ID.unique(),
      {
        ownerId: data.ownerId,
        title: data.name,
        tagline: data.shortDescription,
        description: data.detailedDescription || null,
        status: data.status || 'Planned',
        technologies: data.technologies || [],
        githubUrl: data.githubUrl || null,
        liveDemoUrl: data.liveDemoUrl || null,
        iconUrl: data.appIconUrl || null,
        iconKey: data.appIconKey || null,
        apkUrl: data.apkFileUrl || null,
        apkKey: data.apkFileKey || null,
        apkFileName: data.apkFileName || null,
        screenshots: data.screenshotUrls || [],
      },
      permissions
    );

    return {
      id: doc.$id,
      ownerId: doc.ownerId,
      name: doc.title,
      shortDescription: doc.tagline || '',
      detailedDescription: doc.description,
      category: 'Web Application',
      technologies: doc.technologies || [],
      features: [],
      status: doc.status,
      githubUrl: doc.githubUrl,
      liveDemoUrl: doc.liveDemoUrl,
      appIconUrl: doc.iconUrl,
      appIconKey: doc.iconKey,
      apkFileUrl: doc.apkUrl,
      apkFileKey: doc.apkKey,
      apkFileName: doc.apkFileName,
      screenshotUrls: doc.screenshots || [],
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    };
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const payload: any = {};
    if (data.name !== undefined) payload.title = data.name;
    if (data.shortDescription !== undefined) payload.tagline = data.shortDescription;
    if (data.detailedDescription !== undefined) payload.description = data.detailedDescription;
    if (data.status !== undefined) payload.status = data.status;
    if (data.technologies !== undefined) payload.technologies = data.technologies;
    if (data.githubUrl !== undefined) payload.githubUrl = data.githubUrl;
    if (data.liveDemoUrl !== undefined) payload.liveDemoUrl = data.liveDemoUrl;
    if (data.appIconUrl !== undefined) {
      payload.iconUrl = data.appIconUrl;
      payload.iconKey = data.appIconKey;
    }
    if (data.apkFileUrl !== undefined) {
      payload.apkUrl = data.apkFileUrl;
      payload.apkKey = data.apkFileKey;
      payload.apkFileName = data.apkFileName;
    }
    if (data.screenshotUrls !== undefined) {
      payload.screenshots = data.screenshotUrls;
    }

    const doc = await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.projects,
      id,
      payload
    );

    const full = await this.getProjectById(doc.$id);
    if (!full) throw new Error('Failed to retrieve updated project');
    return full;
  },

  async deleteProject(id: string): Promise<void> {
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.projects,
      id
    );
  },
};
