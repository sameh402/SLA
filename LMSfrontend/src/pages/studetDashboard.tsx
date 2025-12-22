

// src/pages/Index.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle, Users, Star, User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import StudentLayout from "@/components/studentLayout";
import { useAuth } from "@/lib/useAuth";
import { useI18n } from "@/lib/i18n";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEnrollments } from "@/hooks/useEnrollments";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Remove the interface as we'll use DashboardEnrollment directly

export default function Index() {
  const { user } = useAuth();
  const { userProfile, loading, error, getDisplayName } = useUserProfile();
  const { enrollments, refreshEnrollments } = useEnrollments();
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<"all" | "completed">("all");
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [isEgyptUser, setIsEgyptUser] = useState<boolean | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);


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
        setIsPriceLoading(false);
      }
    };
    fetchRate();
  }, []);

  // 3️⃣ Compute display price
  const getDisplayPrice = (priceUSD: any) => {
    if (isPriceLoading || isEgyptUser === null) return "Loading...";
    if (isEgyptUser && exchangeRate) {
      const numericPrice = typeof priceUSD === 'string' ? parseFloat(priceUSD) : Number(priceUSD);
      const egpPrice = numericPrice * exchangeRate;
      const label = language === "ar" ? "جم" : "EGP";
      return `${Math.round(egpPrice).toLocaleString()} ${label}`;
    }
    const numericPrice = typeof priceUSD === 'string' ? parseFloat(priceUSD) : Number(priceUSD);
    return `$${numericPrice.toFixed(2)}`;
  };





  // Use enrollments directly - no need to transform
  const completedCourses = enrollments.filter((enrollment) => enrollment.status === 'completed');

  const getDisplayCourses = () => {
    switch (activeTab) {
      case "completed":
        return completedCourses;
      default:
        return enrollments;
    }
  };

  // If no enrollments, show empty state
  if (!loading && enrollments.length === 0) {
    return (
      <StudentLayout>
        {/* User Profile Header */}
        {userProfile && (
          <Card className="mb-6 bg-gradient-to-r from-primary/10 to-blue-600/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="w-20 h-20 border-4 border-primary/20">
                  <AvatarImage src={userProfile.avatar} alt={getDisplayName()} />
                  <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                    {userProfile.firstName?.charAt(0)}{userProfile.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                      {language === "ar" ? `مرحباً بعودتك، ${getDisplayName()}!` : `Welcome back, ${getDisplayName()}!`}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                      {language === "ar" ? "ابدأ رحلة التعلم وحقق أهدافك" : "Start your learning journey and achieve your goals"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {language === "ar" ? "لا توجد دورات مسجلة" : "No Courses Enrolled"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === "ar"
                ? "لم تسجل في أي دورة بعد. استكشف متجر الدورات للعثور على الدورة المثالية لك."
                : "You haven't enrolled in any courses yet. Explore our course store to find the perfect course for you."}
            </p>
            <Link to="/store">
              <Button>
                {language === "ar" ? "استكشف الدورات" : "Explore Courses"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </StudentLayout>
    );
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {language === "ar" ? "جاري تحميل البيانات..." : "Loading profile..."}
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      {/* User Profile Header */}
      {userProfile && (
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-blue-600/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-20 h-20 border-4 border-primary/20">
                <AvatarImage src={userProfile.avatar} alt={getDisplayName()} />
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {userProfile.firstName?.charAt(0)}{userProfile.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {language === "ar" ? `مرحباً بعودتك، ${getDisplayName()}!` : `Welcome back, ${getDisplayName()}!`}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {language === "ar" ? "استمر في رحلة التعلم وحقق أهدافك" : "Continue your learning journey and achieve your goals"}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{userProfile.email}</span>
                  </div>
                  {userProfile.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{userProfile.phone}</span>
                    </div>
                  )}
                  {userProfile.country && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{userProfile.country}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "إجمالي الدورات" : "Total Courses"}
                </p>
                <p className="text-2xl font-bold text-foreground">{enrollments.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {language === "ar" ? "مكتملة" : "Completed"}
                </p>
                <p className="text-2xl font-bold text-foreground">{completedCourses.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debug Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {language === "ar" ? "دوراتي" : "My Courses"} ({enrollments.length})
        </h3>
        <Button
          onClick={() => {
            console.log('🔄 Manual refresh triggered');
            console.log('👤 Current user:', user);
            console.log('📊 Current enrollments:', enrollments);
            refreshEnrollments();
          }}
          variant="outline"
          size="sm"
        >
          🔄 Refresh ({enrollments.length})
        </Button>
      </div>

      {/* Course Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          onClick={() => setActiveTab("all")}
          className="rounded-full"
        >
          {language === "ar" ? "الكل" : "All"}
        </Button>
        <Button
          variant={activeTab === "completed" ? "default" : "outline"}
          onClick={() => setActiveTab("completed")}
          className="rounded-full"
        >
          {language === "ar" ? `مكتملة (${completedCourses.length})` : `Completed (${completedCourses.length})`}
        </Button>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getDisplayCourses().map((enrollment) => (
          <Card key={enrollment.enrollmentId} className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-card border-border">
            <div className="relative">
              <img
                src={enrollment.courseImage}
                alt={enrollment.courseTitle}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {enrollment.status === 'completed' && (
                <div className="absolute top-3 right-3 bg-success text-success-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>{language === "ar" ? "مكتملة" : "Completed"}</span>
                </div>
              )}
              <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-foreground border border-border">
                {language === "ar" ? "دورة" : "Course"}
              </div>
              <div className="absolute bottom-3 left-3 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-primary-foreground">
                {getDisplayPrice(enrollment.coursePrice)}
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors text-foreground">
                {enrollment.courseTitle}
              </CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {enrollment.courseDescription}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "ar" ? `بواسطة ${enrollment.instructor}` : `By ${enrollment.instructor}`}
              </p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {enrollment.completedLessons}/{enrollment.totalLessons} {language === "ar" ? "درس" : "lessons"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(enrollment.progress)}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>

                <Link to={`/learn/${enrollment.courseId}`} className="w-full">
                  <Button
                    className="w-full mt-2"
                    variant={enrollment.status === 'completed' ? "outline" : "default"}
                  >
                    {enrollment.status === 'completed'
                      ? (language === "ar" ? "مراجعة الدورة" : "Review Course")
                      : (language === "ar" ? "استمر في التعلم" : "Continue Learning")
                    }
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </StudentLayout>
  );
}