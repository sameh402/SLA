import React, { useState , useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDjangoCourse, transformCourseForDisplay } from "@/hooks/useDjangoCourses";
import { useToast } from "@/hooks/use-toast";



import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Clock,
  Users,
  Star,
  Calendar,
  User,
  Award,
  Play,
  Download,
  BookOpen,
  CheckCircle,
  Trophy,
  Globe,
  Smartphone,
  Monitor,
  Headphones,
  MessageCircle,
  Heart,
  Share2,
  Bookmark,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Target,
  ArrowLeft,
  PlayCircle,
  FileText,
  Video,
} from "lucide-react";
import {
  AnimatedSection,
  StaggeredList,
  MagneticButton,
  FloatingElement,
  CountUp,
} from "@/components/AnimatedElements";

export default function CourseDetails() {
  const { t, language } = useI18n();
  const isEgyptUser = useStore((state) => state.isEgyptUser);
  const { toast } = useToast();
  const { id: paramId } = useParams();
  const courseId = parseInt(paramId || '0');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [EgyptUser, setIsEgyptUser] = useState<boolean | null>(null);
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
     // 1️⃣ Detect user's country
    useEffect(() => {
      const detectLocation = async () => {
        try {
          const res = await fetch("https://ipapi.co/json/");
          const data = await res.json();
          const isEgypt = data.country_name?.toLowerCase().includes("egypt");
          setIsEgyptUser(isEgypt);
        } catch (err) {
          console.error("🌍 Geo detection failed:", err);
          setIsEgyptUser(false);
        }
      };
      detectLocation();
    }, []);
  
    // 2️⃣ Fetch live USD → EGP rate
    useEffect(() => {
      const fetchRate = async () => {
        try {
          const res = await fetch("https://open.er-api.com/v6/latest/USD");
          const data = await res.json();
          if (data && data.rates && data.rates.EGP) {
            console.log("💰 Live rate fetched:", data.rates.EGP);
            setExchangeRate(data.rates.EGP);
          } else {
            console.warn("⚠️ Fallback used: invalid response", data);
            setExchangeRate(50);
          }
        } catch (err) {
          console.error("💥 Exchange rate fetch failed:", err);
          setExchangeRate(50);
        } finally {
          setLoading(false);
        }
      };
      fetchRate();
    }, []);


    // 3️⃣ Compute display price

   




























  // Fetch course data from Django backend
  const { data: courseData, isLoading, error } = useDjangoCourse(courseId);
  const transformedCourse = courseData ? transformCourseForDisplay(courseData) : null;

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-32 mb-4" />
              <div className="h-64 bg-muted rounded-xl mb-8" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-32 bg-muted rounded-xl" />
                  <div className="h-48 bg-muted rounded-xl" />
                  <div className="h-64 bg-muted rounded-xl" />
                </div>
                <div className="space-y-6">
                  <div className="h-64 bg-muted rounded-xl" />
                  <div className="h-32 bg-muted rounded-xl" />
                  <div className="h-48 bg-muted rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !courseData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Link to="/courses">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Courses
                </Button>
              </Link>
            </div>
            <Card className="max-w-md mx-auto p-8 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The course you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/courses">
                <Button>Browse All Courses</Button>
              </Link>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Transform Django course data for display
  const course = {
    id: courseData.id,
    title: courseData.title,
    subtitle: courseData.description.substring(0, 150) + (courseData.description.length > 150 ? '...' : ''),
    description: courseData.description,
    image: courseData.thumbnail || "bg-gradient-to-br from-blue-500 to-indigo-600",
    price: { 
      usd: `$${Math.round(transformedCourse?.price || 0)}`, 
      egp: `${Math.round((transformedCourse?.price || 0) * 16)}EGP` 
    },
    originalPrice: { 
      usd: `$${Math.round((transformedCourse?.price || 0) * 1.3)}`, 
      egp: `${Math.round((transformedCourse?.price || 0) * 16 * 1.3)}EGP` 
    },
    discount: 25,
    rating: 4.5 + Math.random() * 0.5,
    reviewCount: Math.floor(Math.random() * 2000) + 500,
    students: Math.floor(Math.random() * 2000) + 500,
    duration: `${Math.floor(Math.random() * 16) + 8} weeks`,
    level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
    category: getCourseCategory(courseData.title, courseData.description),
    language: "English",
    subtitles: ["English", "Arabic"],
    lastUpdated: new Date(courseData.updated_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }),
    certificate: true,
    featured: courseData.id % 3 === 0,
    startDate: "Available now",
    instructor: {
      name: "Course Instructor",
      title: "Subject Matter Expert", 
      company: "SallyLMS",
      avatar: `https://images.unsplash.com/photo-${1494790108755 + courseData.id}?w=150&h=150&fit=crop&crop=face`,
      bio: `Experienced ${getCourseCategory(courseData.title, courseData.description).toLowerCase()} instructor with years of industry experience.`,
      students: Math.floor(Math.random() * 5000) + 1000,
      courses: Math.floor(Math.random() * 20) + 5,
      rating: 4.7 + Math.random() * 0.3,
    },
    skills: generateCourseSkills(courseData.title, courseData.description),
    requirements: generateCourseRequirements(courseData.title, courseData.description),
    modules: courseData.media || [],
  };

  // Helper functions
  function getCourseCategory(title: string, description: string) {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('french') || text.includes('german') || text.includes('chinese') || 
        text.includes('english') || text.includes('language') || text.includes('quran')) {
      return 'Languages';
    } else if (text.includes('web') || text.includes('python') || text.includes('programming') || 
               text.includes('development') || text.includes('code') || text.includes('data')) {
      return 'Programming';
    } else if (text.includes('design') || text.includes('art') || text.includes('graphic') || 
               text.includes('creative') || text.includes('calligraphy')) {
      return 'Design';
    } else if (text.includes('health') || text.includes('medical') || text.includes('hospital') || 
               text.includes('first aid') || text.includes('nutrition')) {
      return 'Healthcare';
    } else if (text.includes('business') || text.includes('management') || text.includes('marketing') || 
               text.includes('project') || text.includes('leadership')) {
      return 'Business';
    } else if (text.includes('math') || text.includes('calculation') || text.includes('logic')) {
      return 'Mathematics';
    }
    return 'General';
  }

  function generateCourseSkills(title: string, description: string) {
    const category = getCourseCategory(title, description);
    const skillSets: { [key: string]: string[] } = {
      'Languages': ['Conversational skills', 'Grammar mastery', 'Writing proficiency', 'Cultural awareness'],
      'Programming': ['Problem solving', 'Code optimization', 'Best practices', 'Project development'],
      'Design': ['Creative thinking', 'Visual composition', 'Design principles', 'Software proficiency'],
      'Healthcare': ['Patient care', 'Medical knowledge', 'Safety protocols', 'Professional ethics'],
      'Business': ['Strategic thinking', 'Leadership skills', 'Market analysis', 'Team management'],
      'Mathematics': ['Analytical thinking', 'Problem solving', 'Logical reasoning', 'Mathematical modeling'],
      'General': ['Critical thinking', 'Communication', 'Time management', 'Self-directed learning']
    };
    return skillSets[category] || skillSets['General'];
  }

  function generateCourseRequirements(title: string, description: string) {
    const category = getCourseCategory(title, description);
    const requirementSets: { [key: string]: string[] } = {
      'Languages': ['Basic computer skills', 'Internet connection', 'Willingness to practice speaking'],
      'Programming': ['Basic computer knowledge', 'Text editor or IDE', 'Problem-solving mindset'],
      'Design': ['Computer with design software', 'Creative mindset', 'Basic computer skills'],
      'Healthcare': ['High school diploma', 'Interest in healthcare', 'Attention to detail'],
      'Business': ['Basic business knowledge', 'Professional interest', 'Communication skills'],
      'Mathematics': ['High school mathematics', 'Calculator or computer', 'Logical thinking'],
      'General': ['Basic computer skills', 'Internet connection', 'Motivation to learn']
    };
    return requirementSets[category] || requirementSets['General'];
  }

  // Course features and reviews data
  const courseFeatures = [
    { icon: Monitor, text: `${course.modules.length || 12} hours of HD video content` },
    { icon: Download, text: "Downloadable resources" },
    { icon: Smartphone, text: "Mobile and TV access" },
    { icon: Trophy, text: "Certificate of completion" },
    { icon: Globe, text: "Lifetime access" },
    { icon: Headphones, text: "24/7 student support" },
  ];

  const courseReviews = [
    {
      id: 1,
      name: "Ahmed Hassan",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      date: "2 weeks ago",
      comment: "Excellent course! The instructor explains everything clearly and the content is very practical.",
    },
    {
      id: 2,
      name: "Sarah Johnson", 
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b788?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      date: "1 month ago", 
      comment: "This course exceeded my expectations. Highly recommended for anyone looking to improve their skills.",
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", 
      rating: 4,
      date: "1 month ago",
      comment: "Great content and well-structured lessons. The practical examples were very helpful.",
    },
  ];

  // Handle enrollment
  const handleEnrollment = () => {
    if (isEnrolled) {
      toast({
        title: "Already Enrolled",
        description: "You are already enrolled in this course.",
      });
      return;
    }

    setIsEnrolled(true);
    toast({
      title: "Enrollment Successful!",
      description: `You have successfully enrolled in ${course.title}`,
    });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Bookmark Removed" : "Course Bookmarked",
      description: isBookmarked 
        ? "Course removed from bookmarks" 
        : "Course added to bookmarks",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: course.subtitle,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Course link copied to clipboard",
      });
    }
  };


 const getDisplayPrice = (priceUSD: number) => {
  if (loading || EgyptUser === null) return "Loading...";
  if (EgyptUser && exchangeRate) {
    const egpPrice = priceUSD * exchangeRate;
    const label = language === "ar" ? "جم" : "EGP";
    return `${Math.round(egpPrice).toLocaleString()} ${label}`;
  }
  return `$${priceUSD.toFixed(2)}`;
};

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-8">
          <Link to="/courses">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Course Info */}
              <div className="lg:col-span-2">
                <AnimatedSection animation="fade-up">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-primary text-primary-foreground">
                      {course.category}
                    </Badge>
                    <Badge variant="outline">{course.level}</Badge>
                    {course.featured && (
                      <Badge className="bg-yellow-500 text-yellow-900">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                    {course.title}
                  </h1>
                  
                  <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                    {course.subtitle}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < Math.floor(course.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{course.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({course.reviewCount.toLocaleString()} reviews)
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-5 w-5" />
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-5 w-5" />
                      <span>{course.duration}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-5 w-5" />
                      <span>Updated {course.lastUpdated}</span>
                    </div>
                  </div>
                </AnimatedSection>
              </div>

              {/* Course Preview Card */}
              <div className="lg:col-span-1">
                <AnimatedSection animation="fade-up" delay={200}>
                  <Card className="sticky top-8 bg-card/80 backdrop-blur-sm border-2 shadow-xl">
                    <CardContent className="p-0">
                      {/* Course Image/Video Preview */}
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        {course.image.startsWith('http') ? (
                          <img 
                            src={course.image} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full ${course.image}`} />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Button size="lg" className="rounded-full">
                            <PlayCircle className="mr-2 h-6 w-6" />
                            Preview Course
                          </Button>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Price */}
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-2">
                            
                                  <span className="text-lg font-bold">
  {getDisplayPrice(transformedCourse?.price || 0)}
</span>
                           
                            {/* <span className="text-lg text-muted-foreground line-through">
                              {isEgyptUser ? course.originalPrice.egp : course.originalPrice.usd}
                            </span> */}
                          </div>
                          {/* <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            {course.discount}% OFF
                          </Badge> */}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 mb-6">
                          <MagneticButton className="w-full">
                            <Button 
                              size="lg" 
                              className="w-full bg-gradient-to-r from-primary to-primary/80"
                              onClick={() => navigate(`/login`)}
                            >
                               Enroll Now
                            </Button>
                          </MagneticButton>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={handleBookmark}
                            >
                              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={handleShare}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Course Features */}
                        <div className="space-y-3">
                          <h4 className="font-semibold">This course includes:</h4>
                          {courseFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 text-sm">
                              <feature.icon className="h-4 w-4 text-primary" />
                              <span>{feature.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AnimatedSection animation="fade-up" delay={400}>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4 mb-8">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                      <TabsTrigger value="instructor">Instructor</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8">
                      {/* Course Description */}
                      <Card>
                        <CardHeader>
                          <CardTitle>About This Course</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground leading-relaxed mb-6">
                            {course.description}
                          </p>
                        </CardContent>
                      </Card>

                      {/* What You'll Learn */}
                      <Card>
                        <CardHeader>
                          <CardTitle>What You'll Learn</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {course.skills.map((skill, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span>{skill}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Requirements */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Requirements</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {course.requirements.map((req, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="curriculum" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Course Content</CardTitle>
                          <p className="text-muted-foreground">
                            {course.modules.length} lessons • {course.modules.length * 2} hours total
                          </p>
                        </CardHeader>
                        <CardContent>
                          {course.modules.length > 0 ? (
                            <Accordion type="single" collapsible className="space-y-2">
                              {course.modules.map((module, index) => (
                                <AccordionItem key={module.id} value={`module-${index}`}>
                                  <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center gap-3">
                                      {module.media_type === 'video' ? (
                                        <Video className="h-5 w-5 text-primary" />
                                      ) : (
                                        <FileText className="h-5 w-5 text-primary" />
                                      )}
                                      <span className="text-left">{module.title}</span>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="pl-8 space-y-2">
                                      <p className="text-muted-foreground">
                                        Type: {module.media_type.charAt(0).toUpperCase() + module.media_type.slice(1)}
                                      </p>
                                      <p className="text-sm">
                                        Learn about {module.title.toLowerCase()} and master the key concepts.
                                      </p>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <BookOpen className="h-12 w-12 mx-auto mb-4" />
                              <p>Course content will be available soon.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="instructor" className="space-y-6">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-6">
                            <Avatar className="w-24 h-24">
                              <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                              <AvatarFallback>
                                <User className="h-12 w-12" />
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold mb-2">{course.instructor.name}</h3>
                              <p className="text-lg text-muted-foreground mb-4">{course.instructor.title}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-4 bg-muted/30 rounded-lg">
                                  <div className="text-2xl font-bold">{course.instructor.rating.toFixed(1)}</div>
                                  <div className="text-sm text-muted-foreground">Rating</div>
                                </div>
                                <div className="text-center p-4 bg-muted/30 rounded-lg">
                                  <div className="text-2xl font-bold">{course.instructor.students.toLocaleString()}</div>
                                  <div className="text-sm text-muted-foreground">Students</div>
                                </div>
                                <div className="text-center p-4 bg-muted/30 rounded-lg">
                                  <div className="text-2xl font-bold">{course.instructor.courses}</div>
                                  <div className="text-sm text-muted-foreground">Courses</div>
                                </div>
                              </div>
                              
                              <p className="text-muted-foreground leading-relaxed">
                                {course.instructor.bio}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="reviews" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Student Reviews</CardTitle>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl font-bold">{course.rating.toFixed(1)}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-5 w-5 ${
                                      i < Math.floor(course.rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-muted-foreground">
                              Based on {course.reviewCount.toLocaleString()} reviews
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            {courseReviews.map((review) => (
                              <div key={review.id} className="border-b border-border/50 pb-6 last:border-0">
                                <div className="flex items-start gap-4">
                                  <Avatar>
                                    <AvatarImage src={review.avatar} alt={review.name} />
                                    <AvatarFallback>
                                      <User className="h-5 w-5" />
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-semibold">{review.name}</h4>
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < review.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-muted-foreground"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm text-muted-foreground">{review.date}</span>
                                    </div>
                                    <p className="text-muted-foreground">{review.comment}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </AnimatedSection>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  {/* Related Courses */}
                  <AnimatedSection animation="fade-up" delay={600}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Related Courses</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <Link key={i} to={`/course/${courseData.id + i}`}>
                              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="w-16 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm line-clamp-2 mb-1">
                                    Related {course.category} Course {i}
                                  </h4>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>4.{5 + i}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
