import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { adminGetCourseProfile, adminUpdateCourse, createCourseMedia, adminDeleteCourseMedia } from "@/api/admin";
import { 
	BookOpen, 
	ArrowLeft, 
	Edit, 
	Save, 
	X, 
	Upload, 
	Play, 
	FileText, 
	Image, 
	Download,
	Trash2,
	Users,
	DollarSign,
	Calendar,
	Clock,
	CheckCircle,
	AlertCircle,
	Eye,
	Settings,
	BarChart3,
	TrendingUp,
	Award,
	Star,
	MessageCircle,
	Target
} from "lucide-react";

interface CourseMedia {
	id: number;
	title: string;
	media_type: 'video' | 'pdf' | 'image' | 'audio';
	file_url: string;
	file_size?: number;
	duration?: number;
	order: number;
	is_preview: boolean;
	created_at: string;
}

interface CourseProfile {
	id: number;
	title: string;
	description: string;
	price: number;
	status: 'draft' | 'published';
	thumbnail?: string;
	created_by?: {
		id: number;
		username: string;
		first_name?: string;
		last_name?: string;
	};
	enrollment_count?: number;
	total_revenue?: number;
	average_rating?: number;
	completion_rate?: number;
	media?: CourseMedia[];
	created_at?: string;
	updated_at?: string;
}

const MediaTypeIcon = ({ type }: { type: string }) => {
	switch (type) {
		case 'video': return <Play size={16} className="text-red-500" />;
		case 'pdf': return <FileText size={16} className="text-red-500" />;
		case 'image': return <Image size={16} className="text-green-500" />;
		case 'audio': return <Play size={16} className="text-purple-500" />;
		default: return <FileText size={16} className="text-gray-500" />;
	}
};

