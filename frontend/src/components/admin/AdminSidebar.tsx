import React from 'react';
import { BarChart3, Users, BookOpen, Shield, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AdminSection = 'overview' | 'users' | 'books' | 'security';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const navItems: { id: AdminSection; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3, description: 'Analytics & stats' },
  { id: 'users', label: 'Users', icon: Users, description: 'Manage users' },
  { id: 'books', label: 'Books', icon: BookOpen, description: 'Manage books' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Security controls' },
];

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-admin-sidebar border-r border-admin-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-admin-border">
        <div className="relative">
          <img
            src="/assets/generated/prodigy-logo.dim_128x128.png"
            alt="Prodigy"
            className="h-10 w-10 rounded-full ring-2 ring-admin-gold/50"
          />
          <div className="absolute -bottom-1 -right-1 bg-admin-gold rounded-full p-0.5">
            <Crown className="h-2.5 w-2.5 text-admin-sidebar" />
          </div>
        </div>
        <div>
          <p className="font-bold text-admin-gold text-sm leading-tight">Prodigy</p>
          <p className="text-admin-muted text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group',
                isActive
                  ? 'bg-admin-gold/15 text-admin-gold border border-admin-gold/30'
                  : 'text-admin-muted hover:bg-admin-gold/5 hover:text-admin-text border border-transparent'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-admin-gold' : 'text-admin-muted group-hover:text-admin-text')} />
              <div>
                <p className={cn('text-sm font-medium', isActive ? 'text-admin-gold' : '')}>{item.label}</p>
                <p className="text-xs text-admin-muted">{item.description}</p>
              </div>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-admin-gold" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-admin-border">
        <div className="flex items-center gap-2 px-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-admin-muted">System Online</span>
        </div>
      </div>
    </div>
  );
}
