import React, { useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient, useMutation, keepPreviousData } from "@tanstack/react-query";
import { adminListCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse, adminCreateCourseMultipart, createCourseMedia } from "@/api/admin";
import { 
	BookOpen, 
	Plus, 
	Search, 
	UploadCloud, 
	Eye, 
	Edit, 
	Trash2, 
	Calendar, 
	DollarSign,
	Users,
	Play,
	FileText,
	Image,
	Award,
	TrendingUp,
	CheckCircle,
	Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { adminTheme, cn } from "@/lib/adminTheme";
import { useI18n } from "@/lib/i18n";
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	PieChart,
	Pie,
	Cell
} from 'recharts';

type ApiList<T> = { count: number; results: T[] } | T[];

export default function AdminCourses() {
	const { t } = useI18n();
	const qc = useQueryClient();
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [createdAfter, setCreatedAfter] = useState("");
	const [page, setPage] = useState(1);
	const [form, setForm] = useState<any>({ title: "", description: "", status: 'draft', price: 0 });
	const [editingId, setEditingId] = useState<number | null>(null);

	// Modal state for creating a course with media
	const [showCreate, setShowCreate] = useState(false);
	const [creating, setCreating] = useState(false);
	const [thumbFile, setThumbFile] = useState<File | null>(null);
	const [mediaItems, setMediaItems] = useState<Array<{ file?: File | null; title: string; media_type: string; order: number }>>([]);

	const { data, isLoading, error } = useQuery<ApiList<any>>({
		queryKey: ['admin-courses', search, statusFilter, createdAfter, page],
		queryFn: async () => (await adminListCourses({ search, status: statusFilter, created_at__date__gte: createdAfter, page })).data,
		placeholderData: keepPreviousData,
	});

	const createMut = useMutation({
		mutationFn: (p: any) => adminCreateCourse(p),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-courses'] }),
	});
	const updateMut = useMutation({
		mutationFn: ({ id, payload }: any) => adminUpdateCourse(id, payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-courses'] }),
	});
	const deleteMut = useMutation({
		mutationFn: (id: number) => adminDeleteCourse(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-courses'] }),
	});

	const isPaginated = (d: any): d is { count: number; results: any[] } => !!d && !Array.isArray(d) && 'results' in d;
	const courses: any[] = useMemo(() => (isPaginated(data) ? data.results : (data ?? [])), [data]);
	const count: number = useMemo(() => (isPaginated(data) ? data.count : courses.length), [data, courses.length]);
	const pageSize = 10;
	const totalPages = Math.max(1, Math.ceil(count / pageSize));

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (editingId) {
			await updateMut.mutateAsync({ id: editingId, payload: form });
			setEditingId(null);
		} else {
			await createMut.mutateAsync(form);
		}
		setForm({ title: "", description: "", status: 'draft', price: 0 });
	};

	return (
		<AdminLayout>
			{/* Header Section */}
			<div className="mb-8">
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
					<div>
						<h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
							{t("admin.courses.courseManagement")}
						</h1>
						<p className="text-lg text-muted-foreground mt-2">
							{t("admin.courses.createPublishOrganize")}
							{' '}<Link to="/admin/courses-test" className="text-blue-500 hover:underline">(Test Course Profile)</Link>
						</p>
					</div>
					<div className="flex items-center gap-3">
						<button 
							className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/70 transition-all shadow-lg shadow-primary/25"
							onClick={() => setShowCreate(true)}
						>
							<Plus size={16} />
							{t("admin.courses.createCourse")}
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
								<p className="text-sm font-medium text-blue-800 dark:text-blue-200">{t("admin.courses.totalCourses")}</p>
								<p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{count.toLocaleString()}</p>
							</div>
							<div className="p-3 bg-blue-500 rounded-xl">
								<BookOpen size={24} className="text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{t("admin.courses.published")}</p>
								<p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
									{courses.filter(c => c.status === 'published').length}
								</p>
							</div>
							<div className="p-3 bg-emerald-500 rounded-xl">
								<CheckCircle size={24} className="text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-amber-800 dark:text-amber-200">{t("admin.courses.draft")}</p>
								<p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
									{courses.filter(c => c.status === 'draft').length}
								</p>
							</div>
							<div className="p-3 bg-amber-500 rounded-xl">
								<Clock size={24} className="text-white" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-purple-800 dark:text-purple-200">{t("admin.courses.totalRevenue")}</p>
								<p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
									${courses.reduce((sum, c) => sum + ((c.price || 0) * (c.enrollment_count || 0)), 0).toLocaleString()}
								</p>
							</div>
							<div className="p-3 bg-purple-500 rounded-xl">
								<DollarSign size={24} className="text-white" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Create Form */}
			<Card className="mb-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
				<CardContent className="p-6">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="text-lg font-semibold">
								{editingId ? t("admin.courses.editCourse") : t("admin.courses.quickCreateCourse")}
							</h3>
							<p className="text-sm text-muted-foreground">
								{editingId ? t("admin.courses.updateCourseInfo") : t("admin.courses.createBasicCourse")}
							</p>
						</div>
						{editingId && (
							<Button
								variant="outline"
								onClick={() => {
									setEditingId(null);
									setForm({ title: "", description: "", status: 'draft', price: 0 });
								}}
							>
{t("admin.common.cancel")} {t("admin.common.edit")}
							</Button>
						)}
					</div>
					<form onSubmit={onSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">{t("admin.courses.courseTitle")}</label>
								<Input 
									placeholder={t("admin.courses.enterCourseTitle")} 
									value={form.title} 
									onChange={(e) => setForm({ ...form, title: e.target.value })}
									required
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">{t("admin.courses.courseDescription")}</label>
								<Input 
									placeholder={t("admin.courses.enterDescription")} 
									value={form.description} 
									onChange={(e) => setForm({ ...form, description: e.target.value })}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">{t("admin.courses.status")}</label>
								<select 
									className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" 
									value={form.status} 
									onChange={(e) => setForm({ ...form, status: e.target.value })}
								>
									<option value="draft">{t("admin.common.draft")}</option>
									<option value="published">{t("admin.common.published")}</option>
								</select>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">{t("admin.courses.price")} ($)</label>
								<Input 
									placeholder="0.00" 
									type="number" 
									step="0.01"
									min="0"
									value={form.price} 
									onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
								/>
							</div>
						</div>
						<div className="flex justify-end pt-4">
							<Button 
								type="submit" 
								className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
								disabled={createMut.isPending || updateMut.isPending}
							>
{editingId ? t("admin.courses.updateCourse") : t("admin.courses.createCourse")}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Filters and Search */}
			<Card className="mb-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
				<CardContent className="p-6">
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input 
								className="pl-10" 
placeholder={t("admin.courses.searchCoursesTitle")} 
								value={search} 
								onChange={(e) => { setPage(1); setSearch(e.target.value); }} 
							/>
						</div>
						<div className="flex gap-2">
							<select 
								className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800" 
								value={statusFilter} 
								onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
							>
								<option value="">{t("admin.courses.allStatuses")}</option>
								<option value="draft">{t("admin.common.draft")}</option>
								<option value="published">{t("admin.common.published")}</option>
							</select>
							<div className="relative">
								<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input 
									type="date" 
									className="pl-10 w-48"
									value={createdAfter} 
									onChange={(e) => { setPage(1); setCreatedAfter(e.target.value); }} 
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Analytics Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
				<Card className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-lg font-semibold">{t("admin.courses.coursePerformance")}</h3>
								<p className="text-sm text-muted-foreground">{t("admin.courses.enrollmentsPerCourse")}</p>
							</div>
							<TrendingUp size={20} className="text-green-500" />
						</div>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={courses.slice(0, 10).map(course => ({
									name: course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title,
									enrollments: course.enrollment_count || 0,
									revenue: (course.price || 0) * (course.enrollment_count || 0)
								}))}>
									<CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} className="stroke-slate-200 dark:stroke-slate-700" />
									<XAxis 
										dataKey="name" 
										tick={{ fontSize: 12 }} 
										axisLine={false} 
										tickLine={false}
										angle={-45}
										textAnchor="end"
										height={60}
										className="text-slate-700 dark:text-slate-300"
									/>
									<YAxis 
										tick={{ fontSize: 12 }} 
										axisLine={false} 
										tickLine={false} 
										className="text-slate-700 dark:text-slate-300"
									/>
									<Tooltip 
										contentStyle={{ 
											backgroundColor: 'var(--background)', 
											border: 'none', 
											borderRadius: '8px',
											boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
											color: 'var(--foreground)'
										}} 
									/>
									<Bar 
										dataKey="enrollments" 
										fill="var(--primary)" 
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-lg font-semibold">{t("admin.courses.revenueSpilt")}</h3>
								<p className="text-sm text-muted-foreground">{t("admin.courses.byCoursePricing")}</p>
							</div>
							<DollarSign size={20} className="text-amber-500" />
						</div>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={courses
											.filter(course => (course.enrollment_count || 0) > 0)
											.slice(0, 6)
											.map((course, index) => ({
												name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
												value: (course.price || 0) * (course.enrollment_count || 0),
												color: [
													'#3b82f6', '#10b981', '#f59e0b', 
													'#ef4444', '#8b5cf6', '#06b6d4'
												][index % 6]
											}))
										}
										cx="50%"
										cy="50%"
										innerRadius={40}
										outerRadius={80}
										paddingAngle={5}
										dataKey="value"
									>
										{courses
											.filter(course => (course.enrollment_count || 0) > 0)
											.slice(0, 6)
											.map((course, index) => (
												<Cell 
													key={`cell-${index}`} 
													fill={[
														'#3b82f6', '#10b981', '#f59e0b', 
														'#ef4444', '#8b5cf6', '#06b6d4'
													][index % 6]} 
												/>
											))
										}
									</Pie>
									<Tooltip 
										formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
										contentStyle={{ 
											backgroundColor: 'var(--background)', 
											border: 'none', 
											borderRadius: '8px',
											boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
											color: 'var(--foreground)'
										}} 
									/>
								</PieChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Courses Table */}
			<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
				<CardContent className="p-6">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="text-lg font-semibold">{t("admin.courses.coursesDirectory")}</h3>
							<p className="text-sm text-muted-foreground">
								{isLoading ? t("admin.courses.loadingCourses") : `${courses.length} ${t("admin.courses.coursesDisplayed")}`}
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
							<h3 className="text-lg font-semibold mb-2">{t("admin.courses.failedToLoadCourses")}</h3>
							<p className="text-muted-foreground">{t("admin.users.tryRefreshing")}</p>
						</div>
					)}

					{!isLoading && !error && (
						<>
							<div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
								<table className="w-full text-sm text-slate-800 dark:text-slate-200">
									<thead className="bg-slate-50 dark:bg-slate-800/50">
										<tr>
											<th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">{t("admin.courses.course")}</th>
											<th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">{t("admin.courses.status")}</th>
											<th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">{t("admin.courses.price")}</th>
											<th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">{t("admin.courses.created")}</th>
											<th className="text-right py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">{t("admin.courses.actions")}</th>
										</tr>
									</thead>
									<tbody>
										{courses.map((c) => (
											<tr key={c.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
												<td className="py-4 px-6">
													<div className="flex items-center gap-3">
														<div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
															<BookOpen size={20} className="text-primary-foreground" />
														</div>
														<div>
															<p className="font-medium">{c.title}</p>
															<p className="text-muted-foreground text-sm">ID: {c.id}</p>
														</div>
													</div>
												</td>
												<td className="py-4 px-6">
													<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
														c.status === 'published' 
															? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
															: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
													}`}>
														{c.status === 'published' ? <CheckCircle size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
														{c.status.charAt(0).toUpperCase() + c.status.slice(1)}
													</span>
												</td>
												<td className="py-4 px-6">
													<div className="flex items-center gap-1">
														<DollarSign size={14} className="text-muted-foreground" />
														<span className="font-medium">{c.price || '0.00'}</span>
													</div>
												</td>
												<td className="py-4 px-6 text-muted-foreground">
													{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
												</td>
												<td className="py-4 px-6">
													<div className="flex items-center justify-end gap-2">
														<Link 
															to={`/admin/courses/${c.id}`}
															className="inline-flex items-center px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 transition-colors"
														>
															<Eye size={14} className="mr-1" />
{t("admin.common.view")}
														</Link>
														<Button 
															variant="outline" 
															size="sm"
															onClick={() => { 
																setEditingId(c.id); 
																setForm({ title: c.title, description: c.description, status: c.status, price: c.price }); 
															}}
															className="hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-900/20"
														>
															<Edit size={14} />
														</Button>
														<Button 
															variant="outline" 
															size="sm"
															onClick={() => deleteMut.mutate(c.id)}
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
									{t("admin.common.showing")} {((page - 1) * pageSize) + 1} {t("admin.common.to")} {Math.min(page * pageSize, count)} {t("admin.common.of")} {count} {t("admin.courses.course").toLowerCase()}
								</p>
								<div className="flex items-center gap-2">
									<Button 
										variant="outline" 
										size="sm"
										disabled={page <= 1} 
										onClick={() => setPage((p) => Math.max(1, p - 1))}
									>
{t("admin.common.previous")}
									</Button>
									<span className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg">
{page} {t("admin.common.of")} {totalPages}
									</span>
									<Button 
										variant="outline" 
										size="sm"
										disabled={page >= totalPages} 
										onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									>
{t("admin.common.next")}
									</Button>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Create Course Modal */}
			{showCreate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					<div className="absolute inset-0 bg-black/50" onClick={() => !creating && setShowCreate(false)} />
					<div className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl mx-4">
						<div className="p-4 border-b border-border flex items-center justify-between">
							<h2 className="text-lg font-semibold">{t("admin.courses.addCourse")}</h2>
							<Button variant="outline" disabled={creating} onClick={() => setShowCreate(false)}>{t("admin.common.close")}</Button>
						</div>
						<div className="p-4 space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<Input placeholder={t("admin.courses.courseTitle")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
								<Input placeholder={t("admin.courses.price")} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
								<select className="border rounded px-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
									<option value="draft">{t("admin.common.draft")}</option>
									<option value="published">{t("admin.common.published")}</option>
								</select>
							</div>
							<textarea placeholder={t("admin.courses.courseDescription")} className="w-full border rounded px-3 py-2 bg-background border-border text-foreground min-h-[80px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
							<div>
								<p className="text-sm text-muted-foreground mb-2">{t("admin.courses.courseThumbnail")}</p>
								<label className="flex items-center gap-2 border border-dashed border-border rounded p-3 cursor-pointer hover:bg-accent/30">
									<UploadCloud className="text-muted-foreground" size={18} />
									<span className="text-sm text-muted-foreground">{thumbFile ? thumbFile.name : t("admin.courses.uploadThumbnail")}</span>
									<input className="hidden" type="file" accept="image/*" onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)} />
								</label>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<p className="text-sm text-muted-foreground">{t("admin.courses.courseMedia")}</p>
									<Button variant="outline" size="sm" onClick={() => setMediaItems((arr) => [...arr, { file: null, title: '', media_type: 'video', order: arr.length }])}><Plus size={14}/> {t("admin.courses.addMedia")}</Button>
								</div>
								<div className="space-y-2">
									{mediaItems.map((m, idx) => (
										<div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
											<label className="md:col-span-2 flex items-center gap-2 border border-dashed border-border rounded p-2 cursor-pointer hover:bg-accent/30">
												<UploadCloud className="text-muted-foreground" size={16} />
												<span className="text-xs text-muted-foreground truncate">{m.file ? (m.file as File).name : t("admin.common.choose") + ' ' + t("admin.courses.file")}</span>
												<input className="hidden" type="file" onChange={(e) => {
													const file = e.target.files?.[0] ?? null;
													setMediaItems((arr) => arr.map((it, i) => i === idx ? { ...it, file } : it));
												}} />
											</label>
											<input className="border rounded px-2 py-1 bg-background border-border text-foreground text-sm" placeholder={t("admin.courses.courseTitle")} value={m.title} onChange={(e) => setMediaItems((arr) => arr.map((it, i) => i === idx ? { ...it, title: e.target.value } : it))} />
											<select className="border rounded px-2 py-1 text-sm" value={m.media_type} onChange={(e) => setMediaItems((arr) => arr.map((it, i) => i === idx ? { ...it, media_type: e.target.value } : it))}>
												<option value="video">video</option>
												<option value="pdf">pdf</option>
												<option value="image">image</option>
												<option value="other">other</option>
											</select>
											<input className="border rounded px-2 py-1 w-20 text-sm bg-background border-border text-foreground" type="number" min={0} value={m.order} onChange={(e) => setMediaItems((arr) => arr.map((it, i) => i === idx ? { ...it, order: Number(e.target.value) } : it))} />
											<Button variant="destructive" size="sm" onClick={() => setMediaItems((arr) => arr.filter((_, i) => i !== idx))}>{t("admin.common.remove")}</Button>
										</div>
									))}
								</div>
							</div>

							<div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
								<Button variant="outline" disabled={creating} onClick={() => setShowCreate(false)}>{t("admin.common.cancel")}</Button>
								<Button disabled={creating} onClick={async () => {
									try {
										setCreating(true);
										const fd = new FormData();
										fd.append('title', form.title || '');
										fd.append('description', form.description || '');
										fd.append('status', form.status || 'draft');
										fd.append('price', String(form.price ?? 0));
										if (thumbFile) fd.append('thumbnail', thumbFile);
										const created = await adminCreateCourseMultipart(fd);
										const courseId = created.data?.id;
										if (courseId && mediaItems.length) {
											for (const item of mediaItems) {
												if (!item.file) continue;
												const mf = new FormData();
												mf.append('course', String(courseId));
												mf.append('file', item.file);
												mf.append('media_type', item.media_type || 'other');
												mf.append('title', item.title || (item.file as File).name);
												mf.append('order', String(item.order ?? 0));
												await createCourseMedia(courseId, mf);
											}
										}
										setShowCreate(false);
										setThumbFile(null);
										setMediaItems([]);
										setForm({ title: "", description: "", status: 'draft', price: 0 });
										qc.invalidateQueries({ queryKey: ['admin-courses'] });
									} catch (err) {
										console.error('Create course failed', err);
									} finally {
										setCreating(false);
									}
								}}>{t("admin.common.create")}</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</AdminLayout>
	);
}
