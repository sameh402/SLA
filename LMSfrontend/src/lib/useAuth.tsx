import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin } from "@/api/auth";

interface AuthUser {
	email: string;
}

interface AuthContextValue {
	user: AuthUser | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const access = localStorage.getItem("access");
		const email = localStorage.getItem("username");
		if (access && email) {
			setUser({ email });
		}
		setLoading(false);
	}, []);

	const login = async (email: string, password: string) => {
		await apiLogin(email, password);
		localStorage.setItem("username", email);
		setUser({ email });
	};

	const logout = () => {
		localStorage.removeItem("access");
		localStorage.removeItem("refresh");
		localStorage.removeItem("username");
		setUser(null);
	};

	const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
};

