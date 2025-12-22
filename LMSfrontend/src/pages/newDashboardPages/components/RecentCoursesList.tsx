import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface RecentCoursesListProps {
    loading: boolean;
    apiCourses: any[];
}

const RecentCoursesList: React.FC<RecentCoursesListProps> = ({ loading, apiCourses }) => {
    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Recent Courses</span>
                    <Button variant="ghost" size="sm">View All</Button>
                </CardTitle>
                <CardDescription>
                    Manage and monitor your latest courses
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <div className="text-center py-4 text-muted-foreground">Loading courses...</div>
                ) : (
                    apiCourses.slice(0, 5).map((course) => (
                        <Link
                            key={course.id}
                            to={`/course/${course.id}`}
                            className="block hover:bg-accent/40 transition rounded-lg"
                        >
                            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <h3 className="font-medium text-foreground">{course.title}</h3>
                                        <Badge variant={course.status === "published" ? "default" : "secondary"}>
                                            {course.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                        <span>Price: ${course.price}</span>
                                        <span>{course.media?.length || 0} media files</span>
                                        <div className="flex items-center">
                                            <Calendar className="w-3 h-3 mr-1 text-blue-500" />
                                            {new Date(course.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

export default RecentCoursesList;
