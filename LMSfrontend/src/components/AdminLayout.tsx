import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Users,
  LayoutDashboard,
  Settings,
  Menu,
  X,
  GraduationCap,
  UserCheck,
  PlusCircle,
  Bell,
  DollarSign,
  MessageSquare
} from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/lib/useAuth';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BookOpen, label: 'Courses', href: '/admin/courses' },
  { icon: Users, label: 'Students', href: '/admin/users' },
  { icon: MessageSquare, label: 'Tickets', href: '/admin/tickets' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/LogIn');
  };
  const { userProfile } = useUserProfile();

  // Get current user from localStorage
  const isAdmin = userProfile?.role === 'admin';


  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-sidebar-foreground">Smart Learning Academy</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            {/* Finance link for admin only */}
            {isAdmin && (
              <Link
                to="/admin/Finance"
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors bg-green-100 text-green-800 hover:bg-green-200 mt-2"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-4 h-4" />
                  <span>Finance</span>
                </div>
              </Link>
            )}
          </nav>

          {/* User info & Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex flex-col gap-2">
              <Link to="#" className="flex items-center space-x-3 p-3 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/60 transition">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">{userProfile?.avatar || '?'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {userProfile?.firstName || 'Unknown User'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {userProfile?.email || ''}
                  </p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="mt-2 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <h1 className="text-lg font-semibold text-foreground">
                Educational Platform Admin
              </h1>
            </div>

            {/* Removed quick add and bell icon */}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
