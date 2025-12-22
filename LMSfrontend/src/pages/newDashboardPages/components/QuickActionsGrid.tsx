import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Edit, Calendar, Award } from 'lucide-react';

interface QuickActionsGridProps {
    setIsAddCourseDialogOpen: (open: boolean) => void;
    setIsUploadVideoDialogOpen: (open: boolean) => void;
    setIsScheduleEventDialogOpen: (open: boolean) => void;
    setIsIssueCertificateDialogOpen: (open: boolean) => void;
}

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
    setIsAddCourseDialogOpen,
    setIsUploadVideoDialogOpen,
    setIsScheduleEventDialogOpen,
    setIsIssueCertificateDialogOpen
}) => {
    return (
        <div className="relative">
            <div className="absolute inset-0 backdrop-blur-[1px] bg-white/70 z-10 pointer-events-none rounded-lg"></div>
            <Card className="opacity-80">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                        Common tasks and shortcuts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-20 flex-col" onClick={() => setIsAddCourseDialogOpen(true)}>
                            <BookOpen className="w-6 h-6 mb-2" />
                            <span>Add New Course</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex-col" onClick={() => setIsUploadVideoDialogOpen(true)}>
                            <Edit className="w-6 h-6 mb-2" />
                            <span>Edit Course</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex-col" onClick={() => setIsScheduleEventDialogOpen(true)}>
                            <Calendar className="w-6 h-6 mb-2" />
                            <span>Schedule Event</span>
                        </Button>
                        <Button variant="outline" className="h-20 flex-col" onClick={() => setIsIssueCertificateDialogOpen(true)}>
                            <Award className="w-6 h-6 mb-2" />
                            <span>Issue Certificate</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default QuickActionsGrid;
