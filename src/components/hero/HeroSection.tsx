import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  BookOpen,
  Award,
  Code2,
  Sparkles,
  ArrowRight,
  Flame,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface HeroSectionProps {
  stats: {
    totalBooks: number;
    totalCertificates: number;
    totalProjects: number;
    currentlyReading: number;
  };
  onExplore: () => void;
  onQuickAdd: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ stats, onExplore, onQuickAdd }) => {
  const [activeTab, setActiveTab] = useState<'reading' | 'cert' | 'project'>('reading');
  const { scrollY } = useScroll();
  const yOffset = useTransform(scrollY, [0, 400], [0, 35]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.98]);

  return (
    <div className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 border-b border-black/[0.06] dark:border-white/[0.06]">
      {/* Soft Ambient Glows */}
      <div className="ambient-glow-indigo top-0 left-1/3 w-[500px] h-[300px] opacity-20 dark:opacity-30" />
      <div className="ambient-glow-purple top-24 right-1/4 w-[400px] h-[300px] opacity-15 dark:opacity-20" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Top Centered Header & Headline */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          
          {/* Tag Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Personal Digital Archive · Platform Independent</span>
          </motion.div>

          {/* Clean Editorial Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]"
          >
            Your intellect, qualifications, <br className="hidden sm:inline" />
            and code in <span className="text-gradient-accent">one sanctuary</span>.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            A carefully crafted personal digital collection management system. Track your reading chapters, manage verified certifications, and showcase software engineering builds with cloud storage.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <Button onClick={onExplore} size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Archive
            </Button>
            <Button
              onClick={onQuickAdd}
              variant="secondary"
              size="md"
              leftIcon={<Compass className="w-4 h-4 text-indigo-500" />}
            >
              Add Record +
            </Button>
          </motion.div>

        </div>

        {/* Live Metrics Ticker Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mt-10 pt-8 border-t border-black/[0.06] dark:border-white/[0.06]"
        >
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-black/[0.05] dark:border-white/[0.06] text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stats.totalBooks}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-center gap-1.5 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Books in Vault
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-black/[0.05] dark:border-white/[0.06] text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-500 tracking-tight">{stats.currentlyReading}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-center gap-1.5 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Active Reading
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-black/[0.05] dark:border-white/[0.06] text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 tracking-tight">{stats.totalCertificates}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-center gap-1.5 font-medium">
              <Award className="w-3.5 h-3.5 text-purple-500" /> Certificates
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-black/[0.05] dark:border-white/[0.06] text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">{stats.totalProjects}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-center gap-1.5 font-medium">
              <Code2 className="w-3.5 h-3.5 text-emerald-500" /> Projects
            </p>
          </div>
        </motion.div>

        {/* Minimal Luxury Interactive Vault Console */}
        <motion.div
          style={{ y: yOffset, scale }}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-4xl mx-auto mt-8 rounded-3xl p-1 bg-gradient-to-b from-indigo-500/20 via-black/[0.04] to-transparent dark:from-indigo-500/30 dark:via-white/[0.04] shadow-2xl shadow-indigo-500/5"
        >
          <div className="rounded-[22px] glass-panel bg-white dark:bg-slate-900/60 p-5 sm:p-7 border border-slate-200/80 dark:border-white/10 space-y-6">
            
            {/* Console Tabs */}
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Live Vault Showcase
                </span>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  onClick={() => setActiveTab('reading')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeTab === 'reading'
                      ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Reading Active
                </button>
                <button
                  onClick={() => setActiveTab('cert')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeTab === 'cert'
                      ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Credentials
                </button>
                <button
                  onClick={() => setActiveTab('project')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeTab === 'project'
                      ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Software Build
                </button>
              </div>
            </div>

            {/* Tab 1: Reading Showcase */}
            {activeTab === 'reading' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200&auto=format&fit=crop&q=80"
                    alt="One Piece"
                    className="w-16 h-22 sm:w-20 sm:h-28 rounded-xl object-cover shadow-lg shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="purple">Manga</Badge>
                      <span className="text-xs font-bold text-amber-500">97% Completed</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      One Piece
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Chapter 1085 of 1120 · by Eiichiro Oda
                    </p>
                    <div className="w-48 sm:w-64 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full w-[97%]" />
                    </div>
                  </div>
                </div>

                <Button onClick={onExplore} size="sm" variant="secondary" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Resume Reading
                </Button>
              </div>
            )}

            {/* Tab 2: Certificate Showcase */}
            {activeTab === 'cert' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                    <Award className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="emerald">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Active Credential
                      </Badge>
                      <span className="text-xs text-slate-400">AWS-SAA-8392104</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      AWS Certified Solutions Architect
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Amazon Web Services · Cloud Architecture & Infrastructure
                    </p>
                  </div>
                </div>

                <Button onClick={onExplore} size="sm" variant="secondary" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Verify Certificate
                </Button>
              </div>
            )}

            {/* Tab 3: Project Showcase */}
            {activeTab === 'project' && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80"
                    alt="PulseFlow"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-black/10 dark:border-white/10 shadow-lg shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="amber">In Progress</Badge>
                      <Badge variant="cyan">Web Application</Badge>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      PulseFlow — Real-Time Hub
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      React · TypeScript · Appwrite · Cloudflare R2
                    </p>
                  </div>
                </div>

                <Button onClick={onExplore} size="sm" variant="secondary" rightIcon={<ChevronRight className="w-4 h-4" />}>
                  Inspect Architecture
                </Button>
              </div>
            )}

          </div>
        </motion.div>

      </div>
    </div>
  );
};