const formatFileSize = (bytes?: number) => {
	if (!bytes) return 'Unknown';
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default function AdminCourseProfile() {
	const { id } = useParams<{ id: string }>();
	const qc = useQueryClient();
	const [isEditing, setIsEditing] = useState(false);
	const [editForm, setEditForm] = useState({
		title: '',
		description: '',
		price: 0,
		status: 'draft' as 'draft' | 'published'
	});
	const [showMediaUpload, setShowMediaUpload] = useState(false);
	const [mediaForm, setMediaForm] = useState({
		title: '',
		media_type: 'video' as 'video' | 'pdf' | 'image' | 'audio',
		file: null as File | null,
		is_preview: false
	});
	
	// Debug info
	console.log('AdminCourseProfile rendering with id:', id);

	const { data: course, isLoading, error } = useQuery<CourseProfile>({
		queryKey: ['admin-course-profile', id],
		queryFn: async () => {
			try {
				const response = await adminGetCourseProfile(Number(id!));
				console.log('Course profile API response:', response);
				
				// Add more detailed logging
				console.log('Response data structure:', JSON.stringify(response.data, null, 2));
				
				// Check if response has the expected structure
				if (!response.data || typeof response.data !== 'object') {
					throw new Error('Invalid response format');
				}
				
				// Return the data directly - it should match CourseProfile structure
				return response.data;
			} catch (err) {
				console.error('Error fetching course profile:', err);
				throw err;
			}
		},
		enabled: !!id,
		retry: 1 // Limit retries to avoid infinite loops
	});

	const updateMut = useMutation({
		mutationFn: (data: any) => adminUpdateCourse(Number(id!), data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['admin-course-profile', id] });
			setIsEditing(false);
		}
	});

	const uploadMediaMut = useMutation({
		mutationFn: (formData: FormData) => createCourseMedia(Number(id!), formData),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['admin-course-profile', id] });
			setShowMediaUpload(false);
			setMediaForm({ title: '', media_type: 'video', file: null, is_preview: false });
		},
		onError: (error) => {
			console.error('Error uploading media:', error);
			alert('Failed to upload media. Please try again.');
		}
	});

	const deleteMediaMut = useMutation({
		mutationFn: (mediaId: number) => adminDeleteCourseMedia(Number(id!), mediaId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['admin-course-profile', id] });
		}
	});

	const handleEdit = () => {
		if (course) {
			setEditForm({
				title: course.title,
				description: course.description,
				price: course.price,
				status: course.status
			});
			setIsEditing(true);
		}
	};

	const handleSave = () => {
		updateMut.mutate(editForm);
	};

	const handleMediaUpload = () => {
		if (!mediaForm.file) return;
		
		const formData = new FormData();
		// Important: Include the course ID in the form data
		formData.append('course', id!);
		formData.append('title', mediaForm.title);
		formData.append('media_type', mediaForm.media_type);
		formData.append('file', mediaForm.file);
		formData.append('is_preview', mediaForm.is_preview.toString());
		formData.append('order', '0'); // Add default order
		
		// Log the form data for debugging
		console.log('Uploading media with form data:', {
			course: id,
			title: mediaForm.title,
			media_type: mediaForm.media_type,
			file: mediaForm.file.name,
			is_preview: mediaForm.is_preview,
			order: 0
		});
		
		try {
			uploadMediaMut.mutate(formData);
		} catch (error) {
			console.error('Error in handleMediaUpload:', error);
		}
	};

	if (isLoading) {
		return (
			<AdminLayout>
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading course details...</p>
					</div>
				</div>
			</AdminLayout>
		);
	}

	// Enhanced error handling
	if (error) {
		console.error('Error in AdminCourseProfile:', error);
		return (
			<AdminLayout>
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">Error Loading Course</h3>
						<p className="text-muted-foreground mb-4">
							{error instanceof Error ? error.message : 'Unknown error occurred while loading the course.'}
						</p>
						<pre className="text-xs text-left bg-gray-100 p-4 rounded max-w-lg mx-auto mb-4 overflow-auto">
							{JSON.stringify(error, null, 2)}
						</pre>
						<Link to="/admin/courses">
							<Button>Back to Courses</Button>
						</Link>
					</div>
				</div>
			</AdminLayout>
		);
	}
	
	// Handle case where data is missing but no error occurred
	if (!course) {
		return (
			<AdminLayout>
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center">
						<AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">Course Data Missing</h3>
						<p className="text-muted-foreground mb-4">
							The course data structure is incomplete or invalid.
						</p>
						<Link to="/admin/courses">
							<Button>Back to Courses</Button>
						</Link>
					</div>
				</div>
			</AdminLayout>
		);
	}

	return (
		<AdminLayout>
			{/* Header */}
			<div className="mb-8">
				<div className="flex items-center gap-4 mb-6">
					<Link to="/admin/courses">
						<Button variant="outline" size="sm">
							<ArrowLeft size={16} className="mr-2" />
							Back to Courses
						</Button>
					</Link>
					<div className="flex-1">
						<h1 className="text-3xl font-bold">{course.title}</h1>
						<p className="text-muted-foreground">Course ID: {course.id}</p>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
							{course.status === 'published' ? (
								<><CheckCircle size={12} className="mr-1" /> Published</>
							) : (
								<><Clock size={12} className="mr-1" /> Draft</>
							)}
						</Badge>
						{!isEditing ? (
							<Button onClick={handleEdit}>
								<Edit size={16} className="mr-2" />
								Edit Course
							</Button>
						) : (
							<div className="flex gap-2">
								<Button onClick={handleSave} disabled={updateMut.isPending}>
									<Save size={16} className="mr-2" />
									Save
								</Button>
								<Button variant="outline" onClick={() => setIsEditing(false)}>
									<X size={16} className="mr-2" />
									Cancel
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Course Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-blue-800 dark:text-blue-200">Enrollments</p>
								<p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
									{(course.enrollment_count || 0).toLocaleString()}
								</p>
							</div>
							<Users className="h-8 w-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-green-800 dark:text-green-200">Revenue</p>
								<p className="text-3xl font-bold text-green-900 dark:text-green-100">
									${(course.total_revenue || 0).toLocaleString()}
								</p>
							</div>
							<DollarSign className="h-8 w-8 text-green-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-purple-800 dark:text-purple-200">Rating</p>
								<p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
									{(course.average_rating || 0).toFixed(1)}
								</p>
							</div>
							<Star className="h-8 w-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>

				<Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-amber-800 dark:text-amber-200">Completion</p>
								<p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
									{(course.completion_rate || 0).toFixed(1)}%
								</p>
							</div>
							<Target className="h-8 w-8 text-amber-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Course Details */}
				<div className="lg:col-span-2 space-y-6">
					{/* Basic Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Settings size={20} />
								Course Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{isEditing ? (
								<>
									<div>
										<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Course Title</label>
										<Input
											value={editForm.title}
											onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
											placeholder="Enter course title"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
										<textarea
											className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
											rows={4}
											value={editForm.description}
											onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
											placeholder="Enter course description"
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium mb-2">Price ($)</label>
											<Input
												type="number"
												value={editForm.price}
												onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
												placeholder="0.00"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium mb-2">Status</label>
											<select
												className="w-full p-2 border rounded-lg"
												value={editForm.status}
												onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
											>
												<option value="draft">Draft</option>
												<option value="published">Published</option>
											</select>
										</div>
									</div>
								</>
							) : (
								<>
									<div>
										<h3 className="font-medium text-sm text-muted-foreground">Title</h3>
										<p className="text-lg">{course.title}</p>
									</div>
									<div>
										<h3 className="font-medium text-sm text-muted-foreground">Description</h3>
										<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
											{course.description}
										</p>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<h3 className="font-medium text-sm text-muted-foreground">Price</h3>
											<p className="text-2xl font-bold text-green-600">${course.price}</p>
										</div>
										<div>
											<h3 className="font-medium text-sm text-muted-foreground">Created</h3>
											<p>{new Date(course.created_at).toLocaleDateString()}</p>
										</div>
									</div>
								</>
							)}
						</CardContent>
					</Card>

					{/* Course Media */}
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<BookOpen size={20} />
									Course Content ({course.media.length} items)
								</CardTitle>
								<Button 
									onClick={() => setShowMediaUpload(true)}
									size="sm"
								>
									<Upload size={16} className="mr-2" />
									Add Media
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{!course.media || course.media.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<BookOpen size={48} className="mx-auto mb-4 opacity-50" />
									<p>No content uploaded yet</p>
									<p className="text-sm">Add videos, PDFs, or images to get started</p>
								</div>
							) : (
								<div className="space-y-3">
									{course.media
										.sort((a, b) => a.order - b.order)
										.map((media, index) => (
											<div 
												key={media.id}
												className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
											>
												<div className="flex items-center gap-2 flex-1">
													<span className="text-sm text-muted-foreground w-6">
														{index + 1}.
													</span>
													<MediaTypeIcon type={media.media_type} />
													<div className="flex-1">
														<h4 className="font-medium">{media.title}</h4>
														<div className="flex items-center gap-4 text-sm text-muted-foreground">
															<span>{media.media_type.toUpperCase()}</span>
															{media.file_size && (
																<span>{formatFileSize(media.file_size)}</span>
															)}
															{media.duration && (
																<span>{Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}</span>
															)}
															{media.is_preview && (
																<Badge variant="secondary" className="text-xs">Preview</Badge>
															)}
														</div>
													</div>
												</div>
												<div className="flex items-center gap-2">
													{media.file_url && (
														<Button variant="outline" size="sm" asChild>
															<a href={media.file_url} target="_blank" rel="noopener noreferrer">
																<Eye size={14} />
															</a>
														</Button>
													)}
													<Button 
														variant="outline" 
														size="sm"
														onClick={() => deleteMediaMut.mutate(media.id)}
														disabled={deleteMediaMut.isPending}
														className="text-red-600 hover:bg-red-50"
													>
														<Trash2 size={14} />
													</Button>
												</div>
											</div>
										))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Instructor Info */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Instructor</CardTitle>
						</CardHeader>
						<CardContent>
							{course.created_by ? (
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
										{(course.created_by.first_name?.[0] || '') + (course.created_by.last_name?.[0] || '')}
									</div>
									<div>
										<p className="font-medium">
											{[course.created_by.first_name, course.created_by.last_name].filter(Boolean).join(' ') || course.created_by.username}
										</p>
										<p className="text-sm text-muted-foreground">@{course.created_by.username}</p>
									</div>
								</div>
							) : (
								<div className="text-center py-2 text-muted-foreground">
									No instructor information available
								</div>
							)}
						</CardContent>
					</Card>

					{/* Quick Actions */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<Button variant="outline" className="w-full justify-start" asChild>
								<Link to={`/course/${course.id}`}>
									<Eye size={16} className="mr-2" />
									Preview Course
								</Link>
							</Button>
						</CardContent>
					</Card>

					{/* Course Stats */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Statistics</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Total Lessons</span>
								<span className="font-medium">{course.media.length}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Preview Content</span>
								<span className="font-medium">{course.media.filter(m => m.is_preview).length}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-sm text-muted-foreground">Last Updated</span>
								<span className="font-medium">{new Date(course.updated_at).toLocaleDateString()}</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Media Upload Modal */}
			{showMediaUpload && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<Card className="w-full max-w-md mx-4">
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle>Add Course Content</CardTitle>
								<Button 
									variant="ghost" 
									size="sm"
									onClick={() => setShowMediaUpload(false)}
								>
									<X size={16} />
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
								<Input
									value={mediaForm.title}
									onChange={(e) => setMediaForm(prev => ({ ...prev, title: e.target.value }))}
									placeholder="Lesson title"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Media Type</label>
								<select
									className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary"
									value={mediaForm.media_type}
									onChange={(e) => setMediaForm(prev => ({ ...prev, media_type: e.target.value as any }))}
								>
									<option value="video">Video</option>
									<option value="pdf">PDF Document</option>
									<option value="image">Image</option>
									<option value="audio">Audio</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">File</label>
								<input
									type="file"
									className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary"
									onChange={(e) => setMediaForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
									accept={
										mediaForm.media_type === 'video' ? 'video/*' :
										mediaForm.media_type === 'pdf' ? '.pdf' :
										mediaForm.media_type === 'image' ? 'image/*' :
										'audio/*'
									}
								/>
							</div>
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="is_preview"
									checked={mediaForm.is_preview}
									onChange={(e) => setMediaForm(prev => ({ ...prev, is_preview: e.target.checked }))}
									className="w-4 h-4 text-primary bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded focus:ring-primary focus:ring-2"
								/>
								<label htmlFor="is_preview" className="text-sm text-slate-700 dark:text-slate-300">
									Allow preview (visible to non-enrolled users)
								</label>
							</div>
							<div className="flex gap-2 pt-4">
								<Button 
									onClick={handleMediaUpload}
									disabled={!mediaForm.title || !mediaForm.file || uploadMediaMut.isPending}
									className="flex-1"
								>
									{uploadMediaMut.isPending ? 'Uploading...' : 'Upload'}
								</Button>
								<Button 
									variant="outline"
									onClick={() => setShowMediaUpload(false)}
								>
									Cancel
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</AdminLayout>
	);
}