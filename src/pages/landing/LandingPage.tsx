import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  Code2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cloud,
  Smartphone,
  CheckCircle2,
  Zap,
  Bookmark,
  Layers,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#07090e] text-slate-900 dark:text-white transition-colors duration-200">
      
      {/* Intro Navigation Bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-black/[0.06] dark:border-white/[0.08] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              My Library
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Enter Vault
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section of Intro */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 text-center px-4 sm:px-6">
        <div className="ambient-glow-indigo top-10 left-1/3 w-[600px] h-[350px] opacity-25" />
        <div className="ambient-glow-purple top-32 right-1/4 w-[500px] h-[300px] opacity-20" />

        <div className="relative max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>Welcome to Your Personal Digital Vault</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            The curated home for your <br />
            <span className="text-gradient-accent">intellect, credentials, and code</span>.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Move beyond generic spreadsheets and scattered bookmarks. My Library provides a dedicated, elegant digital sanctuary to catalog books, track reading chapters, store verified credentials, and archive software builds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to={isAuthenticated ? '/dashboard' : '/login'}>
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {isAuthenticated ? 'Open My Vault' : 'Explore Demo Vault'}
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="secondary">
                Learn How It Works
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-black/[0.06] dark:border-white/[0.06] space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Three Unified Pillars
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Everything important, in one refined system
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Engineered with intelligent data models tailored to the unique nature of each medium.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1: Books */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 space-y-4 border border-indigo-500/20">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Literature & Manga Vault</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Intelligently distinguishes between Manga/Manhwa/Comics (Chapter tracking) and Novels/General books (Page tracking). Dynamic Continue Reading shelf and wishlist.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Supports English, Malayalam & global languages</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Cloudflare R2 attached PDF reader</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Steppers with celebration confetti</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Certificates */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 space-y-4 border border-purple-500/20">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verified Credentials</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Maintain your official certifications, diplomas, and licenses with automated expiry alerts, verification links, and instant high-res document previews.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Dynamic 60-day expiry threshold warning</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Lifetime and credential ID cataloging</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Skills breakdown & yearly analytics</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3: Projects */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 space-y-4 border border-emerald-500/20">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Software Showcase</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Showcase your web applications, mobile apps, and systems engineering builds with technology radar tags, direct APK downloads, and live deployment links.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Cloudflare R2 APK and media streaming</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Status pipeline (Planned to Shipped)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Direct GitHub and Live Demo routing</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Architecture & Future Mobile Preparedness */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="rounded-3xl glass-panel p-8 sm:p-10 border border-indigo-500/20 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Smartphone className="w-4 h-4" />
            <span>Cross-Platform Backend Architecture</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Built for the Web today. Ready for Mobile tomorrow.
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            The website’s backend is completely platform-independent. Powered by <strong>Appwrite</strong> for document permissions and authentication, and <strong>Cloudflare R2</strong> for zero-egress file storage. A future Flutter or React Native mobile application can plug directly into the exact same database without backend alterations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-black/[0.06] dark:border-white/5">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Real-time Sync
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">WebSocket data synchronization across clients.</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-indigo-500" /> Cloudflare R2
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Presigned direct uploads with zero database bloat.</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Row-Level Security
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">User-isolated permissions at the database engine level.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.06] py-12 text-center text-xs text-slate-500 dark:text-slate-400 space-y-4">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          My Library · Personal Digital Collection Platform
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Dashboard
          </Link>
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign In
          </Link>
          <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Create Account
          </Link>
        </div>
      </footer>

    </div>
  );
};
