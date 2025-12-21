import { useNavigate } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Star,
  Clock,
  DollarSign,
  BookOpen,
  MoreHorizontal,
  Video,
  Upload,
  Play,
  Save,
  Loader2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CourseWithVideos, VideoContent } from '@/lib/coursesData';
import { adminListCourses, adminCreateCourseMultipart, adminUpdateCourse, adminDeleteCourse, createCourseMedia, adminDeleteCourseMedia, adminGetCourseMedia } from '@/api/admin';
import AddCourseDialog from '@/components/AddCourseDialog';
import { Progress } from '@/components/ui/progress';

// Use shared types and data for consistency
type Course = Omit<CourseWithVideos, 'id' | 'instructor'> & { id: string; instructors: string[] };

const categories = ["General", "Programming", "Language", "Graphic", "Medical"];

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

const uploadWithProgress = (url: string, file: File, courseFolder: string, onProgress: (progress: number) => void): Promise<any> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('course_folder', courseFolder);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (err) {
          reject(new Error('Invalid JSON response from server'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload. Check if the file size exceeds server limits.'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    xhr.open('POST', url);
    xhr.timeout = 600000; // 10 minutes
    xhr.ontimeout = () => {
      reject(new Error('Upload timed out after 10 minutes'));
    };

    xhr.send(formData);
  });
};

