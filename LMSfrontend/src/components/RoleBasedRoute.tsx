import React from "react";
import { Navigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export default function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = "/student-dashboard" 
}: RoleBasedRouteProps) {
  const { userProfile, loading } = useUserProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return <Navigate to="/LogIn" replace />;
  }

  if (!allowedRoles.includes(userProfile.role || 'student')) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}
