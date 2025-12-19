import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import { CountryCodeSelector } from "@/components/CountryCodeSelector";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { register as apiRegister, checkUsername } from "@/api/auth";
import { Check, X, Loader2 } from "lucide-react";

export function SignUpPage() {
	const [ageGroup, setAgeGroup] = useState<"over16" | "under16" | null>(null);
	const navigate = useNavigate();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();
	const { language } = useI18n();

	const [formData, setFormData] = useState({
		username: "",
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

	const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
	const [isCheckingUsername, setIsCheckingUsername] = useState(false);

	useEffect(() => {
		const timer = setTimeout(async () => {
			if (formData.username.length >= 3) {
				setIsCheckingUsername(true);
				try {
					const available = await checkUsername(formData.username);
					setUsernameAvailable(available);
				} catch (error) {
					console.error("Error checking username:", error);
				} finally {
					setIsCheckingUsername(false);
				}
			} else {
				setUsernameAvailable(null);
			}
		}, 500);

		return () => clearTimeout(timer);
	}, [formData.username]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((f) => ({ ...f, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.password !== formData.confirmPassword) {
			toast({ title: "Error", description: language === "ar" ? "كلمة المرور غير متطابقة" : "Passwords do not match.", variant: "destructive" });
			return;
		}
		if (usernameAvailable === false) {
			toast({ title: "Error", description: language === "ar" ? "اسم المستخدم مأخوذ بالفعل" : "Username is already taken.", variant: "destructive" });
			return;
		}
		if (formData.username.length < 3) {
			toast({ title: "Error", description: language === "ar" ? "اسم المستخدم قصير جداً" : "Username is too short.", variant: "destructive" });
			return;
		}
		const userAge = parseInt(formData.age);
		if (!userAge || userAge < 1 || userAge > 100) {
			toast({ title: "Error", description: language === "ar" ? "يرجى إدخال عمر صحيح" : "Please enter a valid age", variant: "destructive" });
			return;
		}
		if (ageGroup === "under16" && (!formData.guardianFirstName || !formData.guardianLastName)) {
			toast({ title: "Error", description: language === "ar" ? "يرجى إدخال بيانات ولي الأمر" : "Please enter guardian information", variant: "destructive" });
			return;
		}

		setIsSubmitting(true);
		try {
			await apiRegister({
				username: formData.username,
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
			toast({ title: "Error", description: errorMessage, variant: "destructive" });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navigation />
			<main className="flex-1 flex items-center justify-center p-4">
				<div className="w-full max-w-md mx-auto p-8 rounded-xl border bg-background shadow-lg">
					<div className="text-center mb-6">
						<h1 className="text-2xl font-bold text-foreground">{language === "ar" ? "إنشاء حساب جديد" : "Create Your Account"}</h1>
						<p className="text-sm text-muted-foreground mt-2">{language === "ar" ? "انضم إلى منصة التعلم وابدأ رحلتك التعليمية" : "Join our learning platform and start your educational journey"}</p>
					</div>
					{ageGroup === null ? (
						<div className="space-y-6">
							<h2 className="text-lg font-medium text-center">{language === "ar" ? "هل عمرك 16 عاماً أو أكثر؟" : "Are you 16 years or older?"}</h2>
							<div className="flex justify-center gap-4">
								<Button onClick={() => setAgeGroup("over16")} variant="outline">{language === "ar" ? "نعم، 16+ عاماً" : "Yes, I'm 16+"}</Button>
								<Button onClick={() => setAgeGroup("under16")} variant="outline">{language === "ar" ? "تحت 16 عاماً" : "Under 16"}</Button>
							</div>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-4">
							<h2 className="text-lg font-medium text-center mb-4">{ageGroup === "under16" ? (language === "ar" ? "بيانات الطالب وولي الأمر" : "Student & Guardian Information") : (language === "ar" ? "إنشاء حسابك" : "Create Your Account")}</h2>

							<div className="space-y-2">
								<Label htmlFor="username">{language === "ar" ? "اسم المستخدم" : "Username"}</Label>
								<div className="relative">
									<Input
										id="username"
										name="username"
										value={formData.username}
										onChange={handleChange}
										required
										placeholder={language === "ar" ? "اختر اسم مستخدم فريد" : "Choose a unique username"}
										className={usernameAvailable === false ? "border-red-500" : usernameAvailable === true ? "border-green-500" : ""}
									/>
									<div className="absolute right-3 top-1/2 -translate-y-1/2">
										{isCheckingUsername ? (
											<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
										) : usernameAvailable === true ? (
											<Check className="h-4 w-4 text-green-500" />
										) : usernameAvailable === false ? (
											<X className="h-4 w-4 text-red-500" />
										) : null}
									</div>
								</div>
								{usernameAvailable === false && (
									<p className="text-xs text-red-500">{language === "ar" ? "اسم المستخدم هذا مأخوذ بالفعل" : "This username is already taken"}</p>
								)}
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">{language === "ar" ? "الاسم الأول" : "First Name"}</Label>
									<Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">{language === "ar" ? "الاسم الأخير" : "Last Name"}</Label>
									<Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">{language === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
								<Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
							</div>
							<div className="space-y-2">
								<Label htmlFor="country">{language === "ar" ? "البلد" : "Country"}</Label>
								<Input id="country" name="country" value={formData.country} onChange={handleChange} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="age">{language === "ar" ? "العمر" : "Age"}</Label>
								<Input id="age" name="age" type="number" min="1" max="100" value={formData.age} onChange={handleChange} required placeholder={language === "ar" ? "أدخل عمرك" : "Enter your age"} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="phoneNumber">{language === "ar" ? "رقم الواتساب" : "WhatsApp Number"}</Label>
								<div className="flex gap-2">
									<CountryCodeSelector value={formData.countryCode} onValueChange={(v) => setFormData((f) => ({ ...f, countryCode: v }))} />
									<Input id="phoneNumber" name="phoneNumber" type="tel" placeholder={language === "ar" ? "رقم الهاتف" : "Phone number"} value={formData.phoneNumber} onChange={handleChange} required />
								</div>
							</div>
							{ageGroup === "under16" && (
								<>
									<div className="space-y-2">
										<Label htmlFor="age">{language === "ar" ? "العمر" : "Age"}</Label>
										<Input id="age" name="age" type="number" min="1" max="15" value={formData.age} onChange={handleChange} required />
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="guardianFirstName">{language === "ar" ? "اسم ولي الأمر الأول" : "Guardian First Name"}</Label>
											<Input id="guardianFirstName" name="guardianFirstName" value={formData.guardianFirstName} onChange={handleChange} required />
										</div>
										<div className="space-y-2">
											<Label htmlFor="guardianLastName">{language === "ar" ? "اسم ولي الأمر الأخير" : "Guardian Last Name"}</Label>
											<Input id="guardianLastName" name="guardianLastName" value={formData.guardianLastName} onChange={handleChange} required />
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="guardianPhone">{language === "ar" ? "رقم هاتف ولي الأمر" : "Guardian Phone Number"}</Label>
										<div className="flex gap-2">
											<CountryCodeSelector value={formData.guardianCountryCode} onValueChange={(v) => setFormData((f) => ({ ...f, guardianCountryCode: v }))} />
											<Input id="guardianPhone" name="guardianPhone" type="tel" placeholder={language === "ar" ? "رقم هاتف ولي الأمر" : "Guardian phone number"} value={formData.guardianPhone} onChange={handleChange} />
										</div>
									</div>
								</>
							)}
							<div className="space-y-2">
								<Label htmlFor="password">{language === "ar" ? "كلمة المرور" : "Password"}</Label>
								<Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
							</div>
							<div className="space-y-2">
								<Label htmlFor="confirmPassword">{language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}</Label>
								<Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
							</div>
							<Button type="submit" className="w-full" disabled={isSubmitting || usernameAvailable === false}>
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