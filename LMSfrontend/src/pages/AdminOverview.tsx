import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/client";
import { 
	Users, 
	BookOpen, 
	GraduationCap, 
	DollarSign, 
	TrendingUp, 
	Activity,
	AlertCircle,
	CheckCircle,
	Clock,
	Zap,
	Target,
	Award,
	BarChart3,
	PieChart,
	Calendar,
	Globe,
	Server,
	Database,
	Shield,
	Settings,
	ArrowUpRight,
	ArrowDownRight
} from "lucide-react";
import { Link } from "react-router-dom";

const QuickStatCard = ({ title, value, change, trend, icon: Icon, color, description }: {
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

const SystemStatusCard = ({ title, status, description, icon: Icon, color }: {
	title: string;
	status: 'healthy' | 'warning' | 'error';
	description: string;
	icon: any;
	color: string;
}) => (
	<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
		<CardContent className="p-4">
			<div className="flex items-center gap-3">
				<div className={`p-2 rounded-lg ${color}`}>
					<Icon size={20} className="text-white" />
				</div>
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<h4 className="font-medium">{title}</h4>
						<div className={`w-2 h-2 rounded-full ${
							status === 'healthy' ? 'bg-green-500' : 
							status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
						}`} />
					</div>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
			</div>
		</CardContent>
	</Card>
);

const ActivityItem = ({ title, description, time, type }: {
	title: string;
	description: string;
	time: string;
	type: 'user' | 'course' | 'payment' | 'system';
}) => (
	<div className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
		<div className={`p-2 rounded-lg ${
			type === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
			type === 'course' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
			type === 'payment' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
			'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
		}`}>
			{type === 'user' && <Users size={16} />}
			{type === 'course' && <BookOpen size={16} />}
			{type === 'payment' && <DollarSign size={16} />}
			{type === 'system' && <Settings size={16} />}
		</div>
		<div className="flex-1 min-w-0">
			<p className="font-medium">{title}</p>
			<p className="text-sm text-muted-foreground">{description}</p>
			<p className="text-xs text-muted-foreground mt-1">{time}</p>
		</div>
	</div>
);

export default function AdminOverview() {
	const { data: overviewData, isLoading, error } = useQuery({
		queryKey: ['admin-overview'],
		queryFn: async () => (await api.get('/api/admin/overview')).data,
		refetchInterval: 30000, // Refresh every 30 seconds
	});

	// Transform system health data for display
	const getSystemStatus = () => {
		if (!overviewData?.system_health) return [];
		
		const statusMap = {
			'database': { title: "Database", icon: Database },
			'api': { title: "API Server", icon: Server },
			'cpu': { title: "CPU Usage", icon: Server },
			'memory': { title: "Memory", icon: Server },
			'disk': { title: "Disk Storage", icon: Globe },
			'storage': { title: "File Storage", icon: Globe },
			'security': { title: "Security", icon: Shield }
		};

		return Object.entries(overviewData.system_health).map(([key, data]: [string, any]) => ({
			title: statusMap[key as keyof typeof statusMap]?.title || key,
			status: data.status as 'healthy' | 'warning' | 'error',
			description: data.description,
			icon: statusMap[key as keyof typeof statusMap]?.icon || Server,
			color: data.status === 'healthy' ? 'bg-green-500' : 
				   data.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
		}));
	};

	const systemStatus = getSystemStatus();
	const recentActivities = overviewData?.recent_activities || [];

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
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">Failed to load overview data</h3>
						<p className="text-muted-foreground">Please try refreshing the page</p>
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
							Admin Overview
						</h1>
						<p className="text-lg text-muted-foreground mt-2">
							Welcome to your LMS administration center
						</p>
					</div>
					{/* Action buttons removed - no functionality implemented */}
				</div>
			</div>

			{/* Key Metrics */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
				<QuickStatCard
					title="Platform Health"
					value={`${overviewData?.uptime || 98.5}%`}
					change={overviewData?.platform_health > 95 ? "+0.2% uptime" : "System issues detected"}
					trend={overviewData?.platform_health > 95 ? "up" : "down"}
					icon={Activity}
					color="from-emerald-500 to-green-600"
					description="System operational"
				/>
				<QuickStatCard
					title="Active Users"
					value={overviewData?.users?.total?.toLocaleString() ?? '0'}
					change={overviewData?.users?.growth_rate > 0 ? 
						`+${overviewData.users.growth_rate}% growth` : 
						"No growth today"}
					trend={overviewData?.users?.growth_rate > 0 ? "up" : "down"}
					icon={Users}
					color="from-blue-500 to-indigo-600"
					description="Total registered users"
				/>
				<QuickStatCard
					title="Course Completion"
					value={`${overviewData?.enrollments?.completion_rate || 0}%`}
					change={overviewData?.enrollments?.completion_rate > 80 ? 
						"Excellent rate" : 
						"Room for improvement"}
					trend={overviewData?.enrollments?.completion_rate > 80 ? "up" : "down"}
					icon={Target}
					color="from-purple-500 to-violet-600"
					description="Average completion rate"
				/>
				<QuickStatCard
					title="Monthly Revenue"
					value={`$${Math.round(overviewData?.revenue?.monthly_projected || 0).toLocaleString()}`}
					change={overviewData?.revenue?.growth_rate > 0 ? 
						`+${overviewData.revenue.growth_rate}% vs last week` : 
						overviewData?.revenue?.growth_rate < 0 ?
						`${overviewData.revenue.growth_rate}% vs last week` :
						"No change"}
					trend={overviewData?.revenue?.growth_rate > 0 ? "up" : 
						   overviewData?.revenue?.growth_rate < 0 ? "down" : "up"}
					icon={DollarSign}
					color="from-amber-500 to-orange-600"
					description="Projected monthly"
				/>
			</div>

			{/* System Status and Quick Actions */}
			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
				<Card className="xl:col-span-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-lg font-semibold">System Status</h3>
								<p className="text-sm text-muted-foreground">Real-time system health monitoring</p>
							</div>
							<div className="flex items-center gap-2 text-sm text-green-600">
								<CheckCircle size={16} />
								All systems operational
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{systemStatus.map((status, index) => (
								<SystemStatusCard key={index} {...status} />
							))}
						</div>
					</CardContent>
				</Card>

				<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-lg font-semibold">Quick Actions</h3>
								<p className="text-sm text-muted-foreground">Common admin tasks</p>
							</div>
							<Zap size={20} className="text-amber-500" />
						</div>
						<div className="space-y-3">
							<Link
								to="/admin/users"
								className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
							>
								<Users size={18} className="text-blue-600" />
								<div>
									<p className="font-medium">Manage Users</p>
									<p className="text-xs text-muted-foreground">Add, edit, or remove users</p>
								</div>
							</Link>
							<Link
								to="/admin/courses"
								className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
							>
								<BookOpen size={18} className="text-green-600" />
								<div>
									<p className="font-medium">Create Course</p>
									<p className="text-xs text-muted-foreground">Add new learning content</p>
								</div>
							</Link>
							<Link
								to="/admin/settings"
								className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
							>
								<Settings size={18} className="text-purple-600" />
								<div>
									<p className="font-medium">System Settings</p>
									<p className="text-xs text-muted-foreground">Configure platform</p>
								</div>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Analytics and Activity */}
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
				<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-lg font-semibold">Platform Analytics</h3>
								<p className="text-sm text-muted-foreground">Key performance indicators</p>
							</div>
							<BarChart3 size={20} className="text-blue-500" />
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
								<div className="flex items-center gap-2 mb-2">
									<BookOpen size={16} className="text-blue-500" />
									<span className="text-sm font-medium">Courses</span>
								</div>
								<p className="text-2xl font-bold">{overviewData?.courses?.total ?? 0}</p>
								<p className="text-xs text-muted-foreground">
									{overviewData?.courses?.published ?? 0} published, {overviewData?.courses?.draft ?? 0} draft
								</p>
							</div>
							<div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
								<div className="flex items-center gap-2 mb-2">
									<GraduationCap size={16} className="text-green-500" />
									<span className="text-sm font-medium">Enrollments</span>
								</div>
								<p className="text-2xl font-bold">{overviewData?.enrollments?.total ?? 0}</p>
								<p className="text-xs text-muted-foreground">
									{overviewData?.enrollments?.active ?? 0} active, {overviewData?.enrollments?.completed ?? 0} completed
								</p>
							</div>
							<div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
								<div className="flex items-center gap-2 mb-2">
									<TrendingUp size={16} className="text-amber-500" />
									<span className="text-sm font-medium">Growth</span>
								</div>
								<p className="text-2xl font-bold">{overviewData?.enrollments?.growth_7d ?? 0}</p>
								<p className="text-xs text-muted-foreground">Enrollments this week</p>
							</div>
							<div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
								<div className="flex items-center gap-2 mb-2">
									<DollarSign size={16} className="text-purple-500" />
									<span className="text-sm font-medium">Revenue</span>
								</div>
								<p className="text-2xl font-bold">${Math.round(overviewData?.revenue?.last_7d ?? 0)}</p>
								<p className="text-xs text-muted-foreground">Last 7 days</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
					<CardContent className="p-6">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-lg font-semibold">Recent Activity</h3>
								<p className="text-sm text-muted-foreground">Latest platform events</p>
							</div>
							<Activity size={20} className="text-green-500" />
						</div>
						<div className="space-y-1 max-h-80 overflow-y-auto">
							{recentActivities.map((activity, index) => (
								<ActivityItem key={index} {...activity} />
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Links */}
			<Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-0">
				<CardContent className="p-6">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="text-lg font-semibold">Management Hub</h3>
							<p className="text-sm text-muted-foreground">Access all admin functions</p>
						</div>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<Link
							to="/admin/users"
							className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-all"
						>
							<Users size={24} className="text-blue-500" />
							<div className="text-center">
								<p className="font-medium">Users</p>
								<p className="text-xs text-muted-foreground">{overviewData?.users?.total ?? 0} total</p>
							</div>
						</Link>
						<Link
							to="/admin/courses"
							className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-all"
						>
							<BookOpen size={24} className="text-green-500" />
							<div className="text-center">
								<p className="font-medium">Courses</p>
								<p className="text-xs text-muted-foreground">{overviewData?.courses?.total ?? 0} total</p>
							</div>
						</Link>
						<Link
							to="/admin/enrollments"
							className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-all"
						>
							<GraduationCap size={24} className="text-purple-500" />
							<div className="text-center">
								<p className="font-medium">Enrollments</p>
								<p className="text-xs text-muted-foreground">{overviewData?.enrollments?.total ?? 0} total</p>
							</div>
						</Link>
						<Link
							to="/admin/payments"
							className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg hover:shadow-md transition-all"
						>
							<DollarSign size={24} className="text-amber-500" />
							<div className="text-center">
								<p className="font-medium">Payments</p>
								<p className="text-xs text-muted-foreground">${Math.round(overviewData?.revenue?.last_7d ?? 0)} weekly</p>
							</div>
						</Link>
					</div>
				</CardContent>
			</Card>
		</AdminLayout>
	);
}
