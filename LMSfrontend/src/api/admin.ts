import api from "./client";

export interface AdminUser {
	id: number;
	username: string;
	email: string;
	first_name?: string;
	last_name?: string;
	role: 'student' | 'instructor' | 'admin';
	is_active: boolean;
	is_staff: boolean;
	date_joined?: string;
	phone:string,
	country:string

}
export const countrydistribution = (params?:Record<string,any>)=>api.get('/api/admin/users/country_distribution/',{params});

export const adminListUsers = (params?: Record<string, any>) => api.get('/api/admin/users/', { params });
export const adminCreateUser = (payload: Partial<AdminUser> & { password?: string }) => api.post('/api/admin/users/', payload);
export const adminUpdateUser = (id: number, payload: Partial<AdminUser> & { password?: string }) => api.patch(`/api/admin/users/${id}/`, payload);
export const adminDeleteUser = (id: number) => api.delete(`/api/admin/users/${id}/`);
export const adminGetUserProfile = (id: number) => api.get(`/api/admin/users/profile/${id}/`);

export const adminListCourses = (params?: Record<string, any>) => api.get('/api/admin/courses/', { params });
export const adminCreateCourse = (payload: any) => api.post('/api/admin/courses/', payload);
export const adminUpdateCourse = (id: number, payload: any) => api.patch(`/api/admin/courses/${id}/`, payload);
export const adminDeleteCourse = (id: number) => api.delete(`/api/admin/courses/${id}/`);
export const adminGetCourseProfile = (id: number) => api.get(`/api/admin/courses/profile/${id}/`);

// Multipart variants for file uploads
export const adminCreateCourseMultipart = (form: FormData) => api.post('/api/admin/courses/', form, { headers: { 'Content-Type': 'multipart/form-data' } });
export const createCourseMedia = (courseId: number, form: FormData) => {
    // Log the form data for debugging
    console.log(`Creating course media for course ${courseId}`);
    
    // Use the original endpoint that was working
    return api.post(`/api/course-media/`, form, { 
        headers: { 'Content-Type': 'multipart/form-data' },
        // Add timeout for debugging
        timeout: 30000
    });
};
export const adminDeleteCourseMedia = (courseId: number, mediaId: number) => api.delete(`/api/courses/${courseId}/media/${mediaId}/`);
export const listCourseMedia = (params?: Record<string, any>) => api.get('/api/course-media/', { params });

export const adminListEnrollments = (params?: Record<string, any>) => api.get('/api/admin/enrollments/', { params });
export const adminUpdateEnrollment = (id: number, payload: any) => api.patch(`/api/admin/enrollments/${id}/`, payload);
export const adminDeleteEnrollment = (id: number) => api.delete(`/api/admin/enrollments/${id}/`);

export const adminListPayments = (params?: Record<string, any>) => api.get('/api/admin/payments/', { params });
export const adminUpdatePayment = (id: number, payload: any) => api.patch(`/api/admin/payments/${id}/`, payload);
export const adminDeletePayment = (id: number) => api.delete(`/api/admin/payments/${id}/`);

export const adminSummary = () => api.get('/api/admin/summary');




// Get all enrolled students for a specific course
export const adminGetCourseEnrolledStudents = (courseId: number) => 
    api.get(`/api/admin/courses/${courseId}/enrolled-students/`);
// GET all videos for all courses
// export const adminListAllVideos = () => 
// 	api.get('/api/admin/courses/videos/');

export const adminGetCourseMedia = (courseId: number) =>
  api.get(`/api/course-media/?course=${courseId}`);




export const getCourseCategoryPopularity = () => 
  api.get("/api/admin/courses/category-popularity/");

export const adminRevenueAnalytics = ()=> api.get("/api/admin/revenue_analytics/");
