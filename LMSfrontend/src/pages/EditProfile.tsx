import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import StudentLayout from "@/components/studentLayout";
import {
  ArrowLeft,
  User,
  Shield,
  Bell,
  Camera,
  Save,
  Edit3,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Globe,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { useI18n } from "@/lib/i18n";
import { useUserProfile, UserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Local interface for edit form data (extends the UserProfile from hook)
interface EditFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  country: string;
  address: string;
  bio: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  emailNotifications: boolean;
  courseNotifications: boolean;
  marketingEmails: boolean;
}

export default function EditProfile() {
  const { user } = useAuth();
  const { userProfile, loading, error, getDisplayName, refetch, saveProfile } = useUserProfile();
  const { toast } = useToast();
  const { t, language } = useI18n();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "notifications">(
    "personal"
  );

  // Form data state - initialize with user profile data
  const [formData, setFormData] = useState<EditFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: 18,
    country: "",
    address: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    courseNotifications: true,
    marketingEmails: false,
  });

  // Update form data when user profile loads
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        age: userProfile.age || 18,
        country: userProfile.country || "",
        address: userProfile.address || "",
        bio: userProfile.bio || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        emailNotifications: userProfile.emailNotifications ?? true,
        courseNotifications: userProfile.courseNotifications ?? true,
        marketingEmails: userProfile.marketingEmails ?? false,
      });
    }
  }, [userProfile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!userProfile) {
      toast({ title: "Error", description: language === "ar" ? "فشل في تحميل بيانات المستخدم" : "Failed to load user data", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (activeTab === "security" && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error(language === "ar" ? "كلمة المرور غير متطابقة" : "Passwords do not match");
        }
      }

      const payload: Record<string, any> = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        bio: formData.bio,
      };
      await saveProfile(payload);

      if (activeTab === "security" && formData.newPassword) {
        // Optionally implement a password change endpoint on backend
      }

      setIsEditing(false);
      toast({ title: language === "ar" ? "تم الحفظ" : "Success", description: language === "ar" ? "تم حفظ التغييرات بنجاح" : "Profile updated successfully" });
    } catch (err: any) {
      console.error("Save failed", err);
      toast({ title: "Error", description: err.message || (language === "ar" ? "فشل في حفظ التغييرات" : "Failed to save changes"), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while fetching user profile
  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {language === "ar" ? "جاري تحميل البيانات..." : "Loading profile..."}
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Show error state if profile failed to load
  if (error || !userProfile) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              {language === "ar" ? "فشل في تحميل البيانات" : "Failed to Load Profile"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === "ar" ? "فشل في تحميل بيانات الملف الشخصي. يرجى المحاولة مرة أخرى."
                : "Failed to load profile data. Please try again."}
            </p>
            <Button onClick={() => refetch()}>
              {language === "ar" ? "إعادة المحاولة" : "Try Again"}
            </Button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/student-dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> {t("editProfile.backToDashboard")}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t("editProfile.title")}</h1>
              <p className="text-muted-foreground">
                {t("editProfile.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  {t("editProfile.cancel")}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="min-w-[100px]"
                >
                  {isSaving ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t("editProfile.saving")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>{t("editProfile.save")}</span>
                    </div>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Profile Picture Section */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={userProfile?.avatar} alt={getDisplayName()} />
                  <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white text-2xl font-bold">
                    {userProfile?.firstName?.charAt(0) || ''}{userProfile?.lastName?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/80 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {getDisplayName()}
                </h3>
                <p className="text-muted-foreground">{userProfile?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    {language === "ar"
                      ? (userProfile?.accountType === 'student' ? 'طالب' : 'بالغ')
                      : (userProfile?.accountType === 'student' ? 'Student' : 'Adult')
                    }
                  </Badge>
                  <Badge variant="secondary">
                    {language === "ar" ? `العمر: ${userProfile?.age}` : `Age: ${userProfile?.age}`}
                  </Badge>
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm" className="mt-2">
                    <Camera className="w-4 h-4 mr-2" />
                    {t("editProfile.changePhoto")}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted/50 rounded-lg p-1 mb-6">
          {[
            { id: "personal", label: t("editProfile.personal"), icon: User },
            { id: "security", label: t("editProfile.security"), icon: Shield },
            { id: "notifications", label: t("editProfile.notifications"), icon: Bell },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="flex-1 flex items-center space-x-2"
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            {/* Personal Tab */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-foreground">
                      {t("editProfile.firstName")}
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-background border-border text-foreground disabled:bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-foreground">
                      {t("editProfile.lastName")}
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-background border-border text-foreground disabled:bg-muted"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      <Mail className="w-4 h-4 inline mr-2" />
                      {t("editProfile.email")}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-background border-border text-foreground disabled:bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">
                      <Phone className="w-4 h-4 inline mr-2" />
                      {t("editProfile.phone")}
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-background border-border text-foreground disabled:bg-muted"
                    />
                  </div>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-foreground">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      {language === "ar" ? "العمر" : "Age"}
                    </Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.age}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-background border-border text-foreground disabled:bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-foreground">
                      <Globe className="w-4 h-4 inline mr-2" />
                      {t("editProfile.country")}
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-background border-border text-foreground disabled:bg-muted"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-foreground">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {t("editProfile.address")}
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="bg-background border-border text-foreground disabled:bg-muted"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-foreground">
                    {t("editProfile.bio")}
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    className="bg-background border-border text-foreground disabled:bg-muted resize-none"
                  />
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("editProfile.security")}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Update your password to keep your account secure
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-foreground">
                      {t("editProfile.currentPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-background border-border text-foreground disabled:bg-muted pr-10"
                      />
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-foreground">
                      {t("editProfile.newPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="bg-background border-border text-foreground disabled:bg-muted pr-10"
                      />
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">
                      {t("editProfile.confirmPassword")}
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-background border-border text-foreground disabled:bg-muted"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("editProfile.notifications")}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Manage your notification preferences
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
                    <div>
                      <Label className="text-foreground font-medium">
                        {t("editProfile.emailNotifications")}
                      </Label>
                      <p className="text-sm text-muted-foreground">Receive email notifications about your account</p>
                    </div>
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
                    <div>
                      <Label className="text-foreground font-medium">
                        {t("editProfile.courseNotifications")}
                      </Label>
                      <p className="text-sm text-muted-foreground">Get notified about course updates and new lessons</p>
                    </div>
                    <input
                      type="checkbox"
                      name="courseNotifications"
                      checked={formData.courseNotifications}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-background">
                    <div>
                      <Label className="text-foreground font-medium">
                        {t("editProfile.marketingEmails")}
                      </Label>
                      <p className="text-sm text-muted-foreground">Receive marketing emails and promotional offers</p>
                    </div>
                    <input
                      type="checkbox"
                      name="marketingEmails"
                      checked={formData.marketingEmails}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}