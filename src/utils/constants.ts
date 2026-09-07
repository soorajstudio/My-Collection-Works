import { BookCategory, ReadingStatus } from '../types/book.types';
import { ProjectStatus } from '../types/project.types';

export const BOOK_CATEGORIES: BookCategory[] = [
  'Manga',
  'Manhwa',
  'Comics',
  'Novel',
  'Other Books',
];

export const BOOK_LANGUAGES: string[] = [
  'English',
  'Malayalam',
  'Japanese',
  'Korean',
  'Spanish',
  'French',
  'German',
  'Other',
];

export const READING_STATUSES: ReadingStatus[] = [
  'Not Started',
  'Reading',
  'Completed',
];

export const PROJECT_STATUSES: ProjectStatus[] = [
  'Planned',
  'In Progress',
  'Completed',
  'Archived',
];

export const CERTIFICATE_CATEGORIES: string[] = [
  'Fullstack & Web',
  'Cloud & DevOps',
  'Mobile Development',
  'AI & Machine Learning',
  'Database Systems',
  'Cybersecurity',
  'UI/UX Design',
  'Professional Skills',
];

export const PROJECT_CATEGORIES: string[] = [
  'Web Application',
  'Mobile Application',
  'Fullstack Platform',
  'Cloud Architecture',
  'API & Microservices',
  'Machine Learning / AI',
  'System & CLI Tool',
  'Open Source Library',
];

export const POPULAR_TECHNOLOGIES: string[] = [
  'React',
  'TypeScript',
  'Node.js',
  'Tailwind CSS',
  'Appwrite',
  'Cloudflare R2',
  'Flutter',
  'Python',
  'Next.js',
  'PostgreSQL',
  'Docker',
  'Go',
  'GraphQL',
  'Firebase',
  'Vue.js',
  'Rust',
];
