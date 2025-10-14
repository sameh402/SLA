

import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCourseCategories } from "@/hooks/useDjangoCourses";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Search,
  Filter,
  Play,
  Award,
  TrendingUp,
  Sparkles,
  ChevronDown,
  Grid3X3,
  List,
  User,
  Calendar,
} from "lucide-react";
import {
  MagneticButton,
  AnimatedSection,
  StaggeredList,
  FloatingElement,
} from "@/components/AnimatedElements";
import { useDjangoCourses, transformCourseForDisplay } from "@/hooks/useDjangoCourses";

export default function CoursesPage() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [filterBy, setFilterBy] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isEgyptUser, setIsEgyptUser] = useState<boolean | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

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

 
 
  

  // Fetch Django courses
  const { data: djangoCoursesData, isLoading, error } = useDjangoCourses({
    search: searchQuery || undefined,
    status: 'published',
    ordering: sortBy === 'rating' ? '-created_at' : 
              sortBy === 'price-low' ? 'price' :
              sortBy === 'price-high' ? '-price' : '-created_at'
  });

  // Handle category filtering from URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      // Map URL category parameters to filter values
      const categoryMap: { [key: string]: string } = {
        languages: "languages",
        development: "development",
        design: "design",
        healthcare: "healthcare",
        business: "business",
        math: "math",
      };

      if (categoryMap[categoryParam]) {
        setFilterBy(categoryMap[categoryParam]);
      }
    }
  }, [searchParams]);

  // Transform Django courses for display
  // const transformedCourses = djangoCoursesData?.results?.map(course => {
  //   const transformed = transformCourseForDisplay(course);
    
  //   // Determine category based on course title/description
  //   let category = 'General';
  //   const title = course.title.toLowerCase();
  //   const desc = course.description.toLowerCase();
    
  //   if (title.includes('french') || title.includes('german') || title.includes('chinese') || 
  //       title.includes('english') || title.includes('language') || title.includes('quran')) {
  //     category = 'Languages';
  //   } else if (title.includes('web') || title.includes('python') || title.includes('programming') || 
  //              title.includes('development') || title.includes('code') || title.includes('data')) {
  //     category = 'Programming';
  //   } else if (title.includes('design') || title.includes('art') || title.includes('graphic') || 
  //              title.includes('creative') || title.includes('calligraphy')) {
  //     category = 'Design';
  //   } else if (title.includes('health') || title.includes('medical') || title.includes('hospital') || 
  //              title.includes('first aid') || title.includes('nutrition')) {
  //     category = 'Healthcare';
  //   } else if (title.includes('business') || title.includes('management') || title.includes('marketing') || 
  //              title.includes('project') || title.includes('leadership')) {
  //     category = 'Business';
  //   } else if (title.includes('math') || title.includes('calculation') || title.includes('logic') || 
  //              title.includes('vedic')) {
  //     category = 'Mathematics';
  //   }

  //   // Generate display properties
  //   const gradients = [
  //     'bg-gradient-to-br from-blue-500 to-indigo-600',
  //     'bg-gradient-to-br from-green-500 to-emerald-600',
  //     'bg-gradient-to-br from-purple-500 to-pink-600',
  //     'bg-gradient-to-br from-red-500 to-rose-600',
  //     'bg-gradient-to-br from-orange-500 to-amber-600',
  //     'bg-gradient-to-br from-cyan-500 to-blue-600',
  //   ];

  //   return {
  //     id: course.id,
  //     title: course.title,
  //     description: course.description,
  //     image: course.thumbnail || gradients[course.id % gradients.length],
  //     // price: { 
  //     //   usd: `$${Math.round(transformed.price)}`, 
  //     //   egp: `${Math.round(transformed.price * 16)}EGP` 
  //     // },
  //     // originalPrice: { 
  //     //   usd: `$${Math.round(transformed.price * 1.3)}`, 
  //     //   egp: `${Math.round(transformed.price * 16 * 1.3)}EGP` 
  //     // },
  //     priceUSD: Number(transformed.price),
  //     originalPriceUSD: Number(transformed.price) * 1.3,
  //     rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
  //     students: Math.floor(Math.random() * 2000) + 500, // Random students 500-2500
  //     duration: `${Math.floor(Math.random() * 16) + 8} weeks`, // 8-24 weeks
  //     level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
  //     category: category,
  //     instructor: {
  //       name: "Course Instructor",
  //       title: "Subject Matter Expert",
  //       experience: `${Math.floor(Math.random() * 10) + 5} years`,
  //       avatar: `https://images.unsplash.com/photo-${1494790108755 + course.id}?w=150&h=150&fit=crop&crop=face`,
  //     },
  //     lessons: transformed.mediaCount || Math.floor(Math.random() * 50) + 20,
  //     certificate: true,
  //     featured: course.id % 3 === 0, // Every 3rd course is featured
  //   };
  // }) || [];
