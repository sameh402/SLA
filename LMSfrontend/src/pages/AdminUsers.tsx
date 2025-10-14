import React, { useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient, useMutation, keepPreviousData } from "@tanstack/react-query";
import { adminListUsers, adminCreateUser, adminUpdateUser, adminDeleteUser, adminGetUserProfile, AdminUser } from "@/api/admin";
import { 
	Users, 
	UserPlus, 
	Search, 
	Eye, 
	MoreVertical, 
	Edit, 
	Trash2, 
	UserCheck, 
	UserX,
	Mail,
	Calendar,
	Shield,
	Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { adminTheme, cn } from "@/lib/adminTheme";

type ApiList<T> = { count: number; results: T[] } | T[];
const isPaginated = (d: any): d is { count: number; results: any[] } => !!d && !Array.isArray(d) && 'results' in d;

export default function AdminUsers() {
	const { t, direction } = useI18n();
	const qc = useQueryClient();
	const [search, setSearch] = useState("");
	const [joinedAfter, setJoinedAfter] = useState("");
	const [page, setPage] = useState(1);
	const [form, setForm] = useState<Partial<AdminUser> & { password?: string }>({ username: "", email: "", role: 'student', is_active: true, is_staff: false });
	const [editingId, setEditingId] = useState<number | null>(null);
	const [showProfile, setShowProfile] = useState(false);
	const [profileUserId, setProfileUserId] = useState<number | null>(null);

	const { data, isLoading, error } = useQuery<ApiList<AdminUser>>({
		queryKey: ['admin-users', search, joinedAfter, page],
		queryFn: async () => {
			const response = await adminListUsers({ search, date_joined: joinedAfter, page });
			console.log('User data from API:', response.data);
			return response.data;
		},
		placeholderData: keepPreviousData,
	});

	const createMut = useMutation({
		mutationFn: (p: any) => adminCreateUser(p),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
	});
	const updateMut = useMutation({
		mutationFn: ({ id, payload }: any) => adminUpdateUser(id, payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
	});
	const deleteMut = useMutation({
		mutationFn: (id: number) => adminDeleteUser(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
	});

	const users: AdminUser[] = useMemo(() => (isPaginated(data) ? (data.results as AdminUser[]) : ((data ?? []) as AdminUser[])), [data]);
	const count: number = useMemo(() => (isPaginated(data) ? data.count : users.length), [data, users.length]);
	const pageSize = 10;
	const totalPages = Math.max(1, Math.ceil(count / pageSize));

	const { data: profileData } = useQuery({
		queryKey: ['admin-user-profile', profileUserId],
		queryFn: async () => (await adminGetUserProfile(profileUserId as number)).data,
		enabled: !!profileUserId && showProfile,
	});

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (editingId) {
			await updateMut.mutateAsync({ id: editingId, payload: form });
			setEditingId(null);
		} else {
			await createMut.mutateAsync(form);
		}
		setForm({ username: "", email: "", role: 'student', is_active: true, is_staff: false });
	};

	return (
		<AdminLayout>
			{/* Header Section */}
			<div className="mb-8">
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
					<div>
						<h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
							{t("admin.users.userManagement")}
						</h1>
						<p className="text-lg text-muted-foreground mt-2">
							{t("admin.users.manageAccounts")}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<button 
							className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/70 transition-all shadow-lg shadow-primary/25"
							onClick={() => setForm({ username: "", email: "", role: 'student', is_active: true, is_staff: false })}
						>
							<UserPlus size={16} />
							{t("admin.users.addUser")}
						</button>
					</div>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-blue-800 dark:text-blue-200">{t("admin.common.total")} {t("admin.nav.users")}</p>
								<p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{count.toLocaleString()}</p>
							</div>
							<div className="p-3 bg-blue-500 rounded-xl">
								<Users size={24} className="text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Active Users</p>
								<p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
									{users.filter(u => u.is_active).length}
								</p>
							</div>
							<div className="p-3 bg-emerald-500 rounded-xl">
								<UserCheck size={24} className="text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-purple-800 dark:text-purple-200">Admins</p>
								<p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
									{users.filter(u => u.role === 'admin').length}
								</p>
							</div>
							<div className="p-3 bg-purple-500 rounded-xl">
								<Shield size={24} className="text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-amber-800 dark:text-amber-200">Instructors</p>
								<p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
									{users.filter(u => u.role === 'instructor').length}
								</p>
							</div>
							<div className="p-3 bg-amber-500 rounded-xl">
								<Activity size={24} className="text-white" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* User Creation Form */}
			<Card className={cn("mb-8", adminTheme.card)}>
				<CardContent className="p-6">
					<div className="flex items-center justify-between mb-6">
						<div>
						<h3 className="text-lg font-semibold">
							{editingId ? t("admin.users.editUser") : t("admin.users.createNewUser")}
						</h3>
						<p className="text-sm text-muted-foreground">
							{editingId ? t("admin.users.updateUserInfo") : t("admin.users.addNewUser")}
						</p>
						</div>
						{editingId && (
							<Button
								variant="outline"
								onClick={() => {
									setEditingId(null);
									setForm({ username: "", email: "", role: 'student', is_active: true, is_staff: false });
								}}
							>
								{t("admin.users.cancelEdit")}
							</Button>
						)}
					</div>
					<form onSubmit={onSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div className="space-y-2">
								<label className={cn("text-sm font-medium", adminTheme.text.label)}>{t("admin.users.username")}</label>
								<Input 
									placeholder={t("admin.users.enterUsername")} 
									value={form.username || ''} 
									onChange={(e) => setForm({ ...form, username: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<label className={cn("text-sm font-medium", adminTheme.text.label)}>{t("admin.common.email")}</label>
								<Input 
									placeholder={t("admin.users.enterEmail")} 
									type="email" 
									value={form.email || ''} 
									onChange={(e) => setForm({ ...form, email: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<label className={cn("text-sm font-medium", adminTheme.text.label)}>{t("admin.common.password")}</label>
								<Input 
									placeholder={editingId ? t("admin.users.leaveBlankKeepCurrent") : t("admin.users.enterPassword")} 
									type="password" 
									onChange={(e) => setForm({ ...form, password: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<label className={cn("text-sm font-medium", adminTheme.text.label)}>{t("admin.common.role")}</label>
								<select 
									className={cn("w-full px-3 py-2 rounded-lg", adminTheme.select)} 
									value={form.role as any} 
									onChange={(e) => setForm({ ...form, role: e.target.value as any })}
								>
									<option value="student">{t("admin.users.student")}</option>
									<option value="instructor">{t("admin.users.instructor")}</option>
									<option value="admin">{t("admin.users.admin")}</option>
								</select>
							</div>
						</div>
						<div className="flex items-center justify-between pt-4">
							<div className="flex items-center gap-4">
								<label className="flex items-center gap-2">
									<input 
										type="checkbox" 
										checked={form.is_active} 
										onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
										className={cn("w-4 h-4", adminTheme.checkbox)}
									/>
									<span className={cn("text-sm font-medium", adminTheme.text.label)}>{t("admin.users.activeUser")}</span>
								</label>
								<label className="flex items-center gap-2">
									<input 
										type="checkbox" 
										checked={form.is_staff} 
										onChange={(e) => setForm({ ...form, is_staff: e.target.checked })}
										className={cn("w-4 h-4", adminTheme.checkbox)}
									/>
									<span className={cn("text-sm font-medium", adminTheme.text.label)}>{t("admin.users.staffAccess")}</span>
								</label>
							</div>
							<Button 
								type="submit" 
								className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
								disabled={createMut.isPending || updateMut.isPending}
							>
								{editingId ? t("admin.users.updateUser") : t("admin.users.createUser")}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Filters and Search */}
			<Card className={cn("mb-6", adminTheme.card)}>
				<CardContent className="p-6">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input 
								className="pl-10" 
								placeholder={t("admin.users.searchByNameEmail")} 
								value={search} 
								onChange={(e) => { setPage(1); setSearch(e.target.value); }} 
							/>
						</div>
						<div className="flex gap-2">
							<div className="relative">
								<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input 
									type="date" 
									className="pl-10 w-48"
									value={joinedAfter} 
									onChange={(e) => { setPage(1); setJoinedAfter(e.target.value); }} 
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Users Table */}
			<Card className={adminTheme.card}>
				<CardContent className="p-6">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="text-lg font-semibold">{t("admin.users.usersDirectory")}</h3>
							<p className="text-sm text-muted-foreground">
								{isLoading ? t("admin.users.loadingUsers") : `${users.length} ${t("admin.users.usersDisplayed")}`}
							</p>
						</div>
					</div>

					{isLoading && (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
						</div>
					)}

					{error && (
						<div className="text-center py-12">
							<div className="text-red-500 mb-4">⚠️</div>
							<h3 className="text-lg font-semibold mb-2">Failed to load users</h3>
							<p className="text-muted-foreground">Please try refreshing the page</p>
						</div>
					)}

					{!isLoading && !error && (
						<>
							<div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
								<table className="w-full text-sm">
									<thead className="bg-slate-50 dark:bg-slate-800/50">
										<tr>
											<th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">User</th>
											<th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Role</th>
											<th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Status</th>
											<th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Joined</th>
											<th className="text-right py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
										</tr>
									</thead>
									<tbody>
										{users.map((u) => (
											<tr key={u.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
												<td className="py-4 px-6">
													<div className="flex items-center gap-3">
														<div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
															<span className="text-primary-foreground font-semibold text-sm">
																{u.username.charAt(0).toUpperCase()}
															</span>
														</div>
														<div>
															<p className="font-medium">{u.username}</p>
															<p className="text-muted-foreground text-sm flex items-center gap-1">
																<Mail size={12} />
																{u.email}
															</p>
														</div>
													</div>
												</td>
												<td className="py-4 px-6">
													<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
														u.role === 'admin' 
															? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
															: u.role === 'instructor' 
															? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
															: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
													}`}>
														{u.role === 'admin' && <Shield size={12} className="mr-1" />}
														{u.role === 'instructor' && <Activity size={12} className="mr-1" />}
														{u.role === 'student' && <Users size={12} className="mr-1" />}
														{u.role.charAt(0).toUpperCase() + u.role.slice(1)}
													</span>
												</td>
												<td className="py-4 px-6">
													<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
														u.is_active 
															? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
															: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
													}`}>
														{u.is_active ? <UserCheck size={12} className="mr-1" /> : <UserX size={12} className="mr-1" />}
														{u.is_active ? 'Active' : 'Inactive'}
													</span>
												</td>
												<td className="py-4 px-6 text-muted-foreground">
													{u.date_joined ? new Date(u.date_joined).toLocaleDateString() : 'N/A'}
												</td>
												<td className="py-4 px-6">
													<div className="flex items-center justify-end gap-2">
														<Button 
															variant="outline" 
															size="sm"
															onClick={() => { setProfileUserId(u.id); setShowProfile(true); }}
															className="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20"
														>
															<Eye size={14} />
														</Button>
														<Button 
															variant="outline" 
															size="sm"
															onClick={() => { 
																setEditingId(u.id); 
																setForm({ username: u.username, email: u.email, role: u.role, is_active: u.is_active, is_staff: u.is_staff }); 
															}}
															className="hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-900/20"
														>
															<Edit size={14} />
														</Button>
														<Button 
															variant="outline" 
															size="sm"
															onClick={() => deleteMut.mutate(u.id)}
															className="hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 text-red-600"
															disabled={deleteMut.isPending}
														>
															<Trash2 size={14} />
														</Button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							{/* Pagination */}
							<div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
								<p className="text-sm text-muted-foreground">
									Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, count)} of {count} users
								</p>
								<div className="flex items-center gap-2">
									<Button 
										variant="outline" 
										size="sm"
										disabled={page <= 1} 
										onClick={() => setPage((p) => Math.max(1, p - 1))}
									>
										Previous
									</Button>
									<span className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg">
										{page} of {totalPages}
									</span>
									<Button 
										variant="outline" 
										size="sm"
										disabled={page >= totalPages} 
										onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									>
										Next
									</Button>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Profile Drawer */}
			{showProfile && (
				<div className="fixed inset-0 z-50">
					<div className="absolute inset-0 bg-black/50" onClick={() => setShowProfile(false)} />
					<div className="absolute right-0 top-0 h-full w-full sm:w-[560px] md:w-[640px] bg-card border-l border-border shadow-2xl flex flex-col">
						<div className="p-4 border-b border-border flex items-center justify-between">
							<h2 className="text-lg font-semibold">User Profile</h2>
							<Button variant="outline" onClick={() => setShowProfile(false)}>Close</Button>
						</div>
						<div className="p-4 overflow-auto space-y-6">
							{!profileData && <div className="text-sm text-muted-foreground">Loading profile…</div>}
							{profileData && (
								<>
									<Card className="bg-card border-border"><CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
										<div><p className="text-sm text-muted-foreground">Username</p><p className="font-semibold">{profileData.user.username}</p></div>
										<div><p className="text-sm text-muted-foreground">Email</p><p className="font-semibold">{profileData.user.email}</p></div>
										<div><p className="text-sm text-muted-foreground">Role</p><p className="font-semibold capitalize">{profileData.user.role}</p></div>
										<div><p className="text-sm text-muted-foreground">Active</p><p className="font-semibold">{profileData.user.is_active ? 'Yes' : 'No'}</p></div>
									</CardContent></Card>

									<Card className="bg-card border-border"><CardContent className="p-4">
										<h3 className="text-md font-semibold mb-3">Enrollments</h3>
										<table className="w-full text-sm">
											<thead><tr className="text-left text-muted-foreground"><th>ID</th><th>Course</th><th>Status</th><th>Progress</th></tr></thead>
											<tbody>
												{profileData.enrollments.map((e: any) => (
													<tr key={e.id} className="border-t border-border"><td>{e.id}</td><td>{e.course}</td><td>{e.status}</td><td>{e.progress}%</td></tr>
												))}
											</tbody>
										</table>
									</CardContent></Card>

									<Card className="bg-card border-border"><CardContent className="p-4">
										<h3 className="text-md font-semibold mb-3">Payments</h3>
										<table className="w-full text-sm">
											<thead><tr className="text-left text-muted-foreground"><th>ID</th><th>Course</th><th>Amount</th><th>Status</th><th>Txn</th></tr></thead>
											<tbody>
												{profileData.payments.map((p: any) => (
													<tr key={p.id} className="border-t border-border"><td>{p.id}</td><td>{p.course}</td><td>{p.amount} {p.currency}</td><td>{p.payment_status}</td><td>{p.transaction_id}</td></tr>
												))}
											</tbody>
										</table>
									</CardContent></Card>

									<Card className="bg-card border-border"><CardContent className="p-4">
										<h3 className="text-md font-semibold mb-3">Activity</h3>
										<table className="w-full text-sm">
											<thead><tr className="text-left text-muted-foreground"><th>Type</th><th>Course</th><th>Status</th><th>Date</th></tr></thead>
											<tbody>
												{profileData.activity.map((a: any, idx: number) => (
													<tr key={idx} className="border-t border-border"><td className="capitalize">{a.type}</td><td>{a.course_id}</td><td>{a.status}</td><td>{new Date(a.created_at).toLocaleString()}</td></tr>
												))}
											</tbody>
										</table>
									</CardContent></Card>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</AdminLayout>
	);
}
