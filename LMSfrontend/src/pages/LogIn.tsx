import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { login as loginApi } from "@/api/auth";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/lib/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

export function LoginPage() {
	const { t, language } = useI18n();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();
	const { toast } = useToast();
	const setIsLogIn = useStore((s) => s.setIsLogIn);
	const { login } = useAuth();
	const [errors, setErrors] = useState({ email: "", password: "" });

	const validateEmail = (val: string) => {
		if (!val) return language === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required";
		if (!/\S+@\S+\.\S+/.test(val)) return language === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email format";
		return "";
	};

	const validatePassword = (val: string) => {
		if (!val) return language === "ar" ? "كلمة المرور مطلوبة" : "Password is required";
		return "";
	};

	const handleEmailChange = (val: string) => {
		setEmail(val);
		setErrors(prev => ({ ...prev, email: validateEmail(val) }));
	};

	const handlePasswordChange = (val: string) => {
		setPassword(val);
		setErrors(prev => ({ ...prev, password: validatePassword(val) }));
	};

	async function handleLogin(e: React.FormEvent) {
		e.preventDefault();
		const emailErr = validateEmail(email);
		const passErr = validatePassword(password);

		if (emailErr || passErr) {
			setErrors({ email: emailErr, password: passErr });
			return;
		}

		setIsSubmitting(true);
		try {
			// Use the auth context login function
			await login(email, password);
			setIsLogIn(true);
			toast({
				title: t("login.success"),
				description: language === "ar" ? "تم تسجيل الدخول بنجاح" : "Login successful",
			});

			// Redirect based on user role - this will be handled by the routing system
			// The ProtectedRoute and RoleBasedRoute components will handle the redirection
			navigate("/dashboard", { replace: true });
		} catch (error: any) {
			console.error("Login error:", error);
			let errorMessage = language === "ar" ? "فشل في تسجيل الدخول" : "Login failed";
			toast({ title: t("login.error"), description: errorMessage, variant: "destructive" });
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Navigation />
			<main className="flex-1 flex items-center justify-center p-4">
				<div className="w-full max-w-md mx-auto p-8 rounded-xl border border-border bg-card shadow-lg">
					<div className="flex flex-col space-y-6">
						<div className="text-center">
							<img
								src="https://smartonlinelearningedu.com/static/media/WhatsApp%20Image%202025-05-26%20at%2000.38.02_5277dbf4.f388d82bb2a41fa81dbf.jpg"
								alt={t("nav.academy")}
								className="h-20 w-20 object-cover rounded-full mx-auto mb-4 shadow-md"
							/>
							<h2 className="text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-4">
								{t("nav.academy")}
							</h2>
						</div>
						<div className="text-center">
							<h1 className="text-2xl font-bold tracking-tight text-foreground">
								{language === "ar" ? "تسجيل الدخول" : "Login to your account"}
							</h1>
							<p className="text-sm text-muted-foreground mt-2">
								{language === "ar" ? "أي بيانات ستقوم بإدخالها ستؤدي إلى الدخول" : "Any credentials you enter will allow you to login"}
							</p>
						</div>
						<form className="space-y-4" onSubmit={handleLogin}>
							<div className="space-y-2">
								<Label htmlFor="email" className="text-foreground">
									{language === "ar" ? "البريد الإلكتروني" : "Email"}
								</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="email"
										type="email"
										placeholder={language === "ar" ? "student@example.com" : "student@example.com"}
										className={`pl-10 border-border bg-background text-foreground placeholder:text-muted-foreground ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
										value={email}
										onChange={(e) => handleEmailChange(e.target.value)}
									/>
								</div>
								{errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
							</div>
							<div className="space-y-2">
								<Label htmlFor="password" className="text-foreground">
									{language === "ar" ? "كلمة المرور" : "Password"}
								</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="••••••••"
										className={`pl-10 pr-10 border-border bg-background text-foreground placeholder:text-muted-foreground ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
										value={password}
										onChange={(e) => handlePasswordChange(e.target.value)}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
								{errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
							</div>
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? (language === "ar" ? "جاري الدخول..." : "Signing in...") : (language === "ar" ? "دخول" : "Sign in")}
							</Button>
						</form>
						<div className="text-center">
							<p className="text-sm text-muted-foreground">
								{language === "ar" ? "يمكنك إدخال أي بيانات للدخول إلى الداشبورد" : "You can enter any credentials to access the dashboard"}
							</p>
						</div>
						<div className="text-center border-t border-border pt-4">
							<p className="text-sm text-muted-foreground">
								{language === "ar" ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
								<Link to="/SignUp" className="font-medium text-primary hover:text-primary/80 underline underline-offset-4">
									{language === "ar" ? "إنشاء حساب جديد" : "Create an account"}
								</Link>
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}