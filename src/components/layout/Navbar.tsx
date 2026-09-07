import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, BookOpen, Award, Code2, LogOut, User, Settings, Sparkles, Menu, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { ThemeToggle } from '../common/ThemeToggle';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenAddModal: (type: 'book' | 'certificate' | 'project') => void;
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenAddModal,
  onToggleMobileSidebar,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-black/[0.08] dark:border-white/[0.07] backdrop-blur-xl">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
              <div className="w-full h-full bg-indigo-950/20 dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors">
                My Library
              </span>
              <span className="text-[10px] font-medium tracking-widest text-slate-500 uppercase -mt-1">
                Digital Archive
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Trigger */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300 transition-all group shadow-inner"
          >
            <div className="flex items-center gap-2.5 text-xs">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors" />
              <span>Search books, certificates, projects...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-md">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Add & User Account */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Intro Link */}
          <Link to="/intro">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-xs">
              Intro
            </Button>
          </Link>

          {/* Theme Mode Switcher Toggle */}
          <ThemeToggle />

          {/* Mobile Search Icon */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Add Menu */}
          {isAuthenticated && (
            <div className="relative">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddMenu(!showAddMenu)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Record</span>
              </Button>

              {showAddMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowAddMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl shadow-black/10 dark:shadow-black/80 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setShowAddMenu(false);
                        onOpenAddModal('book');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 hover:text-indigo-600 dark:hover:text-white transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                      <span>Add New Book</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddMenu(false);
                        onOpenAddModal('certificate');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-600/20 hover:text-purple-600 dark:hover:text-white transition-colors"
                    >
                      <Award className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                      <span>Add Certificate</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddMenu(false);
                        onOpenAddModal('project');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-600/20 hover:text-emerald-600 dark:hover:text-white transition-colors"
                    >
                      <Code2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                      <span>Add Project</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* User Profile / Auth Links */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-100 dark:bg-slate-900/60 transition-colors"
              >
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden sm:inline max-w-[100px] truncate">
                  {user.displayName || user.username}
                </span>
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user.username}
                  className="w-7 h-7 rounded-full object-cover border border-indigo-500/30"
                />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl shadow-black/10 dark:shadow-black/80 py-2 z-30">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{user.displayName || user.username}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">@{user.username}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Settings</span>
                      </Link>
                    </div>
                    <div className="pt-1 border-t border-slate-100 dark:border-white/5">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
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
  );
};
