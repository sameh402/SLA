import React from "react";
import StudentLayout from "@/components/studentLayout";

export default function InstructorDashboard() {
	return (
		<StudentLayout>
			<h1 className="text-3xl font-bold text-foreground">Instructor Dashboard</h1>
			<p className="text-muted-foreground">Manage your courses and students here.</p>
		</StudentLayout>
	);
}

