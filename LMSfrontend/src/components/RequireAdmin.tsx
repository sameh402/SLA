import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function RequireAdmin() {
	const { userProfile, loading } = useUserProfile();
	if (loading) return <div className="p-6 text-foreground">Loading...</div>;
	const isAdmin = userProfile?.role === 'admin';
	return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}

