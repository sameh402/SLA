import { useEffect, useState } from 'react';
import api from '@/api/client';

export interface Course {
  id: number | string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  [key: string]: any; // Allow additional properties for flexibility
}

export interface PaymentData {
  courseId?: number;
  amount?: number;
  paymentMethod?: 'credit_card' | 'paypal' | 'stripe';
}

// Enhanced course data from Django backend
export interface CourseDetail {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'published';
  price: string; // Decimal field comes as string
  thumbnail: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  media: CourseMedia[];
}

export interface CourseMedia {
  id: number;
  course: number;
  file: string;
  media_type: 'video' | 'pdf' | 'image' | 'other';
  title: string;
  order: number;
  created_at: string;
}

// Shape expected by dashboard with enhanced data
export interface DashboardEnrollment {
  enrollmentId: number;
  courseId: string;
  status: 'active' | 'completed';
  progress: number; // 0-100
  completedLessons: number;
  totalLessons: number;
  courseTitle: string;
  courseDescription: string;
  courseImage: string;
  coursePrice: string;
  instructor: string;
  instructorId: number;
  enrolledAt: string;
  courseMedia: CourseMedia[];
  createdBy: number;
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop';

export function useEnrollments() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrollments, setEnrollments] = useState<DashboardEnrollment[]>([]);

  const fetchEnrollments = async () => {
    try {
      console.log('🔍 Fetching enrollments...');
      
      // First, let's check who the current user is
      try {
        const userResponse = await api.get('/api/users/profile/');
        console.log('🧑 Current authenticated user:', userResponse.data);
      } catch (userError) {
        console.error('❌ Failed to get current user:', userError);
      }
      
      const { data } = await api.get('/api/enrollments/');
      const list = Array.isArray(data) ? data : (data as any)?.results || [];
      
      console.log('📦 Raw enrollment data:', list);
      console.log(`📊 Found ${list.length} enrollments`);
      
      // We'll get instructor info from individual course details or use a default
      // Note: /api/users/ endpoint doesn't exist, so we'll handle instructor names differently
      
      const mapped: DashboardEnrollment[] = list.map((e: any) => {
          const progress = Number(e.progress || 0);
          const courseDetail: CourseDetail = e.course_detail || {};
          
          // Calculate lessons from media count or default
          // const totalLessons = courseDetail.media?.length || 1;
          // const completedLessons = Math.round((progress / 100) * totalLessons);
          
          // // Use a default instructor name since we can't fetch user details
          // // In a real app, you might want to add instructor info to the course model
          // const instructorName = `Instructor #${courseDetail.created_by || 'Unknown'}`;
          // Get number of videos (count media items of type 'video')
const videoCount = courseDetail.media
  ? courseDetail.media.filter((m) => m.media_type === 'video').length
  : 0;

// If your backend includes instructor info (like name or email)
const instructorName =
  courseDetail.created_by_name ||
  courseDetail.instructor_name ||
  `Instructor #${courseDetail.created_by || 'Unknown'}`;

const totalLessons = videoCount || 1;
const completedLessons = Math.round((progress / 100) * totalLessons);

          
          // Get course image
          const courseImage = courseDetail.thumbnail 
            ? (courseDetail.thumbnail.startsWith('http') ? courseDetail.thumbnail : `/media/${courseDetail.thumbnail}`)
            : PLACEHOLDER_IMAGE;
          
          return {
            enrollmentId: e.id,
            courseId: String(e.course),
            status: (e.status === 'completed' ? 'completed' : 'active') as 'active' | 'completed',
            progress,
            completedLessons,
            totalLessons,
            courseTitle: courseDetail.title || `Course ${e.course}`,
            courseDescription: courseDetail.description || '',
            courseImage,
            coursePrice: courseDetail.price || '0',
            instructor: instructorName,
            instructorId: courseDetail.created_by || 0,
            enrolledAt: e.created_at || e.enrolled_at || '',
            courseMedia: courseDetail.media || [],
            createdBy: courseDetail.created_by || 0,
          };
        });
        console.log('Mapped enrollments:', mapped);
        setEnrollments(mapped);
        return mapped;
      } catch (error) {
        console.error('Failed to fetch enrollments:', error);
        setEnrollments([]);
        return [];
      }
    };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const list = async () => {
    const { data } = await api.get('/api/enrollments/');
    return Array.isArray(data) ? data : (data as any)?.results || [];
  };

  const enrollInCourse = async (course: Course, paymentData?: PaymentData) => {
    setIsProcessing(true);
    try {
      console.log('Starting enrollment process for course:', course);
      
      const courseId = Number(course.id);
      const amount = Number(paymentData?.amount ?? course.price ?? 0);
      
      console.log('Course ID:', courseId, 'Amount:', amount);
      
      // Check if user is already enrolled
      const existingEnrollment = enrollments.find(e => e.courseId === String(courseId));
      if (existingEnrollment) {
        console.log('User already enrolled in this course:', existingEnrollment);
        throw new Error('You are already enrolled in this course. Check your dashboard to continue learning.');
      }
      
      // Process payment if amount > 0
      if (amount > 0) {
        console.log('Processing payment...');
        const paymentPayload = { 
          course: courseId, 
          amount, 
          currency: 'USD' 
        };
        console.log('Payment payload:', paymentPayload);
        
        const pay = await api.post('/api/payments/', paymentPayload);
        console.log('Payment created:', pay.data);
        
        await api.post(`/api/payments/${pay.data.id}/verify/`);
        console.log('Payment verified');
      }
      
      // Create enrollment
      console.log('Creating enrollment...');
      const enrollmentPayload = { 
        course: courseId, 
        status: 'active', 
        progress: 0 
      };
      console.log('Enrollment payload:', enrollmentPayload);
      
      const { data } = await api.post('/api/enrollments/', enrollmentPayload);
      console.log('Enrollment response:', data);
      
      // Fetch complete course data for the new enrollment
      const courseDetail: CourseDetail = data.course_detail || {};
      console.log('Course detail:', courseDetail);
      
      // Use a default instructor name since /api/users/ endpoint doesn't exist
      const instructorName = `Instructor #${courseDetail.created_by || 'Unknown'}`;
      
      // Get course image
      const courseImage = courseDetail.thumbnail 
        ? (courseDetail.thumbnail.startsWith('http') ? courseDetail.thumbnail : `/media/${courseDetail.thumbnail}`)
        : PLACEHOLDER_IMAGE;
      
      const totalLessons = courseDetail.media?.length || 1;
      
      const newEnrollment: DashboardEnrollment = {
        enrollmentId: data.id,
        courseId: String(data.course),
        status: 'active',
        progress: 0,
        completedLessons: 0,
        totalLessons,
        courseTitle: courseDetail.title || course.title || `Course ${data.course}`,
        courseDescription: courseDetail.description || course.description || '',
        courseImage,
        coursePrice: courseDetail.price || String(course.price) || '0',
        instructor: instructorName,
        instructorId: courseDetail.created_by || 0,
        enrolledAt: data.created_at || data.enrolled_at || new Date().toISOString(),
        courseMedia: courseDetail.media || [],
        createdBy: courseDetail.created_by || 0,
      };
      
      console.log('New enrollment object:', newEnrollment);
      setEnrollments((prev) => [...prev, newEnrollment]);
      
      // Refresh enrollments from server to ensure consistency
      setTimeout(() => {
        fetchEnrollments();
      }, 1000);
      
      return data;
    } catch (e: any) {
      console.error('Enrollment error:', e);
      console.error('Error response:', e?.response);
      console.error('Error data:', e?.response?.data);
      
      let errorMessage = 'Payment/Enrollment failed';
      if (e?.response?.data) {
        if (typeof e.response.data === 'string') {
          errorMessage = e.response.data;
        } else if (e.response.data.detail) {
          errorMessage = e.response.data.detail;
        } else if (e.response.data.error) {
          errorMessage = e.response.data.error;
        } else {
          errorMessage = JSON.stringify(e.response.data);
        }
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateCourseProgress = async (enrollmentId: number, progress: number) => {
    return api.post(`/api/enrollments/${enrollmentId}/progress/`, { progress });
  };

  const cancelEnrollment = async (_courseId: number) => {
    return;
  };

  const getTotalSpent = async () => {
    const { data } = await api.get('/api/payments/');
    return data.reduce((s: number, p: any) => (p.payment_status === 'success' ? s + Number(p.amount) : s), 0);
  };

  const isEnrolledInCourse = (courseId: number | string) => {
    const id = String(courseId);
    return enrollments.some((e) => e.courseId === id);
  };

  const getEnrollmentStatus = (courseId: number | string) => {
    const id = String(courseId);
    const enrollment = enrollments.find((e) => e.courseId === id);
    return enrollment ? enrollment.status : null;
  };

  const getEnrollmentDetails = (courseId: number | string) => {
    const id = String(courseId);
    return enrollments.find((e) => e.courseId === id) || null;
  };

  return {
    enrollments,
    payments: [] as any[],
    isProcessing,
    isEnrolledInCourse,
    getEnrollmentStatus,
    getEnrollmentDetails,
    enrollInCourse,
    updateCourseProgress,
    getTotalSpent,
    cancelEnrollment,
    list,
    refreshEnrollments: fetchEnrollments,
  };
}