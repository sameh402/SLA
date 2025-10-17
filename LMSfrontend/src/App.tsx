import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import Home from "./pages/Home";
import Courses from "./pages/newDashboardPages/Courses";
import CoursesPage from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import GeolocationPopup from "./components/features/geolocationPushUp";
import { LoginPage } from "./pages/LogIn";
import { SignUpPage } from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ScrollToTop from "./components/ScrollToTop";

import Rewards from "./pages/Rewards";
import Store from "./pages/Store";
import CourseDetail from "./pages/CourseDetail";
import StudentDashboard from "./pages/studetDashboard";
import EditProfile from "./pages/EditProfile";
import Learning from "./pages/Learning";
import Dashboard from "./pages/newDashboardPages/Dashboard";
import RequireAdmin from "@/components/RequireAdmin";
import AdminUserProfile from "./pages/AdminUserProfile";
import AdminCourseProfileTest from "./pages/AdminCourseProfileTest";
import Profile from "./pages/newDashboardPages/Profile";
import PaymentResult from "./pages/PaymentResult";

// Auth imports
import { AuthProvider } from "@/lib/useAuth";
import AdminLayout from "./components/AdminLayout";
import Students from "./pages/newDashboardPages/Students";
import CoursePage from "./pages/newDashboardPages/course/[id]";
import Settings from "./pages/newDashboardPages/Settings";
import Finance from "./pages/newDashboardPages/Finance";

// Route protection components
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import DashboardRedirect from "./components/DashboardRedirect";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="smart-learning-theme">
        <I18nProvider>
          <BrowserRouter>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ScrollToTop />
              <AuthProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/course/:id" element={<CourseDetails />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/LogIn" element={<LoginPage />} />
                  <Route path="/SignUp" element={<SignUpPage />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  
                  {/* Protected Routes - require authentication */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminLayout><Dashboard /></AdminLayout>
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/student-dashboard" element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['student', 'instructor']}>
                        <StudentDashboard />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } />
                   <Route path="/user-course/:id" element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['student', 'instructor']}>
                        <CourseDetail />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } />

                  {/* Admin-only Routes */}
                  <Route path="/admin/users" element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminLayout><Students /></AdminLayout>
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/users/:id" element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminUserProfile />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/courses" element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminLayout><Courses /></AdminLayout>
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/courses/:id" element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <CoursePage />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/courses-test" element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminCourseProfileTest />
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/Finance" element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminLayout><Finance /></AdminLayout>
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/settings" element={
                    <ProtectedRoute>
                      <RoleBasedRoute allowedRoles={['admin']}>
                        <AdminLayout><Settings /></AdminLayout>
                      </RoleBasedRoute>
                    </ProtectedRoute>
                  } />
                                             {/* payment result */}
                  <Route path="/payment-result" element={<PaymentResult />} />


                  {/* Other Protected Routes */}
                  <Route path="/edit-profile" element={
                    <ProtectedRoute>
                      <EditProfile />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/Store" element={
                    <ProtectedRoute>
                      <Store />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/learn/:courseId" element={
                    <ProtectedRoute>
                      <Learning />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
              <GeolocationPopup />
            </TooltipProvider>
          </BrowserRouter>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}