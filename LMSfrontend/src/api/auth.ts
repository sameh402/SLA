import api from "./client";

export async function login(username: string, password: string) {
	const { data } = await api.post("/api/auth/token/", { username, password });
	localStorage.setItem("access", data.access);
	localStorage.setItem("refresh", data.refresh);
	return data;
}

export async function register(payload: {
	email: string;
	password: string;
	first_name?: string;
	last_name?: string;
	phone?: string;
	country?: string;
	age?: string | number;
}) {
	return api.post("/api/users/register/", payload);
}

export const getProfile = () => api.get("/api/users/profile/");
export const updateProfile = (payload: FormData | Record<string, any>) => api.patch("/api/users/profile/", payload);

