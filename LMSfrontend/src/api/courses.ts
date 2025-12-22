import api from "./client";

export interface BackendCourse {
	id: number;
	title: string;
	description: string;
	status: string;
	price: string | number;
	thumbnail?: string;
	created_by: number;
	created_at: string;
	updated_at: string;
	category?: string;
	duration?: string;
	next_course_recommendation?: string;
	instructors: string[];
	}

export const listCourses = (params?: Record<string, any>) => api.get<BackendCourse[]>("/api/courses/", { params });
export const getCourse = (id: number) => api.get<BackendCourse>(`/api/courses/${id}/`);

