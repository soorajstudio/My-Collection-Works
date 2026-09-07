import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Award, Code2, Heart } from 'lucide-react';
import { cn } from '../../utils/cn';

export const MobileNav: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Books', to: '/books', icon: BookOpen },
    { label: 'Certificates', to: '/certificates', icon: Award },
    { label: 'Projects', to: '/projects', icon: Code2 },
    { label: 'Wishlist', to: '/wishlist', icon: Heart },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl px-2 py-1.5 shadow-2xl shadow-black/10 dark:shadow-black">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 text-[10px] font-medium',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-5 h-5 mb-1', isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500')} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
