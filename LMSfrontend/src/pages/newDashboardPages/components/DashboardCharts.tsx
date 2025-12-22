import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardChartsProps {
    summaryData: any;
    generateSampleData: (type: 'revenue' | 'enrollments', days?: number) => any[];
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ summaryData, generateSampleData }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Revenue Analytics</CardTitle>
                            <CardDescription>Track revenue performance over time</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={summaryData?.revenue?.total ? [
                                { period: 'Total Revenue', value: summaryData.revenue.total },
                                { period: 'Last 7 Days', value: summaryData.revenue.last_7_days || 0 },
                                { period: 'Last 30 Days', value: summaryData.revenue.last_30_days || 0 }
                            ] : generateSampleData('revenue', 3)}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="period"
                                    className="text-muted-foreground"
                                    fontSize={12}
                                />
                                <YAxis
                                    className="text-muted-foreground"
                                    fontSize={12}
                                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '6px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Active Students Chart */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Active Students</CardTitle>
                            <CardDescription>Monitor student engagement trends</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={summaryData?.enrollments?.active ? [
                                { period: 'Active Students', value: summaryData.enrollments.active },
                                { period: 'Completed', value: summaryData.enrollments.completed || 0 },
                                { period: 'Total Students', value: summaryData?.users_by_role?.find((r: any) => r.role === 'student')?.count || 0 }
                            ] : generateSampleData('enrollments', 3)}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="period"
                                    className="text-muted-foreground"
                                    fontSize={12}
                                />
                                <YAxis
                                    className="text-muted-foreground"
                                    fontSize={12}
                                    tickFormatter={(value) => value.toLocaleString()}
                                />
                                <Tooltip
                                    formatter={(value: number) => [value.toLocaleString(), 'Students']}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '6px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="hsl(var(--accent-foreground))"
                                    strokeWidth={2}
                                    dot={{ fill: 'hsl(var(--accent-foreground))', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: 'hsl(var(--accent-foreground))', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardCharts;
