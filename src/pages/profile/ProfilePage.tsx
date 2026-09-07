import React, { useState } from 'react';
import { User, Mail, Calendar, UploadCloud, CheckCircle2, ShieldCheck, Award, BookOpen, Code2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { storageService } from '../../services';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await storageService.uploadFile(file, {
        category: 'projects/icons', // Profile avatar image
      });
      setAvatarUrl(res.fileUrl);
      await updateProfile({ avatarUrl: res.fileUrl, avatarKey: res.fileKey });
      success('Profile photo updated!');
    } catch (err: any) {
      error('Failed to upload profile picture', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ displayName, avatarUrl });
      success('Profile updated successfully!');
    } catch (err: any) {
      error('Failed to update profile', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in duration-300">
      
      <div className="pb-6 border-b border-black/[0.08] dark:border-white/[0.06]">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Personal Profile</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Manage your curator identity, display name, and avatar.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 space-y-8">
        
        {/* User Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-black/[0.06] dark:border-white/5 text-center sm:text-left">
          <div className="relative group">
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={user?.username}
              className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500/40 shadow-xl"
            />
            <input
              type="file"
              id="avatar-input"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <label
              htmlFor="avatar-input"
              className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity"
            >
              <UploadCloud className="w-6 h-6" />
            </label>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.displayName || user?.username}</h2>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold font-mono">@{user?.username}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Curator since {formatDate(user?.createdAt)}</span>
            </p>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Username"
              value={user?.username || ''}
              disabled
              helperText="Unique handle across My Library"
              className="opacity-60 cursor-not-allowed"
            />
            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
          </div>

          <Input
            label="Display Name"
            placeholder="Your preferred name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
              Save Profile
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
