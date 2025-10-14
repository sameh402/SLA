import React, { useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { adminListPayments, adminUpdatePayment, adminDeletePayment } from "@/api/admin";
import { 
	CreditCard, 
	Search, 
	Filter,
	Calendar,
	Clock,
	User,
	BookOpen,
	TrendingUp,
	DollarSign,
	CheckCircle,
	XCircle,
	AlertCircle,
	Loader,
	Edit,
	Trash2,
	Eye,
	RefreshCw,
	ChevronLeft,
	ChevronRight,
	Receipt,
	BarChart3,
	PieChart,
	ArrowUpRight,
	ArrowDownRight,
	Plus,
	TrendingDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

type ApiList<T> = { count: number; results: T[] } | T[];
const isPaginated = <T,>(d: ApiList<T> | undefined): d is { count: number; results: T[] } => !!d && !Array.isArray(d) && 'results' in d;

const getStatusColor = (status: string) => {
	switch (status?.toLowerCase()) {
		case 'success':
		case 'completed':
			return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
		case 'pending':
			return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
		case 'failed':
		case 'cancelled':
			return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
		default:
			return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
	}
};

const getStatusIcon = (status: string) => {
	switch (status?.toLowerCase()) {
		case 'success':
		case 'completed':
			return <CheckCircle size={14} />;
		case 'pending':
			return <Loader size={14} className="animate-spin" />;
		case 'failed':
		case 'cancelled':
			return <XCircle size={14} />;
		default:
			return <AlertCircle size={14} />;
	}
};

const StatCard = ({ title, value, change, trend, icon: Icon, color, description }: {
	title: string;
	value: string | number;
	change?: string;
	trend?: 'up' | 'down';
	icon: any;
	color: string;
	description?: string;
}) => {
	// Parse color to get light and dark variants
	const [lightColor, darkColor] = color.includes('|') 
		? color.split('|') 
		: [color, color.replace('from-', 'from-').replace('to-', 'to-')];
	
	return (
		<Card className={`relative overflow-hidden bg-gradient-to-br ${lightColor} dark:bg-gradient-to-br dark:${darkColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
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
};

const PaymentCard = ({ payment, onEdit, onDelete, onView }: { 
	payment: any; 
	onEdit: (payment: any) => void;
	onDelete: (id: number) => void;
	onView: (payment: any) => void;
}) => {

	const formatAmount = (amount: number, currency: string = 'USD') => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency,
		}).format(amount);
	};

	return (
		<Card className="hover:shadow-md transition-all duration-200 border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
			<CardContent className="p-6">
				<div className="flex items-start justify-between">
					<div className="flex items-start gap-4 flex-1">
						<div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full flex items-center justify-center">
							{payment.user_name?.charAt(0) || payment.user?.toString().charAt(0) || 'U'}
						</div>
						
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 mb-2">
								<h4 className="font-semibold text-lg">
									{formatAmount(payment.amount, payment.currency)}
								</h4>
								<Badge className={`${getStatusColor(payment.payment_status)} flex items-center gap-1`}>
									{getStatusIcon(payment.payment_status)}
									{payment.payment_status}
								</Badge>
							</div>
							
							<div className="space-y-2 text-sm text-muted-foreground">
								<div className="flex items-center gap-4">
									<span className="flex items-center gap-1">
										<User size={14} />
										{payment.user_name || `User #${payment.user}`}
									</span>
									<span className="flex items-center gap-1">
										<Receipt size={14} />
										#{payment.transaction_id || payment.id}
									</span>
								</div>
								
								<div className="flex items-center gap-4">
									<Link 
										to={`/admin/courses/${payment.course_id}`}
										className="flex items-center gap-1 hover:text-primary transition-colors"
									>
										<BookOpen size={14} />
										{payment.course_title || `Course #${payment.course}`}
									</Link>
									<span className="flex items-center gap-1">
										<Calendar size={14} />
										{new Date(payment.created_at || Date.now()).toLocaleDateString()}
									</span>
								</div>

							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center gap-2 ml-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => onEdit(payment)}
							className="h-8 w-8 p-0"
						>
							<Edit size={14} />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => onView(payment)}
							className="h-8 w-8 p-0"
						>
							<Eye size={14} />
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => onDelete(payment.id)}
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

export default function AdminPayments() {
	const { t } = useI18n();
	const qc = useQueryClient();
	const [statusFilter, setStatusFilter] = useState("");
	const [createdAfter, setCreatedAfter] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(1);
	const [form, setForm] = useState<any>({ payment_status: 'success' });
	const [editingId, setEditingId] = useState<number | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [viewPayment, setViewPayment] = useState<any>(null);
	const [showViewModal, setShowViewModal] = useState(false);

	const { data, isLoading, error, refetch } = useQuery<ApiList<any>>({
		queryKey: ['admin-payments', statusFilter, createdAfter, searchQuery, page],
		queryFn: async () => (await adminListPayments({ 
			payment_status: statusFilter, 
			created_at__date__gte: createdAfter,
			search: searchQuery,
			page 
		})).data,
		keepPreviousData: true,
	});

	const updateMut = useMutation({
		mutationFn: ({ id, payload }: any) => adminUpdatePayment(id, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['admin-payments'] });
			setShowEditModal(false);
			setEditingId(null);
		},
	});

	const deleteMut = useMutation({
		mutationFn: (id: number) => adminDeletePayment(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-payments'] }),
	});

	const payments: any[] = useMemo(() => (isPaginated<any>(data) ? data.results : (data ?? [])), [data]);
	const count: number = useMemo(() => (isPaginated<any>(data) ? data.count : payments.length), [data, payments.length]);
	const pageSize = 10;
	const totalPages = Math.max(1, Math.ceil(count / pageSize));

	// Calculate statistics
	const stats = useMemo(() => {
		if (!payments || payments.length === 0) {
			return {
				total: 0,
				successful: 0,
				pending: 0,
				failed: 0,
				totalRevenue: 0
			};
		}

		const successful = payments.filter(p => p.payment_status === 'success').length;
		const pending = payments.filter(p => p.payment_status === 'pending').length;
		const failed = payments.filter(p => p.payment_status === 'failed').length;
		const totalRevenue = payments
			.filter(p => p.payment_status === 'success')
			.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

		return {
			total: count || 0,
			successful,
			pending,
			failed,
			totalRevenue
		};
	}, [payments, count]);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (editingId) {
			await updateMut.mutateAsync({ id: editingId, payload: form });
		}
		setForm({ payment_status: 'success' });
	};

	const handleEdit = (payment: any) => {
		setEditingId(payment.id);
		setForm({ 
			payment_status: payment.payment_status
		});
		setShowEditModal(true);
	};
	
	const handleView = (payment: any) => {
		setViewPayment(payment);
		setShowViewModal(true);
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
						<h3 className="text-lg font-semibold mb-2">{t("admin.payments.failedToLoadPayments")}</h3>
						<p className="text-muted-foreground mb-4">{t("admin.users.tryRefreshing")}</p>
						<Button onClick={() => refetch()}>
							<RefreshCw size={16} className="mr-2" />
{t("common.retry")}
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
							{t("admin.payments.paymentsManagement")}
						</h1>
						<p className="text-lg text-muted-foreground mt-2">
							{t("admin.payments.monitorTransactions")}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
							<RefreshCw size={16} />
{t("admin.common.refresh")}
						</Button>
						<Button className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80">
							<Plus size={16} />
							{t("admin.payments.manualPayment")}
						</Button>
					</div>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
				<StatCard
					title={t("admin.payments.totalRevenue")}
					value={`$${stats.totalRevenue.toLocaleString()}`}
					change={t("admin.payments.monthlyIncrease")}
					trend="up"
					icon={DollarSign}
					color="from-green-500 to-emerald-600|from-green-600 to-emerald-700"
					description={t("admin.payments.successfulPayments")}
				/>
				<StatCard
					title={t("admin.payments.successfulPayments")}
					value={stats.successful.toLocaleString()}
					change={t("admin.payments.successRate")}
					trend="up"
					icon={CheckCircle}
					color="from-blue-500 to-indigo-600|from-blue-600 to-indigo-700"
					description={t("admin.payments.completedTransactions")}
				/>
				<StatCard
					title={t("admin.payments.pendingPayments")}
					value={stats.pending.toLocaleString()}
					change={stats.pending > 10 ? t("admin.payments.highVolume") : t("admin.payments.normalVolume")}
					trend={stats.pending > 10 ? "down" : "up"}
					icon={Loader}
					color="from-amber-500 to-orange-600|from-amber-600 to-orange-700"
					description={t("admin.payments.awaitingProcessing")}
				/>
				<StatCard
					title={t("admin.payments.failedPayments")}
					value={stats.failed.toLocaleString()}
					change={`${((stats.failed / stats.total) * 100).toFixed(1)}% ${t("admin.payments.failureRate")}`}
					trend="down"
					icon={XCircle}
					color="from-red-500 to-rose-600|from-red-600 to-rose-700"
					description={t("admin.payments.requiresAttention")}
				/>
			</div>

			{/* Filters and Search */}
			<Card className="mb-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter size={20} />
						{t("admin.payments.filtersSearch")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4">
						<form onSubmit={handleSearch} className="flex-1 flex gap-2">
							<div className="relative flex-1">
								<Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder={t("admin.payments.searchByUserCourse")}
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
							<Button type="submit" variant="outline">
								{t("admin.common.search")}
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
								<option value="">{t("admin.payments.allStatus")}</option>
								<option value="success">{t("admin.payments.success")}</option>
								<option value="pending">{t("admin.payments.pending")}</option>
								<option value="failed">{t("admin.payments.failed")}</option>
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

			{/* Payments List */}
			<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<CreditCard size={20} />
							{t("admin.payments.payments")}
						</div>
						<Badge variant="outline">
							{count} {t("admin.common.total")}
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{payments.length === 0 ? (
						<div className="text-center py-12">
							<CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">{t("admin.payments.noPaymentsFound")}</h3>
							<p className="text-muted-foreground mb-4">
								{(statusFilter || createdAfter || searchQuery) 
									? t("admin.payments.adjustFilters") 
									: t("admin.payments.noPaymentsYet")}
							</p>
							{!(statusFilter || createdAfter || searchQuery) && (
								<div className="flex flex-col sm:flex-row gap-2 justify-center">
									<Button variant="outline" asChild>
										<Link to="/admin/courses">{t("admin.payments.viewCourses")}</Link>
									</Button>
									<Button variant="outline" asChild>
										<Link to="/admin/enrollments">{t("admin.payments.viewEnrollments")}</Link>
									</Button>
								</div>
							)}
						</div>
					) : (
						<div className="space-y-4">
							{payments.map((payment) => (
								<PaymentCard 
									key={payment.id} 
									payment={payment}
									onEdit={handleEdit}
									onView={handleView}
									onDelete={(id) => deleteMut.mutate(id)}
								/>
							))}
						</div>
					)}

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between mt-8 pt-6 border-t">
							<div className="text-sm text-muted-foreground">
								{t("admin.common.showing")} {((page - 1) * pageSize) + 1} {t("admin.common.to")}{' '}
								{Math.min(page * pageSize, count)} {t("admin.common.of")}{' '}
								{count} {t("admin.payments.payments").toLowerCase()}
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage(p => Math.max(1, p - 1))}
									disabled={page <= 1}
								>
									<ChevronLeft size={16} />
{t("admin.common.previous")}
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
{t("admin.common.next")}
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
							<CardTitle>{t("admin.payments.editPayment")}</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={onSubmit} className="space-y-4">
								<div>
									<label className="text-sm font-medium">{t("admin.payments.paymentStatus")}</label>
									<select 
										className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
										value={form.payment_status} 
										onChange={(e) => setForm({...form, payment_status: e.target.value})}
									>
										<option value="success">{t("admin.payments.success")}</option>
										<option value="pending">{t("admin.payments.pending")}</option>
										<option value="failed">{t("admin.payments.failed")}</option>
									</select>
								</div>
								<div className="flex gap-2 pt-4">
									<Button type="submit" disabled={updateMut.isPending} className="flex-1">
										{updateMut.isPending ? t("admin.payments.updating") : t("admin.common.update")}
									</Button>
									<Button 
										type="button" 
										variant="outline" 
										onClick={() => setShowEditModal(false)}
										className="flex-1"
									>
										{t("admin.common.cancel")}
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			)}

			{/* View Payment Details Modal */}
			{showViewModal && viewPayment && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<Card className="w-full max-w-2xl mx-4 overflow-hidden">
						<CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<Receipt size={20} />
									{t("admin.payments.viewPaymentDetails")}
								</CardTitle>
								<Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
									#{viewPayment.transaction_id || viewPayment.id}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div className="space-y-6">
									<div>
										<h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
											<DollarSign size={18} className="text-green-500" />
											{t("admin.payments.paymentInformation")}
										</h3>
										<div className="space-y-3">
											<div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
												<span className="text-sm text-muted-foreground">{t("admin.payments.amount")}</span>
												<span className="font-medium">{new Intl.NumberFormat('en-US', {
													style: 'currency',
													currency: viewPayment.currency || 'USD'
												}).format(viewPayment.amount || 0)}</span>
											</div>
											<div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
												<span className="text-sm text-muted-foreground">{t("admin.payments.status")}</span>
												<Badge className={`${getStatusColor(viewPayment.payment_status)} flex items-center gap-1`}>
													{getStatusIcon(viewPayment.payment_status)}
													{viewPayment.payment_status}
												</Badge>
											</div>
											<div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
												<span className="text-sm text-muted-foreground">{t("admin.payments.transactionId")}</span>
												<span className="font-medium font-mono text-xs">{viewPayment.transaction_id || 'N/A'}</span>
											</div>
											<div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
												<span className="text-sm text-muted-foreground">{t("admin.payments.paymentDate")}</span>
												<span className="font-medium">{new Date(viewPayment.created_at || Date.now()).toLocaleString()}</span>
											</div>
										</div>
									</div>

									<div>
										<h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
											<BookOpen size={18} className="text-blue-500" />
											{t("admin.payments.courseInformation")}
										</h3>
										<div className="space-y-3">
											<div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
												<span className="text-sm text-muted-foreground">{t("admin.payments.course")}</span>
												<Link 
													to={`/admin/courses/${viewPayment.course_id || viewPayment.course}`}
													className="font-medium text-primary hover:underline"
												>
													{viewPayment.course_title || `Course #${viewPayment.course_id || viewPayment.course}`}
												</Link>
											</div>
											<div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
												<span className="text-sm text-muted-foreground">Course ID</span>
												<span className="font-medium">{viewPayment.course_id || viewPayment.course}</span>
											</div>
										</div>
									</div>
								</div>

								<div className="space-y-6">
									<div>
										<h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
											<User size={18} className="text-purple-500" />
											{t("admin.payments.userInformation")}
										</h3>
										<div className="space-y-3">
											<div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
												<span className="text-sm text-muted-foreground">{t("admin.payments.user")}</span>
												<Link 
													to={`/admin/users/${viewPayment.user_id || viewPayment.user}`}
													className="font-medium text-primary hover:underline"
												>
													{viewPayment.user_name || `User #${viewPayment.user_id || viewPayment.user}`}
												</Link>
											</div>
											<div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
												<span className="text-sm text-muted-foreground">User ID</span>
												<span className="font-medium">{viewPayment.user_id || viewPayment.user}</span>
											</div>
										</div>
									</div>

									<div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
										<h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
											<AlertCircle size={18} className="text-amber-500" />
											{t("admin.payments.actions")}
										</h3>
										<div className="flex flex-col gap-2">
											<Button 
												onClick={() => {
													setShowViewModal(false);
													handleEdit(viewPayment);
												}}
												className="flex items-center gap-2 w-full justify-center"
											>
												<Edit size={16} />
{t("admin.payments.editPaymentStatus")}
											</Button>
											<Button 
												variant="outline" 
												onClick={() => setShowViewModal(false)}
												className="flex items-center gap-2 w-full justify-center"
											>
{t("admin.payments.close")}
											</Button>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</AdminLayout>
	);
}