import React, { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/client";
import { 
	Activity,
	Users, 
	BookOpen, 
	GraduationCap, 
	DollarSign,
	Search,
	Filter,
	Calendar,
	Clock,
	User,
	CheckCircle,
	XCircle,
	AlertCircle,
	TrendingUp,
	Eye,
	RefreshCw,
	BarChart3,
	PieChart,
	ArrowUpRight,
	ArrowDownRight,
	ChevronLeft,
	ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface ActivityItem {
	id: string;
	type: 'user' | 'course' | 'enrollment' | 'payment';
	action: string;
	title: string;
	description: string;
	user?: {
		id: number;
		username: string;
		email: string;
		name: string;
	};
	course?: {
		id: number;
		title: string;
		status: string;
	};
	timestamp: string;
	time_ago: string;
	metadata: any;
}

interface ActivityResponse {
	activities: ActivityItem[];
	pagination: {
		page: number;
		page_size: number;
		total: number;
		total_pages: number;
		has_next: boolean;
		has_prev: boolean;
	};
	stats: {
		total: number;
		by_type: Record<string, number>;
		by_action: Record<string, number>;
		recent_count: number;
	};
	filters: {
		type: string;
		date: string;
		search: string;
	};
}

const ActivityTypeCard = ({ title, count, type, color, icon: Icon, trend }: {
	title: string;
	count: number;
	type: string;
	color: string;
	icon: any;
	trend?: { value: number; direction: 'up' | 'down' };
}) => (
	<Card className={`relative overflow-hidden bg-gradient-to-br ${color} border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}>
		<CardContent className="p-6">
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Icon size={20} className="text-white/80" />
						<p className="text-sm font-medium text-white/90">{title}</p>
					</div>
					<p className="text-3xl font-bold text-white">{count.toLocaleString()}</p>
					{trend && (
						<div className={`flex items-center gap-1 text-sm font-medium text-white/90`}>
							{trend.direction === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
							{trend.value > 0 ? `+${trend.value}` : trend.value}% today
						</div>
					)}
				</div>
				<div className="p-2 bg-white/20 rounded-lg">
					<Icon size={24} className="text-white" />
				</div>
			</div>
		</CardContent>
	</Card>
);

const ActivityItemComponent = ({ activity }: { activity: ActivityItem }) => {
	const getActivityIcon = () => {
		switch (activity.type) {
			case 'user':
				return <Users size={16} />;
			case 'course':
				return <BookOpen size={16} />;
			case 'enrollment':
				return <GraduationCap size={16} />;
			case 'payment':
				return <DollarSign size={16} />;
			default:
				return <Activity size={16} />;
		}
	};

	const getActivityColor = () => {
		switch (activity.type) {
			case 'user':
				return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
			case 'course':
				return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
			case 'enrollment':
				return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
			case 'payment':
				return activity.action === 'successful' 
					? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
					: activity.action === 'failed'
					? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
					: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
			default:
				return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
		}
	};

	const getStatusBadge = () => {
		if (activity.type === 'payment') {
			switch (activity.action) {
				case 'successful':
					return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle size={12} className="mr-1" />Success</Badge>;
				case 'failed':
					return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle size={12} className="mr-1" />Failed</Badge>;
				case 'pending':
					return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock size={12} className="mr-1" />Pending</Badge>;
				default:
					return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100"><AlertCircle size={12} className="mr-1" />Unknown</Badge>;
			}
		}
		
		if (activity.type === 'enrollment' && activity.action === 'completion') {
			return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle size={12} className="mr-1" />Completed</Badge>;
		}

		return null;
	};

	return (
		<Card className="hover:shadow-md transition-all duration-200 border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
			<CardContent className="p-4">
				<div className="flex items-start gap-4">
					<div className={`p-2 rounded-lg flex-shrink-0 ${getActivityColor()}`}>
						{getActivityIcon()}
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 mb-1">
									<h4 className="font-medium text-sm">{activity.title}</h4>
									{getStatusBadge()}
								</div>
								<p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
								
								{/* User and Course Links */}
								<div className="flex items-center gap-4 text-xs text-muted-foreground">
									{activity.user && (
										<Link 
											to={`/admin/users/${activity.user.id}`} 
											className="flex items-center gap-1 hover:text-primary transition-colors"
										>
											<User size={12} />
											{activity.user.name}
										</Link>
									)}
									{activity.course && (
										<Link 
											to={`/admin/courses/${activity.course.id}`} 
											className="flex items-center gap-1 hover:text-primary transition-colors"
										>
											<BookOpen size={12} />
											{activity.course.title}
										</Link>
									)}
									{activity.metadata?.amount && (
										<span className="flex items-center gap-1">
											<DollarSign size={12} />
											${activity.metadata.amount}
										</span>
									)}
								</div>
							</div>
							<div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
								<Clock size={12} />
								{activity.time_ago}
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default function AdminActivity() {
	const [filters, setFilters] = useState({
		type: 'all',
		date: '7d',
		search: '',
		page: 1
	});

	const { data: activityData, isLoading, error, refetch } = useQuery({
		queryKey: ['admin-activities', filters],
		queryFn: async () => {
			const params = new URLSearchParams({
				type: filters.type,
				date: filters.date,
				search: filters.search,
				page: filters.page.toString(),
				page_size: '20'
			});
			return (await api.get(`/api/admin/activities?${params}`)).data as ActivityResponse;
		},
		refetchInterval: 30000, // Refresh every 30 seconds
	});

	const handleFilterChange = (key: string, value: string | number) => {
		setFilters(prev => ({
			...prev,
			[key]: value,
			page: key !== 'page' ? 1 : value // Reset to page 1 when changing filters
		}));
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// Search is handled by the query key change
	};

	// Activity type statistics for the overview cards
	const activityTypeStats = useMemo(() => {
		if (!activityData?.stats.by_type) return [];
		
		return [
			{
				title: "User Activities",
				count: activityData.stats.by_type.user || 0,
				type: "user",
				color: "from-blue-500 to-indigo-600",
				icon: Users
			},
			{
				title: "Course Activities", 
				count: activityData.stats.by_type.course || 0,
				type: "course",
				color: "from-green-500 to-emerald-600",
				icon: BookOpen
			},
			{
				title: "Enrollments",
				count: activityData.stats.by_type.enrollment || 0,
				type: "enrollment", 
				color: "from-purple-500 to-violet-600",
				icon: GraduationCap
			},
			{
				title: "Payments",
				count: activityData.stats.by_type.payment || 0,
				type: "payment",
				color: "from-amber-500 to-orange-600", 
				icon: DollarSign
			}
		];
	}, [activityData?.stats.by_type]);

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
								<div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
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
						<h3 className="text-lg font-semibold mb-2">Failed to load activity data</h3>
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
							Activity Feed
						</h1>
						<p className="text-lg text-muted-foreground mt-2">
							Real-time platform activities and events
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
							<RefreshCw size={16} />
							Refresh
						</Button>
					</div>
				</div>
			</div>

			{/* Activity Type Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
				{activityTypeStats.map((stat, index) => (
					<div 
						key={stat.type}
						onClick={() => handleFilterChange('type', stat.type)}
						className={filters.type === stat.type ? 'ring-2 ring-primary' : ''}
					>
						<ActivityTypeCard {...stat} />
					</div>
				))}
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
									placeholder="Search activities..."
									value={filters.search}
									onChange={(e) => handleFilterChange('search', e.target.value)}
									className="pl-10"
								/>
							</div>
							<Button type="submit" variant="outline">
								Search
							</Button>
						</form>
						
						<div className="flex gap-2">
							<Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
								<SelectTrigger className="w-40">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Activities</SelectItem>
									<SelectItem value="user">User Activities</SelectItem>
									<SelectItem value="course">Course Activities</SelectItem>
									<SelectItem value="enrollment">Enrollments</SelectItem>
									<SelectItem value="payment">Payments</SelectItem>
								</SelectContent>
							</Select>

							<Select value={filters.date} onValueChange={(value) => handleFilterChange('date', value)}>
								<SelectTrigger className="w-32">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="1d">Today</SelectItem>
									<SelectItem value="7d">7 Days</SelectItem>
									<SelectItem value="30d">30 Days</SelectItem>
									<SelectItem value="all">All Time</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Activity Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
					<CardContent className="p-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
								<Activity size={20} className="text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<p className="text-2xl font-bold">{activityData?.stats.total.toLocaleString()}</p>
								<p className="text-sm text-muted-foreground">Total Activities</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
					<CardContent className="p-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
								<TrendingUp size={20} className="text-green-600 dark:text-green-400" />
							</div>
							<div>
								<p className="text-2xl font-bold">{activityData?.stats.recent_count.toLocaleString()}</p>
								<p className="text-sm text-muted-foreground">Last 24 Hours</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
					<CardContent className="p-6">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
								<Eye size={20} className="text-purple-600 dark:text-purple-400" />
							</div>
							<div>
								<p className="text-2xl font-bold">{activityData?.activities.length}</p>
								<p className="text-sm text-muted-foreground">Currently Viewing</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Activity Feed */}
			<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Activity size={20} />
							Recent Activities
						</div>
						<Badge variant="outline">
							{activityData?.pagination.total} total
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{activityData?.activities.length === 0 ? (
						<div className="text-center py-12">
							<Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">No activities found</h3>
							<p className="text-muted-foreground">Try adjusting your filters or search criteria</p>
						</div>
					) : (
						<div className="space-y-4">
							{activityData?.activities.map((activity) => (
								<ActivityItemComponent key={activity.id} activity={activity} />
							))}
						</div>
					)}

					{/* Pagination */}
					{activityData?.pagination && activityData.pagination.total_pages > 1 && (
						<div className="flex items-center justify-between mt-8 pt-6 border-t">
							<div className="text-sm text-muted-foreground">
								Showing {((activityData.pagination.page - 1) * activityData.pagination.page_size) + 1} to{' '}
								{Math.min(activityData.pagination.page * activityData.pagination.page_size, activityData.pagination.total)} of{' '}
								{activityData.pagination.total} activities
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleFilterChange('page', filters.page - 1)}
									disabled={!activityData.pagination.has_prev}
								>
									<ChevronLeft size={16} />
									Previous
								</Button>
								<div className="flex items-center gap-1">
									{Array.from({ length: Math.min(5, activityData.pagination.total_pages) }, (_, i) => {
										const pageNum = i + 1;
										return (
											<Button
												key={pageNum}
												variant={pageNum === activityData.pagination.page ? "default" : "outline"}
												size="sm"
												onClick={() => handleFilterChange('page', pageNum)}
											>
												{pageNum}
											</Button>
										);
									})}
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleFilterChange('page', filters.page + 1)}
									disabled={!activityData.pagination.has_next}
								>
									Next
									<ChevronRight size={16} />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</AdminLayout>
	);
}

