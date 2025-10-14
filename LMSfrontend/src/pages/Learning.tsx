import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StudentLayout from "@/components/studentLayout";
import { useEnrollments, type DashboardEnrollment, type CourseMedia } from "@/hooks/useEnrollments";
import { useI18n } from "@/lib/i18n";
import api from "@/api/client";
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Circle, 
  Clock, 
  BookOpen, 
  ArrowLeft,
  Volume2,
  Settings,
  Maximize,
  SkipBack,
  SkipForward,
  User,
  Star,
  Download,
  MessageSquare,
  FileText,
  Video,
  Image as ImageIcon,
  File
} from "lucide-react";

interface LearningPageProps {
  enrollment?: DashboardEnrollment;
  currentMedia?: CourseMedia;
}

export default function Learning() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { enrollments } = useEnrollments();
  const { t, language } = useI18n();
  
  const [currentEnrollment, setCurrentEnrollment] = useState<DashboardEnrollment | null>(null);
  const [currentMedia, setCurrentMedia] = useState<CourseMedia | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find the enrollment for this course
  useEffect(() => {
    if (!courseId || enrollments.length === 0) {
      setIsLoading(false);
      return;
    }

    const enrollment = enrollments.find(e => e.courseId === courseId);
    if (!enrollment) {
      setError('Course not found or you are not enrolled in this course');
      setIsLoading(false);
      return;
    }

    setCurrentEnrollment(enrollment);
    
    // Set the first media item as current, or null if no media
    if (enrollment.courseMedia && enrollment.courseMedia.length > 0) {
      setCurrentMedia(enrollment.courseMedia[0]);
    } else {
      setCurrentMedia(null);
    }
    
    setIsLoading(false);
  }, [courseId, enrollments]);

  const handleMediaClick = (media: CourseMedia) => {
    setCurrentMedia(media);
    setIsPlaying(false);
  };

  const markMediaAsCompleted = async (mediaId: string) => {
    if (!currentEnrollment) return;
    
    try {
      // Update progress - this is a simplified calculation
      // In a real app, you'd track individual media completion
      const newProgress = Math.min(100, currentEnrollment.progress + (100 / currentEnrollment.totalLessons));
      
      await api.post(`/api/enrollments/${currentEnrollment.enrollmentId}/progress/`, { 
        progress: newProgress 
      });
      
      // Update local state
      setCurrentEnrollment(prev => prev ? {
        ...prev,
        progress: newProgress,
        completedLessons: Math.round((newProgress / 100) * prev.totalLessons)
      } : null);
      
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const goToNextMedia = () => {
    if (!currentEnrollment || !currentMedia) return;
    
    const currentIndex = currentEnrollment.courseMedia.findIndex(m => m.id === currentMedia.id);
    if (currentIndex < currentEnrollment.courseMedia.length - 1) {
      setCurrentMedia(currentEnrollment.courseMedia[currentIndex + 1]);
      setIsPlaying(false);
    }
  };

  const goToPreviousMedia = () => {
    if (!currentEnrollment || !currentMedia) return;
    
    const currentIndex = currentEnrollment.courseMedia.findIndex(m => m.id === currentMedia.id);
    if (currentIndex > 0) {
      setCurrentMedia(currentEnrollment.courseMedia[currentIndex - 1]);
      setIsPlaying(false);
    }
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'video': return Video;
      case 'pdf': return FileText;
      case 'image': return ImageIcon;
      default: return File;
    }
  };

  const getMediaUrl = (media: CourseMedia) => {
    if (media.file.startsWith('http')) {
      return media.file;
    }
    return `/media/${media.file}`;
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {language === "ar" ? "جاري تحميل الدورة..." : "Loading course..."}
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || !currentEnrollment) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="text-center p-8 max-w-md">
            <CardContent>
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {language === "ar" ? "الدورة غير موجودة" : "Course Not Found"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {error || (language === "ar" 
                  ? "لم يتم العثور على هذه الدورة أو أنك غير مسجل فيها."
                  : "This course was not found or you are not enrolled in it.")}
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                {language === "ar" ? "العودة للوحة التحكم" : "Back to Dashboard"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </StudentLayout>
    );
  }

  // If no media content, show course info only
  if (!currentEnrollment.courseMedia || currentEnrollment.courseMedia.length === 0) {
    return (
      <StudentLayout>
        <div className="h-[calc(100vh-8rem)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-background">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === "ar" ? "العودة للوحة التحكم" : "Back to Dashboard"}
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">{currentEnrollment.courseTitle}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{currentEnrollment.instructor}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>
                      {currentEnrollment.completedLessons}/{currentEnrollment.totalLessons} {language === "ar" ? "دروس" : "lessons"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* No Content Message */}
          <div className="flex-1 flex items-center justify-center">
            <Card className="text-center p-8 max-w-md">
              <CardContent>
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {language === "ar" ? "لا يوجد محتوى" : "No Content Available"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {language === "ar" 
                    ? "لم يتم رفع أي محتوى لهذه الدورة بعد. يرجى المحاولة لاحقاً."
                    : "No content has been uploaded for this course yet. Please check back later."}
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>{language === "ar" ? "وصف الدورة:" : "Course Description:"}</strong>
                  </p>
                  <p className="text-sm">{currentEnrollment.courseDescription}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === "ar" ? "العودة للوحة التحكم" : "Back to Dashboard"}
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">{currentEnrollment.courseTitle}</h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{currentEnrollment.instructor}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {currentEnrollment.completedLessons}/{currentEnrollment.totalLessons} {language === "ar" ? "دروس" : "lessons"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{Math.round(currentEnrollment.progress)}% {language === "ar" ? "مكتمل" : "complete"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Content Sidebar */}
          <div className="lg:col-span-1 border-r border-border bg-muted/30">
            <div className="p-4 border-b border-border bg-background">
              <h2 className="font-semibold text-foreground">
                {language === "ar" ? "محتوى الدورة" : "Course Content"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentEnrollment.courseMedia.length} {language === "ar" ? "عنصر" : "items"}
              </p>
            </div>
            
            <div className="overflow-y-auto h-full">
              <div className="space-y-1 p-2">
                {currentEnrollment.courseMedia.map((media, index) => {
                  const MediaIcon = getMediaIcon(media.media_type);
                  const isActive = currentMedia?.id === media.id;
                  
                  return (
                    <div
                      key={media.id}
                      onClick={() => handleMediaClick(media)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isActive
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-accent hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          <MediaIcon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                              {index + 1}. {media.title}
                            </span>
                            {isActive && (
                              <Play className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {media.media_type.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Viewer */}
          <div className="lg:col-span-2 flex flex-col bg-background">
            {currentMedia ? (
              <>
                <div className="flex-1 flex items-center justify-center relative bg-black">
                  {currentMedia.media_type === 'video' ? (
                    <video
                      className="w-full h-full object-contain"
                      controls
                      src={getMediaUrl(currentMedia)}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : currentMedia.media_type === 'image' ? (
                    <img
                      src={getMediaUrl(currentMedia)}
                      alt={currentMedia.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8">
                      <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{currentMedia.title}</h3>
                      <p className="text-muted-foreground mb-4">
                        {language === "ar" ? "اضغط لتحميل الملف" : "Click to download file"}
                      </p>
                      <Button asChild>
                        <a href={getMediaUrl(currentMedia)} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          {language === "ar" ? "تحميل" : "Download"}
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Content Controls & Info */}
                <div className="bg-background border-t border-border">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{currentMedia.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {language === "ar" ? "نوع الملف:" : "File type:"} {currentMedia.media_type.toUpperCase()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousMedia}
                          disabled={currentEnrollment.courseMedia[0].id === currentMedia.id}
                        >
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          onClick={() => markMediaAsCompleted(String(currentMedia.id))}
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {language === "ar" ? "تمييز كمكتمل" : "Mark Complete"}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextMedia}
                          disabled={currentEnrollment.courseMedia[currentEnrollment.courseMedia.length - 1].id === currentMedia.id}
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress Info */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div className="text-sm text-muted-foreground">
                        {language === "ar" ? "العنصر" : "Item"} {currentEnrollment.courseMedia.findIndex(m => m.id === currentMedia.id) + 1} {language === "ar" ? "من" : "of"} {currentEnrollment.courseMedia.length}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {language === "ar" ? "التقدم:" : "Progress:"} {Math.round(currentEnrollment.progress)}%
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === "ar" ? "اختر عنصراً من القائمة لعرضه" : "Select an item from the list to view it"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}