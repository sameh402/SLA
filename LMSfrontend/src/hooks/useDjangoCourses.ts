import { useQuery } from "@tanstack/react-query";
import api from "@/api/client";

export interface DjangoCourse {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'published';
  price: string; // Decimal field comes as string from API
  thumbnail?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  media: CourseMedia[];
  category?: string;
  duration?: string;
  next_course_recommendation?: string;
  instructors: string[];
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

export interface CourseListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DjangoCourse[];
}

interface UseDjangoCoursesOptions {
  search?: string;
  status?: 'draft' | 'published';
  page?: number;
  ordering?: string;
}

export function useDjangoCourses(options: UseDjangoCoursesOptions = {}) {
  const { search, status, page = 1, ordering } = options;

  return useQuery<CourseListResponse>({
    queryKey: ['django-courses', { search, status, page, ordering }],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (page > 1) params.append('page', page.toString());
      if (ordering) params.append('ordering', ordering);

      const response = await api.get(`/api/courses/?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDjangoCourse(id: number) {
  return useQuery<DjangoCourse>({
    queryKey: ['django-course', id],
    queryFn: async () => {
      const response = await api.get(`/api/courses/${id}/`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Utility functions for course data transformation
export function transformCourseForDisplay(course: DjangoCourse) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    price: parseFloat(course.price),
    thumbnail: course.thumbnail,
    category: course.category || "Uncategorized",
    duration: course.duration || "N/A",
    nextCourseRecommendation: course.next_course_recommendation || null,
    instructors: course.instructors || [],
    status: course.status,
    created_at: course.created_at,
    updated_at: course.updated_at,
    mediaCount: course.media?.length || 0,
    hasVideo: course.media?.some(m => m.media_type === 'video') || false,
  };
}

export function getCourseCategories(courses: DjangoCourse[]) {
  // Since we don't have categories in the backend yet, we'll create mock categories
  // based on course titles/descriptions for now
  const categories = new Map();
  
  courses.forEach(course => {
    const title = course.title.toLowerCase();
    const desc = course.description.toLowerCase();
    
    let category = 'General';
    
    if (title.includes('french') || title.includes('german') || title.includes('chinese') || title.includes('english') || title.includes('language')) {
      category = 'Languages';
    } else if (title.includes('web') || title.includes('python') || title.includes('programming') || title.includes('development') || title.includes('code')) {
      category = 'Programming';
    } else if (title.includes('design') || title.includes('art') || title.includes('graphic') || title.includes('creative')) {
      category = 'Design';
    } else if (title.includes('health') || title.includes('medical') || title.includes('hospital') || title.includes('first aid')) {
      category = 'Healthcare';
    } else if (title.includes('business') || title.includes('management') || title.includes('marketing') || title.includes('project')) {
      category = 'Business';
    } else if (title.includes('math') || title.includes('calculation') || title.includes('logic')) {
      category = 'Mathematics';
    }
    
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category).push(course);
  });
  
  return Array.from(categories.entries()).map(([name, courses]) => ({
    name,
    courseCount: courses.length,
    courses,
  }));
}

