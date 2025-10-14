import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import { 
	User, 
	Mail, 
	Shield, 
	Upload,
	Save,
	RefreshCw,
	AlertCircle,
	CheckCircle,
	Eye,
	EyeOff,
	Camera,
	Edit
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface UserProfile {
	id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	role: 'student' | 'instructor' | 'admin';
	avatar?: string;
	bio: string;
}

const SettingCard = ({ title, description, children, icon: Icon }: {
	title: string;
	description: string;
	children: React.ReactNode;
	icon: any;
}) => (
	<Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-0 shadow-lg">
		<CardContent className="p-6">
			<div className="flex items-start gap-4 mb-6">
				<div className="p-2 bg-primary/10 rounded-lg">
					<Icon size={20} className="text-primary" />
				</div>
				<div>
					<h3 className="text-lg font-semibold">{title}</h3>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
			</div>
			{children}
		</CardContent>
	</Card>
);

export default function AdminSettings() {
	const { t } = useI18n();
	const queryClient = useQueryClient();
	const [showChangePassword, setShowChangePassword] = useState(false);
	const [passwordData, setPasswordData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});
	const [showPasswords, setShowPasswords] = useState(false);

	// Fetch current user profile
	const { data: profile, isLoading, error } = useQuery<UserProfile>({
		queryKey: ['user-profile'],
		queryFn: async () => (await api.get('/api/users/profile/')).data,
	});

	const [formData, setFormData] = useState({
		first_name: '',
		last_name: '',
		bio: '',
		avatar: null as File | null
	});

	// Update form data when profile loads
	useEffect(() => {
		if (profile) {
			setFormData({
				first_name: profile.first_name || '',
				last_name: profile.last_name || '',
				bio: profile.bio || '',
				avatar: null
			});
		}
	}, [profile]);

	// Update profile mutation
	const updateProfileMut = useMutation({
		mutationFn: async (data: FormData) => {
			return await api.patch('/api/users/profile/', data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-profile'] });
		},
	});

	// Change password mutation  
	const changePasswordMut = useMutation({
		mutationFn: async (data: { current_password: string; new_password: string }) => {
			return await api.post('/api/users/change-password/', data);
		},
		onSuccess: () => {
			setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
			setShowChangePassword(false);
		},
	});

	const handleProfileSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		const formDataToSend = new FormData();
		formDataToSend.append('first_name', formData.first_name);
		formDataToSend.append('last_name', formData.last_name);
		formDataToSend.append('bio', formData.bio);
		
		if (formData.avatar) {
			formDataToSend.append('avatar', formData.avatar);
		}

		await updateProfileMut.mutateAsync(formDataToSend);
	};

	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			alert('New passwords do not match');
			return;
		}

		await changePasswordMut.mutateAsync({
			current_password: passwordData.currentPassword,
			new_password: passwordData.newPassword
		});
	};

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData({ ...formData, avatar: file });
		}
	};

	if (isLoading) {
		return (
			<AdminLayout>
				<div className="space-y-8">
					<div className="animate-pulse">
						<div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl mb-8" />
						<div className="grid grid-cols-1 gap-6 mb-8">
							{[...Array(3)].map((_, i) => (
								<div key={i} className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
							))}
						</div>
					</div>
				</div>
			</AdminLayout>
		);
	}

	if (error) {
		return (
			<AdminLayout>
				<Card className="p-8 text-center">
					<div className="text-red-500 mb-4">
						<AlertCircle size={48} className="mx-auto" />
					</div>
					<h2 className="text-xl font-semibold mb-2">Failed to load profile</h2>
					<p className="text-muted-foreground">Please try refreshing the page</p>
				</Card>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			{/* Header Section */}
			<div className="mb-8">
				<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
					<div>
						<h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
{t("admin.settings.adminSettings")}
						</h1>
						<p className="text-lg text-muted-foreground mt-2">
{t("admin.settings.manageProfileSettings")}
						</p>
					</div>
				</div>
			</div>

			<div className="space-y-8">
				{/* Profile Information */}
				<SettingCard
					title="Profile Information"
					description="Update your personal information and profile details"
					icon={User}
				>
					<form onSubmit={handleProfileSubmit} className="space-y-6">
						{/* Avatar Section */}
						<div className="flex items-center gap-6">
							<div className="relative">
								<div className="w-24 h-24 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
									{profile?.avatar ? (
										<img 
											src={profile.avatar} 
											alt="Profile" 
											className="w-24 h-24 rounded-full object-cover"
										/>
									) : (
										<span className="text-primary-foreground font-bold text-2xl">
											{profile?.first_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
										</span>
									)}
								</div>
								<label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
									<Camera size={16} />
									<input
										type="file"
										accept="image/*"
										onChange={handleAvatarChange}
										className="hidden"
									/>
								</label>
							</div>
							<div>
								<h3 className="font-semibold">{profile?.username}</h3>
								<p className="text-sm text-muted-foreground">{profile?.email}</p>
								<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
									profile?.role === 'admin' 
										? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
										: profile?.role === 'instructor' 
										? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
										: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
								}`}>
									{profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
								</span>
							</div>
						</div>

						{/* Form Fields */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
								<Input
									value={formData.first_name}
									onChange={(e) => setFormData({...formData, first_name: e.target.value})}
									placeholder="Enter your first name"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
								<Input
									value={formData.last_name}
									onChange={(e) => setFormData({...formData, last_name: e.target.value})}
									placeholder="Enter your last name"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
							<textarea
								className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-[100px] resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
								value={formData.bio}
								onChange={(e) => setFormData({...formData, bio: e.target.value})}
								placeholder="Tell us about yourself..."
								maxLength={500}
							/>
							<p className="text-xs text-muted-foreground">
								{formData.bio.length}/500 characters
							</p>
						</div>

						{/* Read-only fields */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
							<div className="space-y-2">
								<label className="text-sm font-medium text-muted-foreground">Username (Read-only)</label>
								<Input
									value={profile?.username || ''}
									disabled
									className="bg-slate-50 dark:bg-slate-800/50"
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium text-muted-foreground">Email (Read-only)</label>
								<Input
									value={profile?.email || ''}
									disabled
									className="bg-slate-50 dark:bg-slate-800/50"
								/>
							</div>
						</div>

						<div className="flex justify-end pt-4">
							<Button 
								type="submit" 
								disabled={updateProfileMut.isPending}
								className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
							>
								<Save size={16} className="mr-2" />
								{updateProfileMut.isPending ? 'Saving...' : 'Save Changes'}
							</Button>
						</div>

						{updateProfileMut.isError && (
							<div className="flex items-center gap-2 text-red-600 text-sm">
								<AlertCircle size={16} />
								Failed to update profile. Please try again.
							</div>
						)}

						{updateProfileMut.isSuccess && (
							<div className="flex items-center gap-2 text-green-600 text-sm">
								<CheckCircle size={16} />
								Profile updated successfully!
							</div>
						)}
					</form>
				</SettingCard>

				{/* Security Settings */}
				<SettingCard
					title={t("admin.settings.securitySettings")}
					description="Manage your password and account security"
					icon={Shield}
				>
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<h4 className="font-medium">Password</h4>
								<p className="text-sm text-muted-foreground">
									Last changed: Never
								</p>
							</div>
							<Button
								variant="outline"
								onClick={() => setShowChangePassword(!showChangePassword)}
								className="flex items-center gap-2"
							>
								<Edit size={16} />
								Change Password
							</Button>
						</div>

						{showChangePassword && (
							<form onSubmit={handlePasswordSubmit} className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
								<div className="space-y-2">
									<label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
									<div className="relative">
										<Input
											type={showPasswords ? "text" : "password"}
											value={passwordData.currentPassword}
											onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
											placeholder="Enter current password"
											required
										/>
										<button
											type="button"
											onClick={() => setShowPasswords(!showPasswords)}
											className="absolute right-3 top-1/2 -translate-y-1/2"
										>
											{showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
									<Input
										type={showPasswords ? "text" : "password"}
										value={passwordData.newPassword}
										onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
										placeholder="Enter new password"
										required
									/>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
									<Input
										type={showPasswords ? "text" : "password"}
										value={passwordData.confirmPassword}
										onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
										placeholder="Confirm new password"
										required
									/>
								</div>

								<div className="flex items-center justify-between pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setShowChangePassword(false);
											setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
										}}
									>
										Cancel
									</Button>
									<Button 
										type="submit" 
										disabled={changePasswordMut.isPending}
										className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
									>
										{changePasswordMut.isPending ? 'Changing...' : 'Change Password'}
									</Button>
								</div>

								{changePasswordMut.isError && (
									<div className="flex items-center gap-2 text-red-600 text-sm">
										<AlertCircle size={16} />
										Failed to change password. Please check your current password.
									</div>
								)}

								{changePasswordMut.isSuccess && (
									<div className="flex items-center gap-2 text-green-600 text-sm">
										<CheckCircle size={16} />
										Password changed successfully!
									</div>
								)}
							</form>
						)}
					</div>
				</SettingCard>

				{/* Account Information */}
				<SettingCard
					title="Account Information"
					description="View your account details and status"
					icon={Mail}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Account ID</p>
								<p className="font-mono text-sm">{profile?.id}</p>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">Role</p>
								<p className="capitalize">{profile?.role}</p>
							</div>
						</div>
						<div className="space-y-4">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Account Status</p>
								<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
									Active
								</span>
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground">Member Since</p>
								<p>January 2024</p>
							</div>
						</div>
					</div>
				</SettingCard>
			</div>
		</AdminLayout>
	);
}