//   const transformedCourses = djangoCoursesData?.results?.map(course => {
//   const transformed = transformCourseForDisplay(course);
  
//   let category = "General";
//   const title = course.title.toLowerCase();
//   const desc = course.description.toLowerCase();

//   if (title.includes("french") || title.includes("german") || title.includes("language") || title.includes("english") || desc.includes("language")) {
//     category = "Languages";
//   } else if (title.includes("python") || title.includes("programming") || title.includes("development") || title.includes("web") || desc.includes("code")) {
//     category = "Programming";
//   } else if (title.includes("data") || title.includes("analytics") || desc.includes("machine learning")) {
//     category = "Data Science";
//   } else if (title.includes("ai") || title.includes("artificial intelligence") || desc.includes("deep learning")) {
//     category = "AI/ML";
//   } else if (title.includes("design") || title.includes("art") || desc.includes("graphic")) {
//     category = "Design";
//   } else if (title.includes("business") || title.includes("marketing") || desc.includes("leadership")) {
//     category = "Business";
//   } else if (title.includes("market") || desc.includes("sales") || desc.includes("branding")) {
//     category = "Marketing";
//   }

//   const gradients = [
//     "bg-gradient-to-br from-blue-500 to-indigo-600",
//     "bg-gradient-to-br from-green-500 to-emerald-600",
//     "bg-gradient-to-br from-purple-500 to-pink-600",
//     "bg-gradient-to-br from-red-500 to-rose-600",
//     "bg-gradient-to-br from-orange-500 to-amber-600",
//     "bg-gradient-to-br from-cyan-500 to-blue-600",
//   ];

//   return {
//     id: course.id,
//     title: course.title,
//     description: course.description,
//     image: course.thumbnail || gradients[course.id % gradients.length],
//     priceUSD: Number(transformed.price),
//     originalPriceUSD: Number(transformed.price) * 1.3,
//     rating: 4.5 + Math.random() * 0.5,
//     students: Math.floor(Math.random() * 2000) + 500,
//     duration: `${Math.floor(Math.random() * 16) + 8} weeks`,
//     level: ["Beginner", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)],
//     category,
//     instructor: {
//       name: "Course Instructor",
//       title: "Subject Matter Expert",
//       experience: `${Math.floor(Math.random() * 10) + 5} years`,
//       avatar: `https://images.unsplash.com/photo-${1494790108755 + course.id}?w=150&h=150&fit=crop&crop=face`,
//     },
//     lessons: transformed.mediaCount || Math.floor(Math.random() * 50) + 20,
//     certificate: true,
//     featured: course.id % 3 === 0,
//   };
// }) || [];
const transformedCourses = djangoCoursesData?.results?.map(course => {
  const transformed = transformCourseForDisplay(course);

  // ✅ Use backend category directly if exists
  const category = course.category || "General";

  const gradients = [
    "bg-gradient-to-br from-blue-500 to-indigo-600",
    "bg-gradient-to-br from-green-500 to-emerald-600",
    "bg-gradient-to-br from-purple-500 to-pink-600",
    "bg-gradient-to-br from-red-500 to-rose-600",
    "bg-gradient-to-br from-orange-500 to-amber-600",
    "bg-gradient-to-br from-cyan-500 to-blue-600",
  ];

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    image: course.thumbnail || gradients[course.id % gradients.length],
    priceUSD: Number(transformed.price),
    originalPriceUSD: Number(transformed.price) * 1.3,
    rating: 4.5 + Math.random() * 0.5,
    students: Math.floor(Math.random() * 2000) + 500,
    duration: `${Math.floor(Math.random() * 16) + 8} weeks`,
    level: ["Beginner", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)],
    category, // ✅ direct from backend
    instructor: {
      name: "Course Instructor",
      title: "Subject Matter Expert",
      experience: `${Math.floor(Math.random() * 10) + 5} years`,
      avatar: `https://images.unsplash.com/photo-${1494790108755 + course.id}?w=150&h=150&fit=crop&crop=face`,
    },
    lessons: transformed.mediaCount || Math.floor(Math.random() * 50) + 20,
    certificate: true,
    featured: course.id % 3 === 0,
  };
}) || [];



  // Fallback courses for when Django data is not available
  const fallbackCourses = [
    {
      id: 1,
      title: "Sample Course",
      description: "This is a sample course while loading real data from the database.",
      image: "bg-gradient-to-br from-blue-500 to-indigo-600",
      price: { usd: "$299", egp: "4,800EGP" },
      originalPrice: { usd: "$399", egp: "6,400EGP" },
      rating: 4.9,
      students: 1820,
      duration: "16 weeks",
      level: "Beginner",
      category: "General",
      instructor: {
        name: "Sample Instructor",
        title: "Subject Expert",
        experience: "8 years",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b788?w=150&h=150&fit=crop&crop=face",
      },
      lessons: 64,
      certificate: true,
      featured: true,
    },
  ];

  // Use transformed Django courses if available, otherwise fallback
  const courses = transformedCourses.length > 0 ? transformedCourses : fallbackCourses;


