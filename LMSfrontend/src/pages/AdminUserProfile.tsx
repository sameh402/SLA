import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { adminGetUserProfile } from "@/api/admin";

export default function AdminUserProfile() {
	const { id } = useParams();
	const userId = Number(id);
	const { data, isLoading, error } = useQuery({
		queryKey: ['admin-user-profile', userId],
		queryFn: async () => (await adminGetUserProfile(userId)).data,
		enabled: !!userId,
	});

	return (
		<AdminLayout>
			<h1 className="text-3xl font-bold mb-6">User Profile</h1>
			{isLoading && <div>Loading...</div>}
			{error && <div className="text-destructive">Failed to load user</div>}
			{data && (
				<div className="space-y-6">
					<Card className="bg-card border-border"><CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
						<div>
							<p className="text-sm text-muted-foreground">Username</p>
							<p className="font-semibold">{data.user.username}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Email</p>
							<p className="font-semibold">{data.user.email}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Role</p>
							<p className="font-semibold capitalize">{data.user.role}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Active</p>
							<p className="font-semibold">{data.user.is_active ? 'Yes' : 'No'}</p>
						</div>
					</CardContent></Card>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<Card className="bg-card border-border">
							<CardContent className="p-4">
								<h2 className="text-lg font-semibold mb-3">Enrollments</h2>
								<table className="w-full text-sm">
									<thead><tr className="text-left text-muted-foreground"><th>ID</th><th>Course</th><th>Status</th><th>Progress</th></tr></thead>
									<tbody>
										{data.enrollments.map((e: any) => (
											<tr key={e.id} className="border-t border-border"><td>{e.id}</td><td><Link className="underline" to={`/admin/courses?course=${e.course}`}>{e.course}</Link></td><td>{e.status}</td><td>{e.progress}%</td></tr>
										))}
									</tbody>
								</table>
							</CardContent>
						</Card>
						<Card className="bg-card border-border">
							<CardContent className="p-4">
								<h2 className="text-lg font-semibold mb-3">Payments</h2>
								<table className="w-full text-sm">
									<thead><tr className="text-left text-muted-foreground"><th>ID</th><th>Course</th><th>Amount</th><th>Status</th><th>Txn</th></tr></thead>
									<tbody>
										{data.payments.map((p: any) => (
											<tr key={p.id} className="border-t border-border"><td>{p.id}</td><td><Link className="underline" to={`/admin/courses?course=${p.course}`}>{p.course}</Link></td><td>{p.amount} {p.currency}</td><td>{p.payment_status}</td><td>{p.transaction_id}</td></tr>
										))}
									</tbody>
								</table>
							</CardContent>
						</Card>
					</div>

					<Card className="bg-card border-border">
						<CardContent className="p-4">
							<h2 className="text-lg font-semibold mb-3">Activity</h2>
							<table className="w-full text-sm">
								<thead><tr className="text-left text-muted-foreground"><th>Type</th><th>Course</th><th>Status</th><th>Date</th></tr></thead>
								<tbody>
									{data.activity.map((a: any, idx: number) => (
										<tr key={idx} className="border-t border-border"><td className="capitalize">{a.type}</td><td>{a.course_id}</td><td>{a.status}</td><td>{new Date(a.created_at).toLocaleString()}</td></tr>
									))}
								</tbody>
							</table>
						</CardContent>
					</Card>
				</div>
			)}
		</AdminLayout>
	);
}

