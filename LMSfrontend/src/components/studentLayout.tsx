import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, ShoppingBag, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProfileDropdown from "./ProfileDropdown";
import CustomerServiceModal from "./CustomerServiceModal";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { useI18n } from "@/lib/i18n";

// useAuth hook from your lib (adjust path if different)
import { useAuth } from "@/lib/useAuth";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false);
  const { t, language, direction } = useI18n();

  // grab logout (and optionally user, loading) from your auth hook
  const { logout, user, loading } = useAuth();

  const handleLogout = () => {
    try {
      logout();
      // Redirect to login after logout
      navigate("/LogIn");
    } catch (err) {
      console.error("Failed to logout:", err);
      // Fallback redirect
      navigate("/LogIn");
    }
  };

  const handleCustomerService = () => {
    setIsCustomerServiceOpen(true);
  };

  const navItems = [
    {
      href: "/student-dashboard",
      label: t("nav.dashboard"),
      icon: BookOpen,
    },

    {
      href: "/Store",
      label: t("nav.store"),
      icon: ShoppingBag,
    },
    {
      href: "/student-dashboard?tab=tickets",
      label: t("nav.tickets"),
      icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <img
                src="/mainlogo.png"
                alt="Logo"
                className="h-12 w-12 object-cover rounded-full"
              />
              <span className="hidden font-semibold text-lg sm:inline-block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {t("nav.academy")}
              </span>

              {/* Navigation */}
              <nav className="hidden md:flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href.includes("?")
                    ? (location.pathname + location.search) === item.href
                    : (location.pathname === item.href && !location.search);

                  return (
                    <Link key={item.href} to={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language and Theme Toggles */}
              <div className="flex items-center space-x-2">
                <div className="transform hover-scale-105 transition-transform duration-300">
                  <LanguageToggle />
                </div>
                <div className="transform hover-scale-105 transition-transform duration-300">
                  <ThemeToggle />
                </div>
              </div>

              {/* User Profile Dropdown */}
              <ProfileDropdown onCustomerServiceClick={handleCustomerService} onLogout={handleLogout} />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-3">
            <nav className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href.includes("?")
                  ? (location.pathname + location.search) === item.href
                  : (location.pathname === item.href && !location.search);

                return (
                  <Link key={item.href} to={item.href} className="flex-1">
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      {/* Customer Service Modal */}
      <CustomerServiceModal isOpen={isCustomerServiceOpen} onClose={() => setIsCustomerServiceOpen(false)} />
    </div>
  );
}
