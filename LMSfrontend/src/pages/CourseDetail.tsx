import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import StudentLayout from "@/components/studentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import {
  PlayCircle,
  ArrowLeft,
  Star,
  Users,
  Clock,
  CheckCircle,
  Video,
  FileText,
  BookOpen,
  Sparkles,
  User as UserIcon,
  CheckCircle as CheckIcon,
} from "lucide-react";
import PaymentModal from "@/components/PaymentModal";
import api from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { useEnrollments } from "@/hooks/useEnrollments";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedSection, MagneticButton } from "@/components/AnimatedElements";


const translations: Record<string, { en: string; ar: string }> = {
  loading: { en: "Loading...", ar: "جار التحميل..." },
  backToStore: { en: "Back to Store", ar: "العودة إلى المتجر" },
  enrolled: { en: "Enrolled", ar: "مسجل" },
  enrollNow: { en: "Enroll Now", ar: "سجل الآن" },
  preview: { en: "Preview Course", ar: "عرض الدورة" },
  overview: { en: "Overview", ar: "نظرة عامة" },
  curriculum: { en: "Curriculum", ar: "المحتوى" },
  instructor: { en: "Instructor", ar: "المدرب" },
  thisIncludes: { en: "This course includes:", ar: "تشمل هذه الدورة:" },
  lessons: { en: "lessons", ar: "درس" },
  hours: { en: "hours", ar: "ساعات" },
  studentsLabel: { en: "students", ar: "طالب" },
  recommendedCourse: { en: "Recommended for you", ar: "موصى به لك" },
  courseContentSoon: { en: "Course content will be available soon.", ar: "سيتم إضافة المحتوى قريباً." },
};

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isEnrolledInCourse } = useEnrollments();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEgyptUser, setIsEgyptUser] = useState<boolean | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(50);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  // const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
   const { t, language } = useI18n();
