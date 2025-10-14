import { useState, useEffect } from 'react';
import { listCourses } from '@/api/courses';
import { useI18n } from '@/lib/i18n';

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor?: string;
  instructorAvatar?: string;
  image?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  students?: number;
  duration?: string;
  lessons?: number;
  level?: "Beginner" | "Intermediate" | "Advanced";
  category?: string;
  tags?: string[];
  features?: string[];
  isPopular?: boolean;
  isBestseller?: boolean;
  isNew?: boolean;
  lastUpdated?: string;
  language?: string;
  certificate?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  courseCount: number;
  gradient: string;
}

// const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop';
// const PLACEHOLDER_AVATAR = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face';

// export function useCourses() {
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [categories, setCategories] = useState<CourseCategory[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const { data } = await listCourses({ status: 'published' });
//         const list = Array.isArray(data) ? data : (data as any)?.results || [];
//         const mapped: Course[] = list.map((c: any) => ({
//           id: c.id,
//           title: c.title ?? 'Untitled Course',
//           description: c.description ?? '',
//           price: Number(c.price || 0),
//           image: c.thumbnail || PLACEHOLDER_IMAGE,
//           createdAt: c.created_at,
//           updatedAt: c.updated_at,
//           // Safe defaults for UI
//           instructor: 'Instructor',
//           instructorAvatar: PLACEHOLDER_AVATAR,
//           category: c.category || 'All',
//           duration: c.duration || '0 hours',
//           lessons: 0,
//           rating: 4.5,
//           reviews: 0,
//           isPopular: false,
//           isBestseller: false,
//           isNew: false,
//           level: 'Beginner',
//         }));
//         setCourses(mapped);

//         const categoriesData: CourseCategory[] = [
//           { id: 'all', name: 'All', description: '', icon: '📚', courseCount: mapped.length, gradient: 'bg-gradient-to-br from-slate-500 to-gray-600' },
//         ];
//         setCategories(categoriesData);
//       } catch (err: any) {
//         setError(err?.message || 'Failed to fetch courses');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCourses();
//   }, []);

//   const getFeaturedCourses = (limit: number = 6): Course[] => {
//     return courses.slice(0, limit);
//   };

//   const getCoursesByCategory = (_category: string): Course[] => {
//     return courses;
//   };

//   const getTotalCourseCount = (): number => courses.length;
//   const getTotalStudentCount = (): number => 0;

//   return {
//     courses,
//     categories,
//     loading,
//     error,
//     getFeaturedCourses,
//     getCoursesByCategory,
//     getTotalCourseCount,
//     getTotalStudentCount,
//     refetch: () => {
//       setLoading(true);
//       setError(null);
//       listCourses({ status: 'published' })
//         .then(({ data }) => {
//           const list = Array.isArray(data) ? data : (data as any)?.results || [];
//           const mapped: Course[] = list.map((c: any) => ({
//             id: c.id,
//             title: c.title ?? 'Untitled Course',
//             description: c.description ?? '',
//             price: Number(c.price || 0),
//             image: c.thumbnail || PLACEHOLDER_IMAGE,
//             createdAt: c.created_at,
//             updatedAt: c.updated_at,
//             instructor: 'Instructor',
//             instructorAvatar: PLACEHOLDER_AVATAR,
//             category: 'All',
//             duration: '0 hours',
//             lessons: 0,
//             rating: 4.5,
//             reviews: 0,
//             isPopular: false,
//             isBestseller: false,
//             isNew: false,
//             level: 'Beginner',
//           }));
//           setCourses(mapped);
//         })
//         .catch((err) => setError(err?.message || 'Failed to fetch courses'))
//         .finally(() => setLoading(false));
//     },
//   };
// }


const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop";
const PLACEHOLDER_AVATAR =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 const { t, language } = useI18n();
  useEffect(() => {
    const fetchCourses = async () => {
      
      try {
        setLoading(true);
        setError(null);
        const { data } = await listCourses({ status: "published" });
        const list = Array.isArray(data) ? data : data?.results || [];

        const mapped: Course[] = list.map((c: any) => ({
          id: c.id,
          title: c.title || "Untitled Course",
          description: c.description || "",
          price: Number(c.price || 0),
          image: c.thumbnail || PLACEHOLDER_IMAGE,

          // ✅ Instructor (take first name if available)
          instructor:
            Array.isArray(c.instructors) && c.instructors.length > 0
              ? c.instructors[0]
              : "Unknown Instructor",

          // ✅ Instructor avatar (placeholder, backend doesn’t provide it yet)
          instructorAvatar: PLACEHOLDER_AVATAR,

          // ✅ Lessons count (prefer videos_count, fallback to media.length)
          lessons:
            c.videos_count ||
            (Array.isArray(c.media) ? c.media.length : 0) ||
            0,

          // ✅ Category
          category: c.category || "General",

          // ✅ Duration
          duration: c.duration ? `${c.duration} ${language === "ar" ? "ساعات" : "Hours"}` : "N/A",

          // ✅ Dates
          createdAt: c.created_at,
          updatedAt: c.updated_at,

          // ✅ Optional display info
          rating: 4.5 ,
          reviews: 0,
          students: Math.floor(Math.random() * 5000),
          level: "Beginner",
          certificate: true,
        }));

        setCourses(mapped);

        // ✅ Build categories dynamically from backend
        const categoryMap = new Map<string, number>();
        mapped.forEach((course) => {
          const category = course.category || "General";
          categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
        });

        const categoriesData: CourseCategory[] = [
          {
            id: "all",
            name: "All",
            description: "",
            icon: "📚",
            courseCount: mapped.length,
            gradient: "bg-gradient-to-br from-slate-500 to-gray-600",
          },
          ...Array.from(categoryMap.entries()).map(([name, count]) => ({
            id: name.toLowerCase().replace(/\s+/g, "-"),
            name,
            description: "",
            icon: "📘",
            courseCount: count,
            gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
          })),
        ];

        setCategories(categoriesData);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return {
    courses,
    categories,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      listCourses({ status: "published" })
        .then(({ data }) => {
          const list = Array.isArray(data) ? data : data?.results || [];
          const mapped = list.map((c: any) => ({
            id: c.id,
            title: c.title || "Untitled Course",
            description: c.description || "",
            price: Number(c.price || 0),
            image: c.thumbnail || PLACEHOLDER_IMAGE,
            instructor:
              Array.isArray(c.instructors) && c.instructors.length > 0
                ? c.instructors[0]
                : "Unknown Instructor",
            instructorAvatar: PLACEHOLDER_AVATAR,
            lessons:
              c.videos_count ||
              (Array.isArray(c.media) ? c.media.length : 0) ||
              0,
            category: c.category || "General",
          }));
          setCourses(mapped);
        })
        .catch((err) => setError(err?.message || "Failed to fetch courses"))
        .finally(() => setLoading(false));
    },
  };
}
