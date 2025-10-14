import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/api/client";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { 
	Users, 
	BookOpen, 
	GraduationCap, 
	DollarSign, 
	TrendingUp, 
	CheckCircle2, 
	Clock3,
	ArrowUpRight,
	ArrowDownRight,
	Activity,
	Target,
	Zap,
	Award
} from "lucide-react";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	AreaChart,
	Area,
	BarChart,
	Bar,
} from 'recharts';

const StatCard = ({ title, value, change, icon: Icon, trend, color }: {
	title: string;
	value: string | number;
	change?: string;
	icon: any;
	trend?: 'up' | 'down';
	color: string;
}) => {
	// Parse color to get light and dark variants
	const [lightColor, darkColor] = color.includes('|') 
		? color.split('|') 
		: [color, color];
		
	return (
		<Card className="relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
			<div className={`absolute inset-0 bg-gradient-to-br ${lightColor} dark:bg-gradient-to-br dark:${darkColor} opacity-5`} />
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<p className="text-sm font-medium text-muted-foreground">{title}</p>
						<p className="text-3xl font-bold tracking-tight">{value}</p>
						{change && (
							<div className={`flex items-center gap-1 text-sm font-medium ${
								trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
							}`}>
								{trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
								{change}
							</div>
						)}
					</div>
					<div className={`p-3 rounded-xl ${lightColor.replace('to-', 'to-transparent ')} dark:${darkColor.replace('to-', 'to-transparent ')}`}>
						<Icon size={24} className="text-white" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default function AdminDashboard() {
	const { t } = useI18n();
	const { data, isLoading, error } = useQuery({
		queryKey: ['admin-summary'],
		queryFn: async () => (await api.get('/api/admin/summary')).data,
	});

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
					</div>
				</div>
			</AdminLayout>
		);
	}

	if (error) {
		return (
			<AdminLayout>
				<Card className="p-8 text-center">
					<div className="text-red-500 mb-4">⚠️</div>
					<h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>
					<p className="text-muted-foreground">Please try refreshing the page</p>
				</Card>
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
							{t("admin.dashboard.title")}
						</h1>
						<p className="text-lg text-muted-foreground mt-2">
							{t("admin.dashboard.subtitle")}
						</p>
					</div>
					{/* Action buttons removed - no functionality implemented */}
				</div>
			</div>

			{data && (
				<div className="space-y-8">
					{/* Key Metrics */}
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
						<StatCard
							title={t("admin.dashboard.totalUsers")}
							value={data.users?.toLocaleString() ?? '0'}
							change={t("admin.dashboard.totalUsersChange")}
							trend="up"
							icon={Users}
							color="from-blue-500 to-blue-600|from-blue-600 to-blue-700"
						/>
						<StatCard
							title={t("admin.dashboard.activeCourses")}
							value={`${data.courses?.published ?? 0}/${(data.courses?.published ?? 0) + (data.courses?.draft ?? 0)}`}
							change={t("admin.dashboard.activeCoursesChange")}
							trend="up"
							icon={BookOpen}
							color="from-emerald-500 to-emerald-600|from-emerald-600 to-emerald-700"
						/>
						<StatCard
							title={t("admin.dashboard.totalEnrollments")}
							value={(data.enrollments?.active + data.enrollments?.completed)?.toLocaleString() ?? '0'}
							change={t("admin.dashboard.totalEnrollmentsChange")}
							trend="up"
							icon={GraduationCap}
							color="from-purple-500 to-purple-600|from-purple-600 to-purple-700"
						/>
						<StatCard
							title={t("admin.dashboard.revenue7d")}
							value={`$${Number(data.revenue?.last_7_days ?? 0).toLocaleString()}`}
							change={t("admin.dashboard.revenueChange")}
							trend="up"
							icon={DollarSign}
							color="from-amber-500 to-amber-600|from-amber-600 to-amber-700"
						/>
					</div>

					{/* Additional Stats */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
							<CardContent className="p-6">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-orange-500 rounded-xl">
										<Clock3 size={20} className="text-white" />
									</div>
									<div>
										<p className="text-sm font-medium text-orange-800 dark:text-orange-200">{t("admin.dashboard.pendingPayments")}</p>
										<p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
											{(data.payments_by_status || []).find((p: any) => p.payment_status === 'pending')?.count || 0}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
							<CardContent className="p-6">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-green-500 rounded-xl">
										<Target size={20} className="text-white" />
									</div>
									<div>
										<p className="text-sm font-medium text-green-800 dark:text-green-200">{t("admin.dashboard.completionRate")}</p>
										<p className="text-2xl font-bold text-green-900 dark:text-green-100">87%</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-200 dark:border-indigo-800">
							<CardContent className="p-6">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-indigo-500 rounded-xl">
										<Zap size={20} className="text-white" />
									</div>
									<div>
										<p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">{t("admin.dashboard.activeSessions")}</p>
										<p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">1,247</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Charts Section */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<Card className="lg:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-6">
									<div>
										<h3 className="text-lg font-semibold">Revenue Trend</h3>
										<p className="text-sm text-muted-foreground">Daily revenue over the last 7 days</p>
									</div>
									<div className="flex items-center gap-2 text-sm text-emerald-600">
										<TrendingUp size={16} />
										+15.3%
									</div>
								</div>
								<div className="h-64">
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart data={(data.daily_revenue || []).map((d: any) => ({ 
											day: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
											total: d.total 
										}))}>
											<defs>
												<linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
													<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
													<stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
												</linearGradient>
											</defs>
											<CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
											<XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
											<YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
											<Tooltip 
												contentStyle={{ 
													backgroundColor: 'rgba(255, 255, 255, 0.95)', 
													border: 'none', 
													borderRadius: '8px',
													boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
												}} 
											/>
											<Area 
												type="monotone" 
												dataKey="total" 
												stroke="#f59e0b" 
												fill="url(#revenueGradient)"
												strokeWidth={3}
											/>
										</AreaChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-6">
									<div>
										<h3 className="text-lg font-semibold">Payment Status</h3>
										<p className="text-sm text-muted-foreground">Current payment distribution</p>
									</div>
									<CheckCircle2 size={20} className="text-green-500" />
								</div>
								<div className="h-64">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={(data.payments_by_status || []).map((p: any) => ({ 
											status: p.payment_status, 
											count: p.count 
										}))}>
											<CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
											<XAxis dataKey="status" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
											<YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
											<Tooltip 
												contentStyle={{ 
													backgroundColor: 'rgba(255, 255, 255, 0.95)', 
													border: 'none', 
													borderRadius: '8px',
													boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
												}} 
											/>
											<Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
										</BarChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>
					</div>

					<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-6">
								<div>
									<h3 className="text-lg font-semibold">Enrollment Activity</h3>
									<p className="text-sm text-muted-foreground">Daily enrollments over the last 7 days</p>
								</div>
								<Activity size={20} className="text-blue-500" />
							</div>
							<div className="h-64">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={(data.daily_enrollments || []).map((d: any) => ({ 
										day: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
										count: d.count 
									}))}>
										<CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
										<XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
										<YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
										<Tooltip 
											contentStyle={{ 
												backgroundColor: 'rgba(255, 255, 255, 0.95)', 
												border: 'none', 
												borderRadius: '8px',
												boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
											}} 
										/>
										<Line 
											type="monotone" 
											dataKey="count" 
											stroke="#3b82f6" 
											strokeWidth={3}
											dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
											activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>

					{/* Data Tables */}
					<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
						<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-lg font-semibold">Recent Enrollments</h3>
									<Award size={20} className="text-purple-500" />
								</div>
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-slate-200 dark:border-slate-700">
												<th className="text-left py-3 font-medium text-muted-foreground">User</th>
												<th className="text-left py-3 font-medium text-muted-foreground">Course</th>
												<th className="text-left py-3 font-medium text-muted-foreground">Status</th>
												<th className="text-left py-3 font-medium text-muted-foreground">Date</th>
											</tr>
										</thead>
										<tbody>
											{data.recent_enrollments?.map((e: any) => (
												<tr key={e.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
													<td className="py-3">#{e.user_id}</td>
													<td className="py-3">#{e.course_id}</td>
													<td className="py-3">
														<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
															e.status === 'active' 
																? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
																: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
														}`}>
															{e.status}
														</span>
													</td>
													<td className="py-3 text-muted-foreground">
														{new Date(e.created_at).toLocaleDateString()}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-6">
									<h3 className="text-lg font-semibold">Top Performing Courses</h3>
									<TrendingUp size={20} className="text-green-500" />
								</div>
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-slate-200 dark:border-slate-700">
												<th className="text-left py-3 font-medium text-muted-foreground">Course</th>
												<th className="text-right py-3 font-medium text-muted-foreground">Enrollments</th>
											</tr>
										</thead>
										<tbody>
											{(data.top_courses || []).map((c: any) => (
												<tr key={c.course_id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
													<td className="py-3 font-medium">
														{c["course__title"] ?? `Course #${c.course_id}`}
													</td>
													<td className="py-3 text-right">
														<span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs font-semibold">
															{c.enrolls}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
								
								<div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
									<div className="flex flex-wrap gap-3">
										<a 
											href="/admin/users" 
											className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm font-medium shadow-lg shadow-blue-500/25"
										>
											<Users size={16} className="mr-2" />
											Manage Users
										</a>
										<a 
											href="/admin/courses" 
											className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all text-sm font-medium shadow-lg shadow-emerald-500/25"
										>
											<BookOpen size={16} className="mr-2" />
											Manage Courses
										</a>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			)}
		</AdminLayout>
	);
}
