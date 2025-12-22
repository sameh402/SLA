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

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructors: [""],
    category: "",
    price: "",
    duration: "",
    status: "draft" as "active" | "draft",
    thumbnail: "/placeholder.svg",
    thumbnailFile: null as File | null,
    videos: [] as VideoContent[]
  });

  const [isEditContentDialogOpen, setIsEditContentDialogOpen] = useState(false);
  const [selectedCourseForContent, setSelectedCourseForContent] = useState<Course | null>(null);
  const [contentFormData, setContentFormData] = useState({
    title: "",
    description: "",
    videos: [] as VideoContent[],
  });

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructors.some((i) => i.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const fetchCourseMedia = async (courseId: number) => {
    try {
      const res = await adminGetCourseMedia(courseId);
      return (res.data || []).map((m: any, idx: number) => ({
        id: m.id,
        title: m.title,
        session: m.session || "",
        description: m.description || "",
        url: m.file,
        duration: m.duration || "",
        order: m.order || idx + 1,
      }));
    } catch (error) {
      console.error("Failed to fetch course media:", error);
      return [];
    }
  };

  const handleSaveCourse = async () => {
    if (!editingCourse) return;

    try {
      const updateData = new FormData();
      updateData.append('title', formData.title);
      updateData.append('description', formData.description);
      updateData.append('price', formData.price);
      updateData.append('status', formData.status === 'active' ? 'published' : 'draft');
      updateData.append('category', formData.category);
      updateData.append('duration', formData.duration);
      updateData.append('instructors', JSON.stringify(formData.instructors.filter(i => i.trim() !== '')));

      if (formData.thumbnailFile) {
        try {
          const thumbFormData = new FormData();
          thumbFormData.append('file', formData.thumbnailFile);
          thumbFormData.append('course_folder', `${slugify(formData.title)}/thumbnails`);

          const thumbUploadResult = await fetch(
            import.meta.env.VITE_HOSTINGER_UPLOAD_URL || 'https://smartonlinelearningedu.com/hostinger_upload.php',
            {
              method: 'POST',
              body: thumbFormData,
            }
          );

          const thumbResult = await thumbUploadResult.json();
          if (thumbResult.status === 'success') {
            updateData.append('thumbnail', thumbResult.url);
          }
        } catch (err) {
          console.error('Thumbnail upload failed:', err);
        }
      }

      const response = await adminUpdateCourse(parseInt(editingCourse.id, 10), updateData);
      const updatedCourse = response.data;

      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === editingCourse.id
            ? {
              ...course,
              title: updatedCourse.title,
              description: updatedCourse.description,
              instructors: updatedCourse.instructors,
              category: updatedCourse.category,
              price: parseFloat(updatedCourse.price),
              duration: updatedCourse.duration,
              status: updatedCourse.status === 'published' ? 'active' : 'draft',
              thumbnail: updatedCourse.thumbnail || course.thumbnail,
            }
            : course
        )
      );

      setIsEditDialogOpen(false);
      setEditingCourse(null);
      resetForm();
    } catch (error) {
      alert("Failed to update course.");
    }
  };

  const handleSaveContent = async () => {
    if (!selectedCourseForContent) return;

    try {
      const updateData = {
        title: contentFormData.title,
        description: contentFormData.description,
      };

      const response = await adminUpdateCourse(parseInt(selectedCourseForContent.id, 10), updateData);
      const result = response.data;

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

              // Upload thumbnail to Hostinger if provided
              if (newCourse.thumbnailFile) {
                try {
                  const thumbFormData = new FormData();
                  thumbFormData.append('file', newCourse.thumbnailFile);
                  thumbFormData.append('course_folder', `${slugify(newCourse.title)}/thumbnails`);

                  const thumbUploadResult = await fetch(
                    import.meta.env.VITE_HOSTINGER_UPLOAD_URL || 'https://smartonlinelearningedu.com/hostinger_upload.php',
                    {
                      method: 'POST',
                      body: thumbFormData,
                    }
                  );

                  const thumbResult = await thumbUploadResult.json();
                  if (thumbResult.status === 'success') {
                    formData.append('thumbnail', thumbResult.url);
                  }
                } catch (err) {
                  console.error('Thumbnail upload failed:', err);
                }
              }

              const response = await adminCreateCourseMultipart(formData);
              const createdCourse = response.data;
              const courseId = createdCourse.id;

              const courseFolder = slugify(newCourse.title);

              // Parallel uploads for faster processing
              const uploadPromises = newCourse.videos.map(async (video, index) => {
                if (!video.file && (!video.url || !video.url.startsWith('http'))) return null;

                const sessionFolder = video.session ? slugify(video.session) : 'general';
                const fullFolderPath = `${courseFolder}/${sessionFolder}`;

                try {
                  // Skip upload if video already has a URL (already uploaded)
                  if (video.url && video.url.startsWith('http')) {
                    console.log(`Skipping upload for already uploaded video: ${video.title}`);
                    onProgress(video.id, 100);
                    return {
                      id: video.id,
                      title: video.title,
                      description: video.description || video.title,
                      url: video.url,
                      duration: video.duration || "0:00",
                      order: video.order || index + 1,
                    };
                  }

                  if (!video.file) return null;

                  const uploadResult = await uploadWithProgress(
                    import.meta.env.VITE_HOSTINGER_UPLOAD_URL || 'https://smartonlinelearningedu.com/hostinger_upload.php',
                    video.file,
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
                    mediaFormData.append('order', String(video.order || index + 1));
                    mediaFormData.append('session', video.session || "");

                    const mediaResponse = await createCourseMedia(courseId, mediaFormData);
                    return {
                      id: mediaResponse.data.id,
                      title: mediaResponse.data.title,
                      description: mediaResponse.data.title,
                      url: mediaResponse.data.file,
                      duration: mediaResponse.data.duration || "0:00",
                      order: mediaResponse.data.order || index + 1,
                    };
                  }
                } catch (mediaError) {
                  console.error("❌ Failed to upload video:", video.title, mediaError);
                }
                return null;
              });

              const uploadedVideos = (await Promise.all(uploadPromises)).filter(v => v !== null);

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
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses or instructors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
          </Card>
        ))}
      </div>
    </div>
  );
}