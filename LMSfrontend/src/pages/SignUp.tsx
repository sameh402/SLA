import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import { CountryCodeSelector } from "@/components/CountryCodeSelector";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { register as apiRegister } from "@/api/auth";
import { Eye, EyeOff } from "lucide-react";

export function SignUpPage() {
	const [ageGroup, setAgeGroup] = useState<"over16" | "under16" | null>(null);
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();
	const { language } = useI18n();
	const [showPassword, setShowPassword] = useState(false);

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		age: "",
		country: "",
		guardianFirstName: "",
		guardianLastName: "",
		guardianCountryCode: "+20",
		guardianPhone: "",
		countryCode: "+20",
		phoneNumber: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateField = (name: string, value: string) => {
		switch (name) {
			case "email":
				if (!value) return language === "ar" ? "البريد الإلكتروني مطلوب" : "Email is required";
				if (!/\S+@\S+\.\S+/.test(value)) return language === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email format";
				return "";
			case "password":
				if (value.length < 8) return language === "ar" ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل" : "Password must be at least 8 characters";
				if (!/[A-Z]/.test(value)) return language === "ar" ? "يجب أن تحتوي على حرف كبير" : "Must contain an uppercase letter";
				if (!/[a-z]/.test(value)) return language === "ar" ? "يجب أن تحتوي على حرف صغير" : "Must contain a lowercase letter";
				if (!/[0-9]/.test(value)) return language === "ar" ? "يجب أن تحتوي على رقم" : "Must contain a digit";
				if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(value)) return language === "ar" ? "يجب أن تحتوي على رمز خاص" : "Must contain a special character";
				return "";
			case "confirmPassword":
				if (value !== formData.password) return language === "ar" ? "كلمة المرور غير متطابقة" : "Passwords do not match";
				return "";
			case "age":
				const age = parseInt(value);
				if (!value) return language === "ar" ? "العمر مطلوب" : "Age is required";
				if (isNaN(age) || age < 1 || age > 100) return language === "ar" ? "عمر غير صالح" : "Invalid age";
				if (ageGroup === "under16" && age >= 16) return language === "ar" ? "يجب أن يكون العمر أقل من 16" : "Age must be under 16";
				if (ageGroup === "over16" && age < 16) return language === "ar" ? "يجب أن يكون العمر 16 أو أكثر" : "Age must be 16 or older";
				return "";
			case "phoneNumber":
				if (!value) return language === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required";
				if (!/^\d{7,15}$/.test(value)) return language === "ar" ? "رقم هاتف غير صالح" : "Invalid phone number";
				return "";
			default:
				return "";
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((f) => ({ ...f, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));

		// Re-validate confirm password if password changes
		if (name === "password") {
			setErrors((prev) => ({ ...prev, confirmPassword: value !== formData.confirmPassword ? (language === "ar" ? "كلمة المرور غير متطابقة" : "Passwords do not match") : "" }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Final validation check
		const newErrors: Record<string, string> = {};
		Object.keys(formData).forEach(key => {
			const err = validateField(key, (formData as any)[key]);
			if (err) newErrors[key] = err;
		});

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			toast({ title: "Error", description: language === "ar" ? "يرجى تصحيح الأخطاء قبل الإرسال" : "Please fix errors before submitting", variant: "destructive" });
			return;
		}

		setIsSubmitting(true);
		try {
			await apiRegister({
				email: formData.email,
				password: formData.password,
				first_name: formData.firstName,
				last_name: formData.lastName,
				phone: `${formData.countryCode}${formData.phoneNumber}`,
				country: formData.country,
				age: formData.age,
			});
			toast({ title: language === "ar" ? "تم إنشاء الحساب" : "Account Created", description: language === "ar" ? "تم إنشاء حسابك بنجاح" : "Your account has been created successfully" });
			navigate("/LogIn", { replace: true });
		} catch (error: any) {
			console.error("Sign up error:", error);
			let errorMessage = language === "ar" ? "فشل في إنشاء الحساب" : "Failed to create account";
			if (error.response?.data) {
				const data = error.response.data;
				if (data.email) errorMessage = language === "ar" ? "البريد الإلكتروني مستخدم بالفعل" : "Email already in use";
				else if (data.username) errorMessage = language === "ar" ? "اسم المستخدم مستخدم بالفعل" : "Username already in use";
			}
			toast({ title: "Error", description: errorMessage, variant: "destructive" });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Navigation />
			<main className="flex-1 flex items-center justify-center p-4">
				<div className="w-full max-w-md mx-auto p-8 rounded-xl border border-border bg-card shadow-lg">
					<div className="text-center mb-6">
						<h1 className="text-2xl font-bold text-foreground">{language === "ar" ? "إنشاء حساب جديد" : "Create Your Account"}</h1>
						<p className="text-sm text-muted-foreground mt-2">{language === "ar" ? "انضم إلى منصة التعلم وابدأ رحلتك التعليمية" : "Join our learning platform and start your educational journey"}</p>
					</div>
					{ageGroup === null ? (
						<div className="space-y-6">
							<h2 className="text-lg font-medium text-center">{language === "ar" ? "هل عمرك 16 عاماً أو أكثر؟" : "Are you 16 years or older?"}</h2>
							<div className="flex justify-center gap-4">
								<Button onClick={() => setAgeGroup("over16")} variant="outline" className="w-full">{language === "ar" ? "نعم، 16+ عاماً" : "Yes, I'm 16+"}</Button>
								<Button onClick={() => setAgeGroup("under16")} variant="outline" className="w-full">{language === "ar" ? "تحت 16 عاماً" : "Under 16"}</Button>
							</div>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							<h2 className="text-lg font-medium text-center mb-4">{ageGroup === "under16" ? (language === "ar" ? "بيانات الطالب وولي الأمر" : "Student & Guardian Information") : (language === "ar" ? "بيانات الحساب" : "Account Details")}</h2>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<Label htmlFor="firstName">{language === "ar" ? "الاسم الأول" : "First Name"}</Label>
									<Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
								</div>
								<div className="space-y-1">
									<Label htmlFor="lastName">{language === "ar" ? "الاسم الأخير" : "Last Name"}</Label>
									<Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
								</div>
							</div>

							<div className="space-y-1">
								<Label htmlFor="email">{language === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
								<Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className={errors.email ? "border-red-500" : ""} />
								{errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<Label htmlFor="country">{language === "ar" ? "البلد" : "Country"}</Label>
									<Input id="country" name="country" value={formData.country} onChange={handleChange} />
								</div>
								<div className="space-y-1">
									<Label htmlFor="age">{language === "ar" ? "العمر" : "Age"}</Label>
									<Input id="age" name="age" type="number" min="1" max="100" value={formData.age} onChange={handleChange} required className={errors.age ? "border-red-500" : ""} />
									{errors.age && <p className="text-xs text-red-500">{errors.age}</p>}
								</div>
							</div>

							<div className="space-y-1">
								<Label htmlFor="phoneNumber">{language === "ar" ? "رقم الواتساب" : "WhatsApp Number"}</Label>
								<div className="flex gap-2">
									<CountryCodeSelector value={formData.countryCode} onValueChange={(v) => setFormData((f) => ({ ...f, countryCode: v }))} />
									<Input id="phoneNumber" name="phoneNumber" type="tel" placeholder={language === "ar" ? "رقم الهاتف" : "Phone number"} value={formData.phoneNumber} onChange={handleChange} required className={errors.phoneNumber ? "border-red-500" : ""} />
								</div>
								{errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber}</p>}
							</div>

							{ageGroup === "under16" && (
								<div className="space-y-4 border-t border-border pt-4 mt-4">
									<h3 className="text-sm font-semibold">{language === "ar" ? "بيانات ولي الأمر" : "Guardian Details"}</h3>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-1">
											<Label htmlFor="guardianFirstName">{language === "ar" ? "الاسم الأول" : "First Name"}</Label>
											<Input id="guardianFirstName" name="guardianFirstName" value={formData.guardianFirstName} onChange={handleChange} required />
										</div>
										<div className="space-y-1">
											<Label htmlFor="guardianLastName">{language === "ar" ? "الاسم الأخير" : "Last Name"}</Label>
											<Input id="guardianLastName" name="guardianLastName" value={formData.guardianLastName} onChange={handleChange} required />
										</div>
									</div>
									<div className="space-y-1">
										<Label htmlFor="guardianPhone">{language === "ar" ? "رقم هاتف ولي الأمر" : "Guardian Phone"}</Label>
										<div className="flex gap-2">
											<CountryCodeSelector value={formData.guardianCountryCode} onValueChange={(v) => setFormData((f) => ({ ...f, guardianCountryCode: v }))} />
											<Input id="guardianPhone" name="guardianPhone" type="tel" placeholder={language === "ar" ? "رقم الهاتف" : "Phone number"} value={formData.guardianPhone} onChange={handleChange} />
										</div>
									</div>
								</div>
							)}

							<div className="space-y-1">
								<Label htmlFor="password">{language === "ar" ? "كلمة المرور" : "Password"}</Label>
								<div className="relative">
									<Input
										id="password"
										name="password"
										type={showPassword ? "text" : "password"}
										value={formData.password}
										onChange={handleChange}
										required
										className={errors.password ? "border-red-500 pr-10" : "pr-10"}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									>
										{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
								{errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
							</div>

							<div className="space-y-1">
								<Label htmlFor="confirmPassword">{language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}</Label>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type={showPassword ? "text" : "password"}
									value={formData.confirmPassword}
									onChange={handleChange}
									required
									className={errors.confirmPassword ? "border-red-500" : ""}
								/>
								{errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
							</div>

							<Button type="submit" className="w-full mt-6" disabled={isSubmitting || Object.values(errors).some(e => e !== "")}>
								{isSubmitting ? (language === "ar" ? "جاري إنشاء الحساب..." : "Signing Up…") : (language === "ar" ? "إنشاء الحساب" : "Create Account")}
							</Button>
						</form>
					)}
					<div className="text-center border-t border-border pt-4 mt-6">
						<p className="text-sm text-muted-foreground">
							{language === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
							<Link to="/LogIn" className="font-medium text-primary hover:text-primary/80 underline underline-offset-4">{language === "ar" ? "تسجيل الدخول" : "Log in"}</Link>
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}