import React, { useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient, useMutation, keepPreviousData } from "@tanstack/react-query";
import { adminListEnrollments, adminUpdateEnrollment, adminDeleteEnrollment } from "@/api/admin";
import { 
	GraduationCap, 
	Search, 
	Filter,
	Calendar,
	Clock,
	User,
	BookOpen,
	TrendingUp,
	Award,
	CheckCircle,
	XCircle,
	AlertCircle,
	Edit,
	Trash2,
	Eye,
	RefreshCw,
	ChevronLeft,
	ChevronRight,
	Users,
	BarChart3,
	PieChart,
	ArrowUpRight,
	ArrowDownRight,
	Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

type ApiList<T> = { count: number; results: T[] } | T[];
const isPaginated = (d: any): d is { count: number; results: any[] } => !!d && !Array.isArray(d) && 'results' in d;

const StatCard = ({ title, value, change, trend, icon: Icon, color, description }: {
	title: string;
	value: string | number;
	change?: string;
	trend?: 'up' | 'down';
	icon: any;
	color: string;
	description?: string;
}) => (
	<Card className={`relative overflow-hidden bg-gradient-to-br ${color} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
		<CardContent className="p-6">
			<div className="flex items-start justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Icon size={20} className="text-white/80" />
						<p className="text-sm font-medium text-white/90">{title}</p>
					</div>
					<p className="text-3xl font-bold text-white">{value}</p>
					{change && (
						<div className={`flex items-center gap-1 text-sm font-medium text-white/90`}>
							{trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
							{change}
						</div>
					)}
					{description && (
						<p className="text-xs text-white/70">{description}</p>
					)}
				</div>
				<div className="p-2 bg-white/20 rounded-lg">
					<Icon size={24} className="text-white" />
				</div>
			</div>
		</CardContent>
	</Card>
);

const EnrollmentCard = ({ enrollment, onEdit, onDelete }: { 
	enrollment: any; 
	onEdit: (enrollment: any) => void;
	onDelete: (id: number) => void;
}) => {
	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'completed':
				return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
			case 'active':
				return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
			case 'inactive':
				return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
			case 'cancelled':
				return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
			default:
				return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
		}
	};

	const getProgressColor = (progress: number) => {
		if (progress >= 80) return 'bg-green-500';
		if (progress >= 50) return 'bg-blue-500';
		if (progress >= 25) return 'bg-yellow-500';
		return 'bg-gray-500';
	};

	return (
		<Card className="hover:shadow-md transition-all duration-200 border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
			<CardContent className="p-6">
				<div className="flex items-start justify-between">
					<div className="flex items-start gap-4 flex-1">
						<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center">
							{enrollment.user_name?.charAt(0) || enrollment.user?.toString().charAt(0) || 'U'}
						</div>
						
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 mb-2">
								<h4 className="font-semibold text-lg">
									{enrollment.user_name || `User #${enrollment.user}`}
								</h4>
								<Badge className={getStatusColor(enrollment.status)}>
									{enrollment.status}
								</Badge>
							</div>
							
							<div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
								<Link 
									to={`/admin/courses/${enrollment.course_id}`}
									className="flex items-center gap-1 hover:text-primary transition-colors"
								>
									<BookOpen size={14} />
									{enrollment.course_title || `Course #${enrollment.course}`}
								</Link>
								<span className="flex items-center gap-1">
									<Calendar size={14} />
									{new Date(enrollment.created_at || Date.now()).toLocaleDateString()}
								</span>
							</div>

							{/* Progress Bar */}
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Progress</span>
									<span className="font-medium">{enrollment.progress || 0}%</span>
								</div>
								<div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
									<div 
										className={`h-full transition-all duration-300 ${getProgressColor(enrollment.progress || 0)}`}
										style={{ width: `${Math.max(0, Math.min(100, enrollment.progress || 0))}%` }}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center gap-2 ml-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => onEdit(enrollment)}
							className="h-8 w-8 p-0"
						>
							<Edit size={14} />
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="h-8 w-8 p-0"
						>
							<Eye size={14} />
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => onDelete(enrollment.id)}
							className="h-8 w-8 p-0"
						>
							<Trash2 size={14} />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default function AdminEnrollments() {
	const { t } = useI18n();
	const qc = useQueryClient();
	const [statusFilter, setStatusFilter] = useState("");
	const [createdAfter, setCreatedAfter] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [form, setForm] = useState<any>({ status: 'active', progress: 0 });
	const [editingId, setEditingId] = useState<number | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);

	const { data, isLoading, error, refetch } = useQuery<ApiList<any>>({
		queryKey: ['admin-enrollments', statusFilter, createdAfter, searchQuery, page],
		queryFn: async () => (await adminListEnrollments({ 
			status: statusFilter, 
			created_at__date__gte: createdAfter, 
			search: searchQuery,
			page 
		})).data,
		placeholderData: keepPreviousData,
	});

	const updateMut = useMutation({
		mutationFn: ({ id, payload }: any) => adminUpdateEnrollment(id, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['admin-enrollments'] });
			setShowEditModal(false);
			setEditingId(null);
		},
	});

	const deleteMut = useMutation({
		mutationFn: (id: number) => adminDeleteEnrollment(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-enrollments'] }),
	});

	const enrollments: any[] = useMemo(() => (isPaginated(data) ? data.results : (data ?? [])), [data]);
	const count: number = useMemo(() => (isPaginated(data) ? data.count : enrollments.length), [data, enrollments.length]);
	const pageSize = 10;
	const totalPages = Math.max(1, Math.ceil(count / pageSize));

	// Calculate statistics
	const stats = useMemo(() => {
		if (!enrollments || enrollments.length === 0) {
			return {
				total: 0,
				completed: 0,
				active: 0,
				avgProgress: 0
			};
		}

		const completed = enrollments.filter(e => e.status === 'completed').length;
		const active = enrollments.filter(e => e.status === 'active').length;
		const avgProgress = enrollments.length > 0 
			? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length 
			: 0;

		return {
			total: count || 0,
			completed,
			active,
			avgProgress: Math.round(avgProgress)
		};
	}, [enrollments, count]);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (editingId) {
			await updateMut.mutateAsync({ id: editingId, payload: form });
		}
		setForm({ status: 'active', progress: 0 });
	};

	const handleEdit = (enrollment: any) => {
		setEditingId(enrollment.id);
		setForm({ 
			status: enrollment.status, 
			progress: enrollment.progress || 0 
		});
		setShowEditModal(true);
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(1);
	};

	if (isLoading) {
		return (
			<AdminLayout>
				<div className="space-y-8">
					<div className="animate-pulse">
						<div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl mb-8" />
						<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
							))}
						</div>
						<div className="space-y-4">
							{[...Array(5)].map((_, i) => (
								<div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
							))}
						</div>
					</div>
				</div>
			</AdminLayout>
		);
	}

	if (error) {
		return (
			<AdminLayout>
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">Failed to load enrollment data</h3>
						<p className="text-muted-foreground mb-4">Please try refreshing the page</p>
						<Button onClick={() => refetch()}>
							<RefreshCw size={16} className="mr-2" />
							Retry
						</Button>
					</div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			{/* Header Section */}
			<div className="mb-8">
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
					<div>
						<h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
							{t("admin.enrollments.enrollmentManagement")}
						</h1>
						<p className="text-lg text-muted-foreground mt-2">
							{t("admin.enrollments.trackManageEnrollments")}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
							<RefreshCw size={16} />
{t("admin.common.refresh")}
						</Button>
						<Button className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80">
							<Plus size={16} />
{t("admin.enrollments.newEnrollment")}
						</Button>
					</div>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
				<StatCard
					title={t("admin.enrollments.totalEnrollments")}
					value={stats.total.toLocaleString()}
					change="+12% this month"
					trend="up"
					icon={GraduationCap}
					color="from-blue-500 to-indigo-600"
					description="All-time enrollments"
				/>
				<StatCard
					title="Active Students"
					value={stats.active.toLocaleString()}
					change="+8% this week"
					trend="up"
					icon={Users}
					color="from-green-500 to-emerald-600"
					description="Currently enrolled"
				/>
				<StatCard
					title="Completed Courses"
					value={stats.completed.toLocaleString()}
					change="+15% completion rate"
					trend="up"
					icon={Award}
					color="from-purple-500 to-violet-600"
					description="Successfully finished"
				/>
				<StatCard
					title="Average Progress"
					value={`${stats.avgProgress}%`}
					change="+5% improvement"
					trend="up"
					icon={TrendingUp}
					color="from-amber-500 to-orange-600"
					description="Across all courses"
				/>
			</div>

			{/* Filters and Search */}
			<Card className="mb-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter size={20} />
						Filters & Search
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4">
						<form onSubmit={handleSearch} className="flex-1 flex gap-2">
							<div className="relative flex-1">
								<Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Search by user, course, or email..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
							<Button type="submit" variant="outline">
								Search
							</Button>
						</form>
						
						<div className="flex gap-2">
							<select 
								className="h-10 w-40 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
								value={statusFilter} 
								onChange={(e) => {
									setStatusFilter(e.target.value);
									setPage(1);
								}}
							>
								<option value="">All Status</option>
								<option value="active">Active</option>
								<option value="completed">Completed</option>
								<option value="inactive">Inactive</option>
								<option value="cancelled">Cancelled</option>
							</select>

							<div className="relative">
								<Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
								<Input
									type="date"
									value={createdAfter}
									onChange={(e) => {
										setCreatedAfter(e.target.value);
										setPage(1);
									}}
									className="pl-10 w-40"
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Enrollments List */}
			<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<GraduationCap size={20} />
							Enrollments
						</div>
						<Badge variant="outline">
							{count} total
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{enrollments.length === 0 ? (
						<div className="text-center py-12">
							<GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">No enrollments found</h3>
							<p className="text-muted-foreground mb-4">
								{(statusFilter || createdAfter || searchQuery) 
									? "Try adjusting your filters or search criteria" 
									: "No students have enrolled in courses yet. Enrollments will appear here once students start joining courses."}
							</p>
							{!(statusFilter || createdAfter || searchQuery) && (
								<div className="flex flex-col sm:flex-row gap-2 justify-center">
									<Button variant="outline" asChild>
										<Link to="/admin/courses">View Courses</Link>
									</Button>
									<Button variant="outline" asChild>
										<Link to="/admin/users">Manage Users</Link>
									</Button>
								</div>
							)}
						</div>
					) : (
						<div className="space-y-4">
							{enrollments.map((enrollment) => (
								<EnrollmentCard 
									key={enrollment.id} 
									enrollment={enrollment}
									onEdit={handleEdit}
									onDelete={(id) => deleteMut.mutate(id)}
								/>
							))}
						</div>
					)}

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between mt-8 pt-6 border-t">
							<div className="text-sm text-muted-foreground">
								Showing {((page - 1) * pageSize) + 1} to{' '}
								{Math.min(page * pageSize, count)} of{' '}
								{count} enrollments
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(p => Math.max(1, p - 1))}
									disabled={page <= 1}
								>
									<ChevronLeft size={16} />
									Previous
								</Button>
								<div className="flex items-center gap-1">
									{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
										const pageNum = i + 1;
										return (
											<Button
												key={pageNum}
												variant={pageNum === page ? "default" : "outline"}
												size="sm"
												onClick={() => setPage(pageNum)}
											>
												{pageNum}
											</Button>
										);
									})}
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(p => Math.min(totalPages, p + 1))}
									disabled={page >= totalPages}
								>
									Next
									<ChevronRight size={16} />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Edit Modal */}
			{showEditModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<Card className="w-full max-w-md mx-4">
						<CardHeader>
							<CardTitle>Edit Enrollment</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={onSubmit} className="space-y-4">
								<div>
									<label className="text-sm font-medium">Status</label>
									<select 
										className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
										value={form.status} 
										onChange={(e) => setForm({...form, status: e.target.value})}
									>
										<option value="active">Active</option>
										<option value="completed">Completed</option>
										<option value="inactive">Inactive</option>
										<option value="cancelled">Cancelled</option>
									</select>
								</div>
								<div>
									<label className="text-sm font-medium">Progress (%)</label>
									<Input
										type="number"
										min="0"
										max="100"
										value={form.progress}
										onChange={(e) => setForm({...form, progress: parseInt(e.target.value) || 0})}
									/>
								</div>
								<div className="flex gap-2 pt-4">
									<Button type="submit" disabled={updateMut.isPending} className="flex-1">
										{updateMut.isPending ? 'Updating...' : 'Update'}
									</Button>
									<Button 
										type="button" 
										variant="outline" 
										onClick={() => setShowEditModal(false)}
										className="flex-1"
									>
										Cancel
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			)}
		</AdminLayout>
	);
}