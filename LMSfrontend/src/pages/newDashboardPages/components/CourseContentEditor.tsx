import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Edit } from 'lucide-react';
import { CourseWithVideos } from '@/lib/coursesData';

interface CourseContentEditorProps {
    loading: boolean;
    apiCourses: any[];
    courses: CourseWithVideos[];
    openEditDialog: (course: CourseWithVideos) => void;
}

const CourseContentEditor: React.FC<CourseContentEditorProps> = ({ loading, apiCourses, courses, openEditDialog }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Course Content</span>
                    <Badge variant="secondary">{courses.length}</Badge>
                </CardTitle>
                <CardDescription>
                    Edit course titles and content
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {loading ? (
                    <div className="text-center py-4 text-muted-foreground">Loading courses...</div>
                ) : (
                    apiCourses.map((course) => (
                        <div key={course.id} className="p-3 border border-border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h4 className="font-medium text-sm text-foreground">{course.title}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Video className="w-3 h-3 mr-1" />
                                    {course.media?.length || 0} media files
                                </div>
                                <Badge variant="outline" className="text-xs">
                                    {course.status}
                                </Badge>
                            </div>
                            <Button
                                size="sm"
                                className="w-full text-xs h-7"
                                onClick={() => {
                                    const courseForEdit: CourseWithVideos = {
                                        id: course.id,
                                        title: course.title,
                                        description: course.description,
                                        instructor: "Admin",
                                        students: 0,
                                        rating: 0,
                                        status: course.status,
                                        progress: 0,
                                        category: "General",
                                        price: parseFloat(course.price),
                                        duration: "0h 0m",
                                        thumbnail: course.thumbnail,
                                        videos: course.media?.map((media: any, index: number) => ({
                                            id: media.id,
                                            title: media.title,
                                            description: media.title,
                                            url: media.file,
                                            duration: media.duration || "0:00",
                                            order: media.order || index + 1
                                        })) || []
                                    };
                                    openEditDialog(courseForEdit);
                                }}
                            >
                                <Edit className="w-3 h-3 mr-2" />
                                Edit Content
                            </Button>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};

export default CourseContentEditor;
