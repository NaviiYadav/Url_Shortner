import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  QrCode,
  Users,
  Settings,
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const userLinks = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { href: '/dashboard/urls', icon: Link2, label: 'My URLs' },
    { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/dashboard/qr-codes', icon: QrCode, label: 'QR Codes' },
    { href: '/dashboard/profile', icon: User, label: 'Profile' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const adminLinks = [
    { href: '/dashboard/admin', icon: Shield, label: 'Admin Panel' },
    { href: '/dashboard/admin/users', icon: Users, label: 'All Users' },
    { href: '/dashboard/admin/urls', icon: Link2, label: 'All URLs' },
    { href: '/dashboard/admin/analytics', icon: BarChart3, label: 'Global Analytics' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      className="fixed left-0 top-16 bottom-0 z-40 bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-card border border-border shadow-md z-50"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* User Links */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Menu
            </p>
          )}
          {userLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-primary text-primary-foreground shadow-glow'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-primary-foreground')} />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Admin Links */}
        {isAdmin && (
          <div className="pt-4 space-y-1">
            {!collapsed && (
              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Admin
              </p>
            )}
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-accent text-accent-foreground shadow-glow-accent'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-accent-foreground')} />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User Info */}
      {!collapsed && user && (
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default DashboardSidebar;
