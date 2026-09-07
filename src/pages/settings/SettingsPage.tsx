import React from 'react';
import { Database, Cloud, Shield, Smartphone, ExternalLink, CheckCircle2, Sparkles } from 'lucide-react';
import { APPWRITE_CONFIG } from '../../services/appwrite/client';
import { Badge } from '../../components/common/Badge';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      <div className="pb-6 border-b border-black/[0.08] dark:border-white/[0.06]">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System & Architecture</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Backend services, database collections, storage topology, and mobile sync preparedness.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Driver Mode Banner */}
        <div className="glass-panel rounded-3xl p-6 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Driver Status</span>
              <Badge variant={APPWRITE_CONFIG.isMock ? 'amber' : 'emerald'}>
                {APPWRITE_CONFIG.isMock ? 'Mock Fallback / Demo Driver' : 'Live Appwrite Backend'}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {APPWRITE_CONFIG.isMock
                ? 'Running with local reactive data persistence. Insert production keys into .env to switch to live Appwrite & R2.'
                : 'Connected to live Appwrite instance.'}
            </p>
          </div>
        </div>

        {/* Backend & Database Topology */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-black/[0.06] dark:border-white/5">
            <Database className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Appwrite Database Architecture</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-slate-500 uppercase font-semibold text-[10px]">Database ID</span>
              <p className="font-mono text-slate-800 dark:text-slate-200">{APPWRITE_CONFIG.databaseId}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-slate-500 uppercase font-semibold text-[10px]">Endpoint</span>
              <p className="font-mono text-slate-800 dark:text-slate-200">{import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Configured Collections</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {Object.entries(APPWRITE_CONFIG.collections).map(([key, colId]) => (
                <div key={key} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/5 font-mono text-slate-700 dark:text-slate-300">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{key}</span>: {colId}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cloudflare R2 Storage Topology */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-black/[0.06] dark:border-white/5">
            <Cloud className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Cloudflare R2 Object Storage Architecture</h3>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All binary files (Covers, PDFs, APKs, Videos, and Screenshots) are stored in Cloudflare R2 without consuming database document bandwidth. Credentials remain strictly isolated from frontend bundles.
          </p>

          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <p className="text-purple-600 dark:text-purple-400 font-semibold">Logical S3 Folder Hierarchy:</p>
            <p className="text-slate-600 dark:text-slate-400">/&#123;userId&#125;/books/covers/ · /&#123;userId&#125;/books/pdfs/</p>
            <p className="text-slate-600 dark:text-slate-400">/&#123;userId&#125;/certificates/images/ · /&#123;userId&#125;/certificates/pdfs/</p>
            <p className="text-slate-600 dark:text-slate-400">/&#123;userId&#125;/projects/icons/ · /&#123;userId&#125;/projects/apks/</p>
          </div>
        </div>

        {/* Future Mobile Application Bridge */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Future Mobile Application Read-Out</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The platform architecture guarantees zero breaking changes when connecting an iOS/Android mobile client (Flutter or React Native). Both web and mobile consume identical Appwrite accounts, user-isolated document permissions, and R2 presigned upload paths.
          </p>
        </div>

      </div>
    </div>
  );
};
