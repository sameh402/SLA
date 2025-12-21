import axios from "axios";

const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
	withCredentials: false,
});

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

api.interceptors.request.use((config) => {
	const access = typeof window !== "undefined" ? localStorage.getItem("access") : null;
	if (access) {
		config.headers = { ...(config.headers ?? {}), Authorization: `Bearer ${access}` } as any;
	}
	return config;
});

api.interceptors.response.use(
	(res) => res,
	async (error) => {
		const original = error.config || {};
		if (error.response?.status === 401 && !original._retry) {
			original._retry = true;
			if (isRefreshing) {
				await new Promise<void>((resolve) => refreshQueue.push(resolve));
			} else {
				try {
					isRefreshing = true;
					const refresh = typeof window !== "undefined" ? localStorage.getItem("refresh") : null;
					if (!refresh) throw new Error("No refresh token");
					const r = await axios.post(`${api.defaults.baseURL}/api/auth/token/refresh/`, { refresh });
					localStorage.setItem("access", r.data.access);
					refreshQueue.forEach((fn) => fn());
					refreshQueue = [];
				} finally {
					isRefreshing = false;
				}
			}
			const access = typeof window !== "undefined" ? localStorage.getItem("access") : null;
			if (access) {
				original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${access}` } as any;
			}
			return api(original);
		}
		return Promise.reject(error);
	}
);

export default api;
