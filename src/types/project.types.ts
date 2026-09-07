export type ProjectStatus = 'Planned' | 'In Progress' | 'Completed' | 'Archived';

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  shortDescription: string;
  detailedDescription?: string;
  category: string;
  technologies: string[];
  features?: string[];
  status: ProjectStatus;
  startDate?: string | null;
  completionDate?: string | null;
  githubUrl?: string;
  liveDemoUrl?: string;
  downloadUrl?: string;
  tags?: string[];
  appIconKey?: string;
  appIconUrl?: string;
  screenshotKeys?: string[];
  screenshotUrls?: string[];
  apkFileKey?: string;
  apkFileName?: string;
  apkFileUrl?: string;
  videoFileKey?: string;
  videoFileUrl?: string;
  videoEmbedUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFilterOptions {
  search?: string;
  category?: string;
  technology?: string;
  status?: ProjectStatus | 'All';
  sortBy?: 'recent' | 'name' | 'status';
  sortOrder?: 'asc' | 'desc';
}
