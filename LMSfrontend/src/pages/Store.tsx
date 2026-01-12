
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StudentLayout from "@/components/studentLayout";
import CourseDetailsModal from "@/components/CourseDetailsModal";
import PaymentModal from "@/components/PaymentModal";
import { useI18n } from "@/lib/i18n";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useCourses } from "@/hooks/useCourses";
import { useLocationStore } from "@/lib/locationStore";
import { 
  ShoppingCart, 
  Star, 
  Clock, 
  Users, 
  Play, 
  BookOpen,
  Award,
  Filter,
  Search,
  Heart,
  Share2,
  CheckCircle,
  TrendingUp,
  Zap,
  Lock
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  students: number;
  duration: string;
  lessons: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  tags: string[];
  features: string[];
  isPopular: boolean;
  isBestseller: boolean;
  isNew: boolean;
  lastUpdated: string;
  language: string;
  certificate: boolean;
}



export default function Store() {
  const { t, language } = useI18n();
  const { isEnrolledInCourse } = useEnrollments();
  const { courses, loading: coursesLoading, error: coursesError } = useCourses();
  const [selectedCategory, setSelectedCategory] = useState("All Courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [courseForPayment, setCourseForPayment] = useState<Course | null>(null);
  const [isEgyptUser, setIsEgyptUser] = useState<boolean | null>(null);
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
   const getDisplayPrice = (priceUSD: number) => {
     if (loading || isEgyptUser === null) return "Loading...";
     if (isEgyptUser && exchangeRate) {
       const egpPrice = priceUSD * exchangeRate;
       const label = language === "ar" ? "جم" : "EGP";
       return `${Math.round(egpPrice).toLocaleString()} ${label}`;
     }
     return `$${priceUSD.toFixed(2)}`;
   };
 




  // Dynamic categories based on language
  const categories = [
    t("store.allCourses"),
    t("store.languages"),
    t("store.development"),
    t("store.design"),
    t("store.healthcare"),
    t("store.business"),
    t("store.math"),
  ];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === "All Courses" || 
      (selectedCategory === "Languages" && course.category === "Languages") ||
      (selectedCategory === "Development" && course.category === "Development") ||
      (selectedCategory === "Design" && course.category === "Design") ||
      (selectedCategory === "Healthcare" && course.category === "Healthcare") ||
      (selectedCategory === "Business" && course.category === "Business") ||
      (selectedCategory === "Math" && course.category === "Math");
      
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const toggleWishlist = (courseId: string) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(courseId)) {
        newWishlist.delete(courseId);
      } else {
        newWishlist.add(courseId);
      }
      return newWishlist;
    });
  };

  const openCourseModal = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const closeCourseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleBuyCourse = (course: Course) => {
    setCourseForPayment(course);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setCourseForPayment(null);
  };

  const handlePaymentSuccess = () => {
    // Payment successful, close modal and refresh
    closePaymentModal();
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getTranslatedLevel = (level: string) => {
    switch (level) {
      case "Beginner": return t("store.beginner");
      case "Intermediate": return t("store.intermediate");
      case "Advanced": return t("store.advanced");
      default: return level;
    }
  };



  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("store.title")}</h1>
            <p className="text-muted-foreground">{t("store.subtitle")}</p>
          </div>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">150+</p>
              <p className="text-sm text-muted-foreground">{t("store.coursesAvailable")}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">50k+</p>
              <p className="text-sm text-muted-foreground">{t("store.happyStudents")}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">98%</p>
              <p className="text-sm text-muted-foreground">{t("store.completionRate")}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">4.8</p>
              <p className="text-sm text-muted-foreground">{t("store.averageRating")}</p>
            </CardContent>
          </Card>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t("store.searchCourses")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">{t("store.categories")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    onClick={() => setSelectedCategory(category)}
                    className="w-full justify-start text-sm"
                  >
                    {category}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Course Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {coursesLoading ? t("common.loading") : `${filteredCourses.length} ${t("store.coursesFound")}`}
              </p>
            </div>

            {/* Loading State */}
            {coursesLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="h-48 bg-muted animate-pulse" />
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                        <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                        <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                        <div className="h-8 bg-muted animate-pulse rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Error State */}
            {coursesError && (
              <div className="text-center py-12">
                <div className="text-destructive mb-4">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    {t("error.general")}
                  </h3>
                  <p className="text-muted-foreground mb-4">{coursesError}</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    className="mt-4"
                  >
                    {t("common.retry")}
                  </Button>
                </div>
              </div>
            )}

            {/* Courses Grid */}
            {!coursesLoading && !coursesError && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">
                      {t("store.noCoursesFound")}
                    </h3>
                    <p className="text-muted-foreground">
                      {t("store.tryDifferentSearch")}
                    </p>
                  </div>
                ) : (
                  filteredCourses.map((course) => (
                <Card key={course.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Course Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      {course.isPopular && (
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-orange-500 text-white">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {t("store.popular")}
                        </div>
                      )}
                      {course.isBestseller && (
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-500 text-white">
                          <Award className="w-3 h-3 mr-1" />
                          {t("store.bestseller")}
                        </div>
                      )}
                      {course.isNew && (
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-500 text-white">
                          <Zap className="w-3 h-3 mr-1" />
                          {t("store.new")}
                        </div>
                      )}
                    </div>

                    {/* Discount Badge */}
                    {course.discount && (
                      <div className="absolute top-3 right-3">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-500 text-white">-{course.discount}%</div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleWishlist(course.id)}
                        className={wishlist.has(course.id) ? "text-red-600" : ""}
                      >
                        <Heart className={`w-4 h-4 ${wishlist.has(course.id) ? "fill-current" : ""}`} />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Course Info */}
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getLevelColor(course.level)}`}>
                            {getTranslatedLevel(course.level)}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{course.rating}</span>
                            <span className="text-xs text-muted-foreground">({course.reviews.toLocaleString()})</span>
                          </div>
                        </div>
                        
                        <h3
                          className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors cursor-pointer"
                          onClick={() => openCourseModal(course)}
                        >
                          {course.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                          {course.description}
                        </p>
                      </div>

                      {/* Instructor */}
                      <div className="flex items-center space-x-2">
                        <img
                          src={course.instructorAvatar}
                          alt={course.instructor}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm text-muted-foreground">{course.instructor}</span>
                      </div>

                      {/* Course Stats */}
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Play className="w-3 h-3" />
                          <span>{course.lessons} {language === "ar" ? "درس" : "lessons"}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-xs text-slate-600">
                          <CheckCircle className="w-3 h-3 text-success" />
                          <span>{language === "ar" ? "وصول مدى الحياة" : "Lifetime Access"}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-slate-600">
                          <CheckCircle className="w-3 h-3 text-success" />
                          <span>{language === "ar" ? "شهادة إتمام" : "Certificate of Completion"}</span>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                                                  {/* <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-foreground">
                              {getDisplayPrice(course.price)}
                            </span>
                            {course.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                {getDisplayPrice(course.originalPrice)}
                              </span>
                            )}
                          </div> */}

                                                      <div className="flex items-center space-x-2">
      {loading ? (
        <span className="text-sm text-muted-foreground">Loading...</span>
      ) : (
        <>
          {/* Main Price */}
          <div className="flex items-baseline">
            <span className="text-xl font-bold text-foreground">
              {getDisplayPrice(course.price)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
            
            </span>
          </div>

          {/* Original Price (if discounted) */}
          {course.originalPrice && (
            <div className="flex items-baseline">
              <span className="text-sm text-muted-foreground line-through">
                {getDisplayPrice(course.originalPrice)}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
              
              </span>
            </div>
          )}
        </>
      )}

    </div>

                        </div>
                        
                        {isEnrolledInCourse(course.id) ? (
                          <Button size="sm" variant="secondary" disabled>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {language === "ar" ? "مُسجل" : "Enrolled"}
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleBuyCourse(course)}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {language === "ar" ? "شراء" : "Buy Now"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          isOpen={isModalOpen}
          onClose={closeCourseModal}
          onToggleWishlist={toggleWishlist}
          isInWishlist={wishlist.has(selectedCourse.id)}
          onAddToCart={isEnrolledInCourse(selectedCourse.id) ? undefined : () => handleBuyCourse(selectedCourse)}
          isInCart={false}
        />
      )}

      {/* Payment Modal */}
      <PaymentModal
        course={courseForPayment}
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        onSuccess={handlePaymentSuccess}
      />
    </StudentLayout>
  );
}