const compressVideo = async (file: File, onProgress?: (msg: string) => void): Promise<File | Blob> => {
  const win = window as any;

  if (typeof SharedArrayBuffer === 'undefined') {
    return file;
  }

  if (!win.FFmpeg) {
    return file;
  }

  try {
    const { createFFmpeg, fetchFile } = win.FFmpeg;
    const ffmpeg = createFFmpeg({ log: false });

    onProgress?.("Loading compressor...");
    await ffmpeg.load();

    onProgress?.("Compressing...");
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));

    await ffmpeg.run('-i', 'input.mp4', '-vcodec', 'libx264', '-crf', '28', '-preset', 'veryfast', 'output.mp4');

    const data = ffmpeg.FS('readFile', 'output.mp4');
    return new File([data.buffer], file.name, { type: 'video/mp4' });
  } catch (error) {
    return file;
  }
};

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditContentDialogOpen, setIsEditContentDialogOpen] = useState(false);
  const [selectedCourseForContent, setSelectedCourseForContent] = useState<Course | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCourseMedia = async (courseId: number) => {
    try {
      const res = await adminGetCourseMedia(courseId);
      const mediaItems = res.data.results || res.data || [];
      return mediaItems.map((m: any, idx: number) => ({
        id: m.id,
        title: m.title,
        session: m.session || "",
        description: m.description || "",
        url: m.file,
        duration: m.duration || "",
        order: m.order || idx + 1,
        isUploaded: true
      }));
    } catch (error) {
      return [];
    }
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructors: [""],
    category: "",
    price: "",
    duration: "",
    status: "draft" as Course['status'],
    thumbnail: "/placeholder.svg",
    thumbnailFile: null as File | null,
    videos: [] as VideoContent[]
  });

  const [contentFormData, setContentFormData] = useState({
    title: "",
    description: "",
    videos: [] as (VideoContent & { isUploaded?: boolean })[]
  });

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructors.some((i) =>
        i.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" ||
      course.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "all" ||
      course.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const addContentVideo = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const newVideo: VideoContent = {
      id: Date.now(),
      title: "",
      session: "",
      description: "",
      url: "",
      duration: "",
      order: contentFormData.videos.length + 1,
    };

    setContentFormData((prev) => ({
      ...prev,
      videos: [...prev.videos, newVideo],
    }));
  };

  const removeContentVideo = async (videoId: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const video = contentFormData.videos.find((v) => v.id === videoId);

    setContentFormData((prev) => ({
      ...prev,
      videos: prev.videos.filter((v) => v.id !== videoId),
    }));

    if (video && selectedCourseForContent && !isNaN(Number(videoId)) && videoId < 9999999999999) {
      try {
        await adminDeleteCourseMedia(parseInt(selectedCourseForContent.id, 10), videoId);
      } catch (error) {
        console.error("Failed to delete video:", error);
      }
    }
  };

  const updateContentVideo = (videoId: number, field: keyof VideoContent, value: string) => {
    setContentFormData({
      ...contentFormData,
      videos: contentFormData.videos.map(video =>
        video.id === videoId ? { ...video, [field]: value } : video
      )
    });
  };

  const handleEditCourse = async () => {
    if (!editingCourse) return;

    try {
      const statusMap: Record<string, string> = {
        active: "published",
        draft: "draft",
      };

      const payload = new FormData();
      payload.append("title", formData.title);
      if (formData.thumbnailFile) {
        payload.append("thumbnail", formData.thumbnailFile);
      }
      payload.append("description", formData.description);
      payload.append("status", statusMap[formData.status] ?? formData.status ?? "draft");
      payload.append('instructors', JSON.stringify(formData.instructors.filter(i => i.trim() !== '')));
      const priceValue = formData.price ? parseFloat(formData.price) : 0;
      payload.append("price", Number.isNaN(priceValue) ? "0.00" : priceValue.toFixed(2));
      if (formData.category) payload.append("category", formData.category);
      if (formData.duration) payload.append("duration", formData.duration);

      const res = await adminUpdateCourse(parseInt(editingCourse.id, 10), payload);
      const result = res?.data ?? {};

      const normalizedStatus =
        result.status === "published"
          ? "active"
          : result.status === "draft"
            ? "draft"
            : result.status === "archived"
              ? "archived"
              : formData.status;

      const priceFromResult = result.price ? parseFloat(result.price) : priceValue;
      const cleanedInstructors = formData.instructors.filter((i) => i.trim() !== "");

      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === editingCourse.id
            ? {
              ...course,
              title: result.title ?? formData.title,
              description: result.description ?? formData.description,
              instructors: cleanedInstructors.length ? cleanedInstructors : course.instructors,
              category: formData.category || course.category,
              price: Number.isNaN(priceFromResult) ? course.price : priceFromResult,
              duration: formData.duration || course.duration,
              status: normalizedStatus as Course['status'],
              thumbnail: result.thumbnail || course.thumbnail,
            }
            : course
        )
      );

      setIsEditDialogOpen(false);
      setEditingCourse(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update course:", error);
      alert("Failed to update course.");
    }
  };

  const handleEditContent = async () => {
    if (!selectedCourseForContent) return;

    try {
      const courseId = parseInt(selectedCourseForContent.id, 10);
      const coursePayload = new FormData();
      coursePayload.append("title", contentFormData.title);
      coursePayload.append("description", contentFormData.description);

      const res = await adminUpdateCourse(courseId, coursePayload);
      const result = res?.data ?? {};

      const courseFolder = slugify(contentFormData.title);

      for (const video of contentFormData.videos) {
        if (video.file) {
          const sessionFolder = video.session ? slugify(video.session) : 'general';
          const fullFolderPath = `${courseFolder}/${sessionFolder}`;

          try {
            const fileToUpload = await compressVideo(video.file);

            const uploadResult = await uploadWithProgress(
              import.meta.env.VITE_HOSTINGER_UPLOAD_URL || 'https://smartonlinelearningedu.com/upload.php',
              fileToUpload as File,
              fullFolderPath,
              (progress) => {
                setContentFormData(prev => ({
                  ...prev,
                  videos: prev.videos.map(v => v.id === video.id ? { ...v, uploadProgress: progress } : v)
                }));
              }
            );

            if (uploadResult.status === 'success') {
              const mediaForm = new FormData();
              mediaForm.append("course", String(courseId));
              mediaForm.append("file", uploadResult.url);
              mediaForm.append("media_type", "video");
              mediaForm.append("title", video.title || `Video`);
              mediaForm.append("description", video.description || "");
              mediaForm.append("duration", video.duration || "0:00");
              mediaForm.append("order", String(video.order || 0));
              mediaForm.append("session", video.session || "");

              await createCourseMedia(courseId, mediaForm);

              setContentFormData(prev => ({
                ...prev,
                videos: prev.videos.map(v => v.id === video.id ? { ...v, isUploaded: true } : v)
              }));
            } else {
              alert(`Upload failed for ${video.title}: ${uploadResult.message}`);
            }
          } catch (uploadErr) {
            alert(`Failed to upload video "${video.title}".`);
          }
        }
      }

      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === selectedCourseForContent.id
            ? {
              ...course,
              title: result.title ?? contentFormData.title,
              description: result.description ?? contentFormData.description,
              videos: contentFormData.videos,
            }
            : course
        )
      );

      setIsEditContentDialogOpen(false);
      setSelectedCourseForContent(null);
      setContentFormData({
        title: "",
        description: "",
        videos: [],
      });
    } catch (error) {
      alert("Failed to update course content.");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await adminDeleteCourse(parseInt(courseId, 10));
      setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseId));
    } catch (error) {
      console.error("Failed to delete course:", error);
    }
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      instructors: course.instructors,
      category: course.category,
      price: course.price.toString(),
      duration: course.duration,
      status: course.status,
      thumbnail: course.thumbnail,
      thumbnailFile: null,
      videos: course.videos
    });
    setIsEditDialogOpen(true);
  };

  const openEditContentDialog = async (course: Course) => {
    setSelectedCourseForContent(course);
    const videos = await fetchCourseMedia(parseInt(course.id, 10));
    setContentFormData({
      title: course.title,
      description: course.description,
      videos,
    });
    setIsEditContentDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructors: [""],
      category: "",
      price: "",
      duration: "",
      status: "draft",
      thumbnail: "/placeholder.svg",
      thumbnailFile: null,
      videos: []
    });
  };

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await adminListCourses();
        const djangoCourses = res?.data?.results ?? [];

        const mappedCourses = djangoCourses.map((c: any) => {
          const safeCategory =
            c.category && typeof c.category === "string" && c.category.trim() !== ""
              ? c.category
              : "General";

          const safeDuration =
            c.duration && typeof c.duration === "string" && c.duration.trim() !== ""
              ? c.duration
              : "N/A";

          return {
            id: c.id.toString(),
            title: c.title || "Untitled Course",
            description: c.description || "",
            instructors:
              Array.isArray(c.instructors) && c.instructors.length > 0
                ? c.instructors
                : ["Admin"],
            category: safeCategory,
            price: parseFloat(c.price) || 0,
            duration: safeDuration,
            status: c.status === "published" ? "active" : "draft",
            thumbnail: c.thumbnail || "/placeholder.svg",
            videos: (c.media || []).map((m: any, idx: number) => ({
              id: m.id,
              title: m.title,
              session: m.session || "",
              description: m.description || "",
              url: m.file,
              duration: m.duration || "",
              order: m.order || idx + 1,
            })),
            students: 0,
            rating: 0,
            progress: 0,
          };
        });

        setCourses(mappedCourses);
      } catch (error) {
        console.error("Failed to load courses:", error);
      }
    }

    loadCourses();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground">Manage your educational content and course offerings</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Course
          </Button>
        </div>

        <AddCourseDialog
          open={isAddDialogOpen}
          setOpen={setIsAddDialogOpen}
          categories={categories}
          onAddCourse={async (newCourse, onProgress) => {
            try {
              const formData = new FormData();
              formData.append('title', newCourse.title);
              formData.append('description', newCourse.description);
              formData.append('price', newCourse.price || '0.00');

              const statusMap: Record<string, string> = {
                active: 'published',
                draft: 'draft',
              };
              formData.append('status', statusMap[newCourse.status] ?? 'draft');

              if (newCourse.category) formData.append('category', newCourse.category);
              if (newCourse.duration) formData.append('duration', newCourse.duration);
              if (newCourse.nextCourseRecommendation)
                formData.append('next_course_recommendation', newCourse.nextCourseRecommendation);

              formData.append('instructors', JSON.stringify(newCourse.instructors.filter(i => i.trim() !== '')));

              if (newCourse.thumbnailFile) formData.append('thumbnail', newCourse.thumbnailFile);

              const response = await adminCreateCourseMultipart(formData);
              const createdCourse = response.data;
              const courseId = createdCourse.id;

              const courseFolder = slugify(newCourse.title);
              const uploadedVideos = [];

              for (const video of newCourse.videos) {
                if (video.file) {
                  const sessionFolder = video.session ? slugify(video.session) : 'general';
                  const fullFolderPath = `${courseFolder}/${sessionFolder}`;

                  try {
                    const fileToUpload = await compressVideo(video.file);

                    const uploadResult = await uploadWithProgress(
                      import.meta.env.VITE_HOSTINGER_UPLOAD_URL || 'https://smartonlinelearningedu.com/upload.php',
                      fileToUpload as File,
                      fullFolderPath,
                      (progress) => {
                        onProgress(video.id, progress);
                      }
                    );

                    if (uploadResult.status === 'success') {
                      const mediaFormData = new FormData();
                      mediaFormData.append('course', String(courseId));
                      mediaFormData.append('file', uploadResult.url);
                      mediaFormData.append('media_type', 'video');
                      mediaFormData.append('title', video.title || video.file.name);
                      mediaFormData.append('description', video.description || '');
                      mediaFormData.append('duration', video.duration || '0:00');
                      mediaFormData.append('order', String(video.order || 0));
                      mediaFormData.append('session', video.session || "");

                      const mediaResponse = await createCourseMedia(courseId, mediaFormData);
                      uploadedVideos.push({
                        id: mediaResponse.data.id,
                        title: mediaResponse.data.title,
                        description: mediaResponse.data.title,
                        url: uploadResult.url,
                        duration: mediaResponse.data.duration || "0:00",
                        order: mediaResponse.data.order || 0,
                      });
                    }
                  } catch (mediaError) {
                    console.error("Failed to upload video:", mediaError);
                  }
                }
              }

              const courseWithVideos: Course = {
                id: String(createdCourse.id),
                title: createdCourse.title || newCourse.title,
                description: createdCourse.description || newCourse.description,
                instructors: createdCourse.instructors?.length
                  ? createdCourse.instructors
                  : newCourse.instructors.filter(i => i.trim() !== ""),
                students: 0,
                rating: 0,
                status: createdCourse.status === "published" ? "active" : "draft",
                progress: 0,
                videos: uploadedVideos,
                category: createdCourse.category || newCourse.category || "Uncategorized",
                price: Number(createdCourse.price || newCourse.price || 0),
                duration: createdCourse.duration || newCourse.duration || "—",
                thumbnail: createdCourse.thumbnail || "/placeholder.svg",
              };

              setCourses((prev) => [courseWithVideos, ...prev]);
              return true;
            } catch (error) {
              alert("Failed to create course.");
              return false;
            }
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses or instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="bg-white/90 hover:bg-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(course)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Course
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditContentDialog(course)}>
                      <Video className="w-4 h-4 mr-2" />
                      Edit Content
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Course
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Course</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{course.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {course.videos.length > 0 && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
                  <Play className="w-3 h-3 mr-1" />
                  {course.videos.length} videos
                </div>
              )}
            </div>

            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="mt-1">
                    By {course.instructors && course.instructors.length > 0 ? course.instructors.join(", ") : "N/A"}
                  </CardDescription>
                </div>
                <Badge variant={course.status === "active" ? "default" : course.status === "draft" ? "secondary" : "outline"}>
                  {course.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {course.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-3 h-3 mr-1" />
                      {course.students}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                      {course.rating || "New"}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {course.duration}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center text-sm font-medium">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {course.price}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {course.category}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <div className="p-4 pt-0 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/courses/${course.id}`, { state: { course } })}
              >
                View Full Info
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">No courses found</h3>
                <p className="text-muted-foreground">Try adjusting your search filters or add a new course.</p>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Course
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update the course information below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-4">
              <Label className="text-base font-medium">Course Cover Image</Label>
              <div className="flex items-center space-x-4">
                <div className="w-32 h-20 border border-border rounded-lg overflow-hidden bg-muted">
                  <img src={formData.thumbnail} alt="Course cover" className="w-full h-full object-cover" />
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const imageUrl = URL.createObjectURL(file);
                        setFormData((prev) => ({
                          ...prev,
                          thumbnail: imageUrl,
                          thumbnailFile: file,
                        }));
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Change Image
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">Recommended size: 1920x1080px</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Course Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter course title"
                />
              </div>
              <div className="space-y-2">
                <Label>Instructors</Label>
                {formData.instructors.map((inst, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      value={inst}
                      onChange={e => {
                        const newInstructors = [...formData.instructors];
                        newInstructors[idx] = e.target.value;
                        setFormData({ ...formData, instructors: newInstructors });
                      }}
                      placeholder={`Instructor ${idx + 1}`}
                    />
                    {formData.instructors.length > 1 && (
                      <Button type="button" size="icon" variant="ghost" onClick={() => {
                        setFormData({
                          ...formData,
                          instructors: formData.instructors.filter((_, i) => i !== idx)
                        });
                      }}>-</Button>
                    )}
                    {idx === formData.instructors.length - 1 && (
                      <Button type="button" size="icon" variant="ghost" onClick={() => {
                        setFormData({
                          ...formData,
                          instructors: [...formData.instructors, ""]
                        });
                      }}>+</Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Course description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration</Label>
                <Input
                  id="edit-duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g. 8 weeks"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Course['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setEditingCourse(null);
                resetForm();
              }}>Cancel</Button>
              <Button onClick={handleEditCourse}>Update Course</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditContentDialogOpen} onOpenChange={setIsEditContentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update course information and video content</DialogTitle>
          </DialogHeader>
          {selectedCourseForContent && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content-title">Course Title</Label>
                <Input
                  id="content-title"
                  value={contentFormData.title}
                  onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                  placeholder="Enter course title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-description">Description</Label>
                <Textarea
                  id="content-description"
                  value={contentFormData.description}
                  onChange={(e) => setContentFormData({ ...contentFormData, description: e.target.value })}
                  placeholder="Enter course description"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Course Videos</Label>
                  <Button type="button" size="sm" onClick={(e) => addContentVideo(e)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Video
                  </Button>
                </div>

                {contentFormData.videos.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-lg">
                    <Video className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No videos added yet</p>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={(e) => addContentVideo(e)}>
                      Add First Video
                    </Button>
                  </div>
                ) : (
                  contentFormData.videos.map((video, index) => (
                    <div key={video.id} className="p-4 border border-border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Video {index + 1}</h4>
                        <Button type="button" variant="ghost" size="sm" onClick={(e) => removeContentVideo(video.id, e)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>Session Name</Label>
                          <Input
                            value={video.session || ''}
                            onChange={(e) => updateContentVideo(video.id, 'session', e.target.value)}
                            placeholder="e.g. Introduction"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Video Title</Label>
                          <Input
                            value={video.title}
                            onChange={(e) => updateContentVideo(video.id, 'title', e.target.value)}
                            placeholder="Video title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration</Label>
                          <Input
                            value={video.duration}
                            onChange={(e) => updateContentVideo(video.id, 'duration', e.target.value)}
                            placeholder="e.g. 25:30"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Video Description</Label>
                        <Textarea
                          value={video.description}
                          onChange={(e) => updateContentVideo(video.id, 'description', e.target.value)}
                          placeholder="Video description"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Upload Video File</Label>
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setContentFormData({
                                ...contentFormData,
                                videos: contentFormData.videos.map((v) =>
                                  v.id === video.id ? { ...v, file, url: URL.createObjectURL(file) } : v
                                ),
                              });
                            }
                          }}
                        />
                        {video.url && <video src={video.url} controls className="w-full mt-2 rounded-md border border-border" />}

                        {(video.uploadProgress !== undefined && video.uploadProgress > 0 && video.uploadProgress < 100) && (
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Uploading...</span>
                              <span>{video.uploadProgress}%</span>
                            </div>
                            <Progress value={video.uploadProgress} className="h-1" />
                          </div>
                        )}

                        {video.uploadProgress === 100 && !video.isUploaded && (
                          <div className="mt-2 flex items-center text-xs text-blue-500">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Processing on server...
                          </div>
                        )}

                        {video.isUploaded && (
                          <div className="mt-2 text-xs text-green-500 flex items-center">
                            <Badge variant="outline" className="text-green-500 border-green-500 bg-green-50">
                              Uploaded Successfully
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsEditContentDialogOpen(false);
                  setSelectedCourseForContent(null);
                }}>Cancel</Button>
                <Button onClick={handleEditContent}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}