//  {t("common.viewAll")}
  const tLocal = (key: string) => {
    const lang = language?.startsWith("ar") ? "ar" : "en";
    return translations[key] ? translations[key][lang as "en" | "ar"] : key;
  };

  // 🌍 Detect user location
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        setIsEgyptUser(Boolean(data?.country_name?.toLowerCase().includes("egypt")));
      } catch {
        setIsEgyptUser(false);
      }
    };
    detectLocation();
  }, []);

  // 💵 Fetch USD→EGP rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        if (data?.rates?.EGP) setExchangeRate(data.rates.EGP);
      } catch {
        setExchangeRate(50);
      }
    };
    fetchRate();
  }, []);

  // 📦 Fetch course detail
  useEffect(() => {
    const loadCourse = async () => {
      try {
        const res = await api.get(`/api/courses/user-course/${id}/`);
        setCourse(res.data);
        console.log("course Details", res.data)
      } catch (err: any) {
        console.error("❌ Error loading course:", err.response?.data || err.message);
        toast({
          title: "Error",
          description: tLocal("loading"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [id]);

  // 🧮 Helpers
  const getDisplayPrice = (priceValue: any) => {
    const price = parseFloat(priceValue || 0);
    if (loading || isEgyptUser === null)
      return tLocal("loading");
    if (isEgyptUser && exchangeRate) {
      const egp = Math.round(price * exchangeRate);
      return `${egp.toLocaleString()} ${language === "ar" ? "ج.م" : "EGP"}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const parseDurationToMinutes = (d: any) => {
    if (d == null) return 0;
    if (typeof d === "number") return d;
    const parts = String(d).split(":").map((p) => Number(p));
    if (parts.length === 3) return parts[0] * 60 + parts[1];
    if (parts.length === 2) return parts[0] + parts[1] / 60;
    return 0;
  };
  const formatMinutesToHuman = (mins: number) => {
    if (!mins || mins === 0) return "0h";
    const hours = Math.floor(mins / 60);
    const rem = Math.round(mins % 60);
    return hours > 0 ? `${hours}h ${rem}m` : `${rem}m`;
  };

  // 🔁 Data transform
  const modulesRaw = course?.media ?? course?.modules ?? [];
  const totalMedia = modulesRaw.length;
  const totalDuration = modulesRaw.reduce(
    (sum: number, m: any) =>
      sum + parseDurationToMinutes(m?.duration ?? m?.duration_minutes ?? 0),
    0
  );

  const resolvedPrice = Number(course?.price ?? course?.price_usd ?? course?.amount ?? 0);

  const transformedCourse = {
    id: course?.id,
    title: course?.title || "",
    description: course?.description || "",
    category: course?.category || (language === "ar" ? "عام" : "General"),
    level: course?.level || (language === "ar" ? "مبتدئ" : "Beginner"),
    image: course?.thumbnail,
    price: resolvedPrice,
    rating: parseFloat(course?.rating || 4.5),
    duration: course?.duration  || "10h",
    students: Number(course?.students_count ?? course?.students ?? 0),
    instructor: {
      name: course?.instructors?.[0] || (language === "ar" ? "المدرب" : "Instructor"),
      avatar: "",
      bio: course?.instructor_bio || "",
    },
    modules: modulesRaw,
    _totalMediaCount: totalMedia,
    _totalDurationMinutes: totalDuration,
  };
 
  console.log("transformedCourse" , transformedCourse)

  const openPayment = () => setIsPaymentModalOpen(true);
  const closePayment = () => setIsPaymentModalOpen(false);

  const handlePaymentSuccess = () => {
    closePayment();
    toast({
      title: language === "ar" ? "تم التسجيل بنجاح!" : "Enrollment Successful!",
      description: `${tLocal("enrolled")} ${transformedCourse.title}`,
    });
  };

  // 🕒 Loading
  if (loading)
    return (
      <StudentLayout>
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          {tLocal("loading")}
        </div>
      </StudentLayout>
    );

  if (!course)
    return (
      <StudentLayout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === "ar" ? "لم يتم العثور على الدورة" : "Course Not Found"}
          </h2>
          <Link to="/store">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tLocal("backToStore")}
            </Button>
          </Link>
        </div>
      </StudentLayout>
    );

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-8">
          <Link to="/store">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tLocal("backToStore")}
            </Button>
          </Link>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Info */}
              <div className="lg:col-span-2">
                <AnimatedSection animation="fade-up">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-primary text-primary-foreground">
                      {transformedCourse.category}
                    </Badge>
                    <Badge variant="outline">{transformedCourse.level}</Badge>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                    {transformedCourse.title}
                  </h1>
                  <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                    {transformedCourse.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(transformedCourse.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                      <span className="font-medium">
                        {transformedCourse.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-5 w-5" />
                      <span>
                        {transformedCourse.students.toLocaleString()}{" "}
                        {tLocal("studentsLabel")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-5 w-5" />
                      <span>{transformedCourse.duration} {t("courseDetails.duration")}</span>
                    </div>
                  </div>
                  <Card className="sticky top-8 bg-card/80 backdrop-blur-sm border-2 shadow-xl">
                    <CardContent className="p-0">
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        {transformedCourse.image ? (
                          <img
                            src={transformedCourse.image}
                            alt={transformedCourse.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted" />
                        )}
                      </div>
                      <div className="p-6">
                        <div className="mb-6">
                          <span className="text-lg font-bold">
                            {getDisplayPrice(transformedCourse.price)}
                          </span>
                        </div>
                        {isEnrolledInCourse(String(transformedCourse.id)) ? (
                          <Button size="lg" variant="secondary" className="w-full" disabled>
                            <CheckCircle className="mr-2 w-4 h-4" />
                            {tLocal("enrolled")}
                          </Button>
                        ) : (
                          <Button
                            size="lg"
                            className="w-full bg-gradient-to-r from-primary to-primary/80"
                            onClick={openPayment}
                          >
                            {tLocal("enrollNow")}
                          </Button>
                        )}
                        <div className="mt-6 space-y-2">
                          <h4 className="font-semibold">{tLocal("thisIncludes")}</h4>
                          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <span>• HD Video Lessons</span>
                            <span>• Certificate of Completion</span>
                            <span>• Lifetime Access</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>


                </AnimatedSection>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Main Card */}
                <AnimatedSection animation="fade-up" delay={200}>
                  
                {/* Recommended Course */}
                {course?.next_recommended_course && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{tLocal("recommendedCourse")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-3">
                        {course.next_recommended_course.thumbnail && (
                          <img
                            src={course.next_recommended_course.thumbnail}
                            alt={course.next_recommended_course.title}
                            className="w-full h-60 rounded-md object-cover"
                          />
                        )}
                        <h4 className="font-medium">{course.next_recommended_course.title}</h4>
                        <div className="text-sm text-muted-foreground">
                          {course.next_recommended_course.category}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-sm font-semibold">
                            {getDisplayPrice(course.next_recommended_course.price)}
                          </div>
                          <Link to={`/user-course/${course.next_recommended_course.id}`}>
                            <Button size="sm">{language === "ar" ? "عرض" : "View"}</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                </AnimatedSection>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="overview">{tLocal("overview")}</TabsTrigger>
                <TabsTrigger value="curriculum">{tLocal("curriculum")}</TabsTrigger>
                <TabsTrigger value="instructor">{tLocal("instructor")}</TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview">
                <Card>
                  <CardContent className="space-y-3 py-6">
                    <h2 className="text-2xl font-bold">{transformedCourse.title}</h2>
                    <p className="text-sm text-muted-foreground">{transformedCourse.category}</p>
                    <p className="text-muted-foreground">{transformedCourse.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Curriculum */}
              <TabsContent value="curriculum">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{tLocal("curriculum")}</h3>
                      <p className="text-muted-foreground">
                        {transformedCourse._totalMediaCount} {tLocal("lessons")} •{" "}
                        {formatMinutesToHuman(transformedCourse._totalDurationMinutes)}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {transformedCourse.modules.length > 0 ? (
                      <Accordion type="single" collapsible className="space-y-2">
                        {transformedCourse.modules.map((m: any, i: number) => (
                          <AccordionItem key={i} value={`module-${i}`}>
                            <AccordionTrigger>
                              <div className="flex items-center gap-3">
                                {m.media_type === "video" ? (
                                  <Video className="h-5 w-5 text-primary" />
                                ) : (
                                  <FileText className="h-5 w-5 text-primary" />
                                )}
                                <span>{m.title || `Lesson ${i + 1}`}</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pl-8 text-muted-foreground space-y-1">
                                <p>
                                  Type: {m.media_type || "Video"} | Duration:{" "}
                                  {m.duration || "N/A"}
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4" />
                        <p>{tLocal("courseContentSoon")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Instructor */}
              <TabsContent value="instructor">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <Avatar className="w-24 h-24">
                        <AvatarImage
                          src={transformedCourse.instructor.avatar}
                          alt={transformedCourse.instructor.name}
                        />
                        <AvatarFallback>
                          <UserIcon className="h-12 w-12" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">
                          {transformedCourse.instructor.name}
                        </h3>
                        <p className="text-lg text-muted-foreground mb-4">
                          {transformedCourse.instructor.bio}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>

      <PaymentModal
        course={course}
        isOpen={isPaymentModalOpen}
        onClose={closePayment}
        onSuccess={handlePaymentSuccess}
      />
    </StudentLayout>
  );
}