const backendCategories = getCourseCategories(djangoCoursesData?.results || []);
const categories = ["All", ...backendCategories.map(c => c.name)];
// const categories = [
//   "All",
//   "General",
//   "Programming",
//   "Data Science",
//   "AI/ML",
//   "Design",
//   "Business",
//   "Marketing",
// ];


  // const filteredCourses = courses.filter((course) => {
  //   const matchesSearch =
  //     course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     course.description.toLowerCase().includes(searchQuery.toLowerCase());

  //   let matchesFilter = true;
  //   if (filterBy !== "all") {
  //     // Map filter values to actual category names
  //     const categoryMap: { [key: string]: string } = {
  //       languages: "Languages",
  //       development: "Programming",
  //       design: "Design",
  //       healthcare: "Healthcare",
  //       business: "Business",
  //       math: "Mathematics",
  //     };

  //     const targetCategory = categoryMap[filterBy] || filterBy;
  //     matchesFilter = course.category === targetCategory;
  //   }

  //   return matchesSearch && matchesFilter;
  // });
 const filteredCourses = courses.filter((course) => {
  const matchesSearch =
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase());

  const matchesCategory =
    selectedCategory === "All" ||
    (course.category && course.category.toLowerCase() === selectedCategory.toLowerCase());

  return matchesSearch && matchesCategory;
});

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (
          parseInt(a.price.usd.replace("$", "")) -
          parseInt(b.price.usd.replace("$", ""))
        );
      case "price-high":
        return (
          parseInt(b.price.usd.replace("$", "")) -
          parseInt(a.price.usd.replace("$", ""))
        );
      case "rating":
        return b.rating - a.rating;
      case "students":
        return b.students - a.students;
      default:
        return b.featured ? 1 : -1;
    }
  });

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



  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
          <div className="container mx-auto px-4 text-center relative">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-32 mx-auto mb-4" />
              <div className="h-16 bg-muted rounded w-96 mx-auto mb-6" />
              <div className="h-6 bg-muted rounded w-80 mx-auto" />
            </div>
          </div>
        </section>

        {/* Loading Courses */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="bg-card/80 backdrop-blur-sm border-2 border-transparent overflow-hidden h-full">
                  <div className="h-48 bg-muted animate-pulse" />
                  <CardHeader className="pb-4">
                    <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-16 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="text-destructive mb-4">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Failed to load courses</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'An error occurred while loading courses'}
              </p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
        <div className="absolute inset-0">
          <FloatingElement className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl">
            <div></div>
          </FloatingElement>
          <FloatingElement
            className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
            duration={8000}
          >
            <div></div>
          </FloatingElement>
        </div>

        <div className="container mx-auto px-4 text-center relative">
          <AnimatedSection animation="fade-up" className="mb-12">
            <Badge className="mb-4 px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
              <BookOpen className="mr-2 h-4 w-4" />
              {t("courses.badge")}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
              {t("courses.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("courses.subtitle")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* Search and Filter Section */}
          <AnimatedSection
            animation="fade-up"
            delay={200}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder={t("courses.search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all duration-300"
                  />
                </div>

                {/* <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="h-12 bg-background/50 border-border/50">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder={t("courses.filter.category")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="languages">Languages</SelectItem>
                    <SelectItem value="development">Programming</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="math">Mathematics</SelectItem>
                  </SelectContent>
                </Select> */}
<Select
  value={selectedCategory}                   // ✅ shows selected value
  onValueChange={(value) => setSelectedCategory(value)} // ✅ updates when clicked
>
  <SelectTrigger className="h-12 bg-background/50 border-border/50">
    <Filter className="mr-2 h-4 w-4" />
    <SelectValue placeholder="Select category" />
  </SelectTrigger>

  <SelectContent>
    {categories.map((cat) => (
      <SelectItem key={cat} value={cat}>
        {cat}
      </SelectItem>
    ))}
  </SelectContent>
</Select>




              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {sortedCourses.length} courses found
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Courses Grid */}
          <AnimatedSection animation="fade-up" delay={400} className="mt-16">
            <StaggeredList
              className={`grid gap-8 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
              itemClassName="group"
              delay={100}
            >
              {sortedCourses.map((course) => (
                <div key={course.id}>
                  <Link
                    to={`/course/${course.id}`}
                    className="block h-full"
                  >
                    <Card
                      className={`course-card card-hover bg-card/80 backdrop-blur-sm border-2 border-transparent hover:border-primary/20 overflow-hidden group transition-all duration-300 cursor-pointer ${
                        viewMode === "list" ? "flex flex-row" : "h-full"
                      }`}
                    >
                      <div
                        className={`relative overflow-hidden ${
                          viewMode === "list"
                            ? "w-80 h-48 flex-shrink-0"
                            : "h-48"
                        }`}
                      >
                        {/* Course Image/Gradient */}
                        {/* <div className={`w-full h-full ${course.thumbnail}`} /> */}
                               {course.image?.startsWith("http") ? (
                            <img
                              src={course.image}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-full h-full ${course.image}`} />
                          )}

                        {/* Featured Badge */}
                        {course.featured && (
                          <FloatingElement className="absolute top-4 left-4 z-10">
                            <Badge className="bg-yellow-500 text-yellow-900 shadow-lg">
                              <Sparkles className="mr-1 h-3 w-3" />
                              Featured
                            </Badge>
                          </FloatingElement>
                        )}

                        {/* Level Badge */}
                        <FloatingElement className="absolute top-4 right-4 z-10">
                          <Badge className="bg-white/95 text-gray-800 shadow-lg backdrop-blur-sm">
                            {course.level}
                          </Badge>
                        </FloatingElement>

                        {/* Category Badge */}
                        <div className="absolute bottom-4 left-4 z-10">
                          <Badge className="bg-primary text-primary-foreground">
                            {course.category}
                          </Badge>
                        </div>

                        {/* Price */}
                        <div className="absolute bottom-4 right-4 z-10">
                          <div className="text-white font-bold text-lg bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                            <span className="text-lg font-bold">
                                  {getDisplayPrice(course.priceUSD, language)}
                            </span>
                            {/* <span className="text-sm line-through opacity-60 ml-2">
                               {getDisplayPrice(course.originalPriceUSD, language)}
                            </span> */}
                          </div>
                        </div>

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-500" />
                      </div>

                      <div
                        className={`${
                          viewMode === "list" ? "flex-1" : ""
                        } flex flex-col`}
                      >
                        <CardHeader className="pb-4">
                          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                            {course.title}
                          </CardTitle>
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {course.description}
                          </p>
                        </CardHeader>

                        <CardContent className="space-y-4 flex-1 flex flex-col">
                        
                          {/* Course Details */}
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{course.lessons} lessons</span>
                            {course.certificate && (
                              <div className="flex items-center gap-1">
                                <Award className="h-4 w-4" />
                                <span>Certificate</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                </div>
              ))}
            </StaggeredList>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
















