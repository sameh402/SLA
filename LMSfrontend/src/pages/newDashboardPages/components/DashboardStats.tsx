import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Video, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Stat {
    title: string;
    value: string;
    change: string;
    changeType: 'increase' | 'decrease';
    icon: any;
    color: string;
}

interface DashboardStatsProps {
    summaryData: any;
}

export const getStats = (summaryData: any): Stat[] => {
    if (!summaryData) {
        return [
            {
                title: "Total Courses",
                value: "0",
                change: "0%",
                changeType: "increase",
                icon: BookOpen,
                color: "bg-blue-500"
            },
            {
                title: "Active Students",
                value: "0",
                change: "0%",
                changeType: "increase",
                icon: Users,
                color: "bg-green-500"
            },
            {
                title: "Video Content",
                value: "0",
                change: "0%",
                changeType: "increase",
                icon: Video,
                color: "bg-purple-500"
            },
            {
                title: "Revenue",
                value: "$0",
                change: "0%",
                changeType: "increase",
                icon: TrendingUp,
                color: "bg-green-600"
            }
        ];
    }

    const totalCourses = (summaryData.courses?.published || 0) + (summaryData.courses?.draft || 0);
    const activeStudents = summaryData.enrollments?.active || 0;
    const totalRevenue = summaryData.revenue?.total || 0;
    const totalVideos = summaryData.total_videos || 0;

    return [
        {
            title: "Total Courses",
            value: totalCourses.toString(),
            change: "+12%",
            changeType: "increase",
            icon: BookOpen,
            color: "bg-blue-500"
        },
        {
            title: "Active Students",
            value: activeStudents.toString(),
            change: "+8%",
            changeType: "increase",
            icon: Users,
            color: "bg-green-500"
        },
        {
            title: "Video Content",
            value: totalVideos.toString(),
            change: "+20%",
            changeType: "increase",
            icon: Video,
            color: "bg-purple-500"
        },
        {
            title: "Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            change: "+15%",
            changeType: "increase",
            icon: TrendingUp,
            color: "bg-green-600"
        }
    ];
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ summaryData }) => {
    const stats = getStats(summaryData);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.color}`}>
                                <Icon className="w-4 h-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                            <div className="flex items-center text-xs text-muted-foreground">
                                {stat.changeType === "increase" ? (
                                    <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                                ) : (
                                    <ArrowDownRight className="w-3 h-3 mr-1 text-red-500" />
                                )}
                                <span className={stat.changeType === "increase" ? "text-green-500" : "text-red-500"}>
                                    {stat.change}
                                </span>
                                <span className="ml-1">from last month</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default DashboardStats;
