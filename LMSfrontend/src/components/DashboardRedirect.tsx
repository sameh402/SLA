import React from "react";
import { Navigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function DashboardRedirect() {
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

  // Redirect based on user role
  if (userProfile.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/student-dashboard" replace />;
  }
}
