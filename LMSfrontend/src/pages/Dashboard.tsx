import React from "react";
import StudentDashboard from "./studetDashboard";
import { useUserProfile } from "@/hooks/useUserProfile";
import AdminDashboard from "./AdminDashboard";
import InstructorDashboard from "./InstructorDashboard";

export default function Dashboard() {
	const { userProfile, loading } = useUserProfile();
	if (loading) return <div className="p-6 text-foreground">Loading...</div>;
	const role = userProfile?.role || 'student';
	if (role === 'admin') return <AdminDashboard />;
	if (role === 'instructor') return <InstructorDashboard />;
	return <StudentDashboard />;
}
