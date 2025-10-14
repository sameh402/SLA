import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  LogOut,
  HeadphonesIcon,
  ChevronDown,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { useI18n } from "@/lib/i18n";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileDropdownProps {
  onCustomerServiceClick: () => void;
  onLogout: () => void;
}

export default function ProfileDropdown({
  onCustomerServiceClick,
  onLogout,
}: ProfileDropdownProps) {
  const { user } = useAuth();
  const { userProfile, loading, getDisplayName } = useUserProfile();
  const { t, language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user display info
  const displayName = userProfile ? getDisplayName() : (user?.displayName || user?.email || "User");
  const displayEmail = userProfile?.email || user?.email || "user@example.com";
  
  const initials = userProfile
    ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`
    : displayName.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase() || (language === "ar" ? "أم" : "US");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(o => !o)}
        className="flex items-center justify-center hover:shadow-lg transition-all duration-200 group"
      >
        <Avatar className="w-8 h-8 border-2 border-primary/20 hover:border-primary/40 transition-colors">
          <AvatarImage src={userProfile?.avatar} alt={displayName} />
          <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-64 shadow-xl border border-border z-50 bg-card">
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/50">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarImage src={userProfile?.avatar} alt={displayName} />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">
                    {displayName}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">{displayEmail}</p>
                  {userProfile && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "ar" 
                        ? (userProfile.accountType === 'student' ? 'طالب' : 'بالغ')
                        : (userProfile.accountType === 'student' ? 'Student' : 'Adult')
                      } • {language === "ar" ? `العمر ${userProfile.age}` : `Age ${userProfile.age}`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="py-2">
              <Link
                to="/edit-profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-3 text-foreground hover:bg-accent transition-colors"
              >
                <User className="w-5 h-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">{t("profile.editProfile")}</p>
                  <p className="text-xs text-muted-foreground">{t("profile.editProfileDesc")}</p>
                </div>
              </Link>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onCustomerServiceClick();
                }}
                className="w-full flex items-center px-4 py-3 text-foreground hover:bg-accent transition-colors"
              >
                <HeadphonesIcon className="w-5 h-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="font-medium">{t("profile.customerService")}</p>
                  <p className="text-xs text-muted-foreground">{t("profile.customerServiceDesc")}</p>
                </div>
              </button>

              <div className="border-t border-border mt-2 pt-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center px-4 py-3 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium">{t("profile.logout")}</p>
                    <p className="text-xs text-destructive/70">{t("profile.logoutDesc")}</p>
                  </div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}