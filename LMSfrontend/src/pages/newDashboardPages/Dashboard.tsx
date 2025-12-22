import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CourseWithVideos, VideoContent, coursesWithContent } from '@/lib/coursesData';
import { adminSummary, adminListCourses, adminUpdateCourse, adminCreateCourseMultipart, createCourseMedia, adminDeleteCourseMedia } from '@/api/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BookOpen,
  Users,
  UserCheck,
  TrendingUp,
  Star,
  Calendar,
  Clock,
  Award,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Video,
  Trash2,
  Save
} from 'lucide-react';
import AddCourseDialog from '@/components/AddCourseDialog';

// Sample data for revenue and active students organized by year
const revenueData = {
  2022: {
    quarter: [
      { period: 'Q1', value: 15200 },
      { period: 'Q2', value: 16800 },
      { period: 'Q3', value: 17200 },
      { period: 'Q4', value: 18300 }
    ],
    month: [
      { period: 'Jan', value: 4800 },
      { period: 'Feb', value: 5100 },
      { period: 'Mar', value: 5300 },
      { period: 'Apr', value: 5400 },
      { period: 'May', value: 5600 },
      { period: 'Jun', value: 5800 },
      { period: 'Jul', value: 5700 },
      { period: 'Aug', value: 5800 },
      { period: 'Sep', value: 5700 },
      { period: 'Oct', value: 6000 },
      { period: 'Nov', value: 6100 },
      { period: 'Dec', value: 6200 }
    ]
  },
  2023: {
    quarter: [
      { period: 'Q1', value: 18200 },
      { period: 'Q2', value: 22500 },
      { period: 'Q3', value: 24800 },
      { period: 'Q4', value: 23700 }
    ],
    month: [
      { period: 'Jan', value: 5800 },
      { period: 'Feb', value: 6100 },
      { period: 'Mar', value: 6300 },
      { period: 'Apr', value: 7200 },
      { period: 'May', value: 7500 },
      { period: 'Jun', value: 7800 },
      { period: 'Jul', value: 8100 },
      { period: 'Aug', value: 8300 },
      { period: 'Sep', value: 8400 },
      { period: 'Oct', value: 7800 },
      { period: 'Nov', value: 7900 },
      { period: 'Dec', value: 8000 }
    ]
  },
  2024: {
    quarter: [
      { period: 'Q1', value: 28900 },
      { period: 'Q2', value: 32100 },
      { period: 'Q3', value: 34200 },
      { period: 'Q4', value: 29300 }
    ],
    month: [
      { period: 'Jan', value: 8900 },
      { period: 'Feb', value: 9800 },
      { period: 'Mar', value: 10200 },
      { period: 'Apr', value: 10800 },
      { period: 'May', value: 10500 },
      { period: 'Jun', value: 10800 },
      { period: 'Jul', value: 11400 },
      { period: 'Aug', value: 11200 },
      { period: 'Sep', value: 11600 },
      { period: 'Oct', value: 10100 },
      { period: 'Nov', value: 9800 },
      { period: 'Dec', value: 9400 }
    ]
  }
};

const activeStudentsData = {
  2022: {
    quarter: [
      { period: 'Q1', value: 520 },
      { period: 'Q2', value: 580 },
      { period: 'Q3', value: 620 },
      { period: 'Q4', value: 675 }
    ],
    month: [
      { period: 'Jan', value: 480 },
      { period: 'Feb', value: 495 },
      { period: 'Mar', value: 520 },
      { period: 'Apr', value: 540 },
      { period: 'May', value: 560 },
      { period: 'Jun', value: 580 },
      { period: 'Jul', value: 600 },
      { period: 'Aug', value: 610 },
      { period: 'Sep', value: 620 },
      { period: 'Oct', value: 640 },
      { period: 'Nov', value: 660 },
      { period: 'Dec', value: 675 }
    ]
  },
  2023: {
    quarter: [
      { period: 'Q1', value: 720 },
      { period: 'Q2', value: 785 },
      { period: 'Q3', value: 850 },
      { period: 'Q4', value: 892 }
    ],
    month: [
      { period: 'Jan', value: 685 },
      { period: 'Feb', value: 705 },
      { period: 'Mar', value: 720 },
      { period: 'Apr', value: 750 },
      { period: 'May', value: 770 },
      { period: 'Jun', value: 785 },
      { period: 'Jul', value: 820 },
      { period: 'Aug', value: 835 },
      { period: 'Sep', value: 850 },
      { period: 'Oct', value: 870 },
      { period: 'Nov', value: 880 },
      { period: 'Dec', value: 892 }
    ]
  },
  2024: {
    quarter: [
      { period: 'Q1', value: 950 },
      { period: 'Q2', value: 1080 },
      { period: 'Q3', value: 1180 },
      { period: 'Q4', value: 1247 }
    ],
    month: [
      { period: 'Jan', value: 950 },
      { period: 'Feb', value: 975 },
      { period: 'Mar', value: 995 },
      { period: 'Apr', value: 1020 },
      { period: 'May', value: 1045 },
      { period: 'Jun', value: 1080 },
      { period: 'Jul', value: 1125 },
      { period: 'Aug', value: 1150 },
      { period: 'Sep', value: 1180 },
      { period: 'Oct', value: 1205 },
      { period: 'Nov', value: 1225 },
      { period: 'Dec', value: 1247 }
    ]
  }
};

const availableYears = [2022, 2023, 2024];

// Helper function to generate sample data when API data is empty
const generateSampleData = (type: 'revenue' | 'enrollments', days: number = 30) => {
  const data = [];
  const baseValue = type === 'revenue' ? 1000 : 10;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    data.push({
      period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: baseValue + Math.floor(Math.random() * baseValue * 0.5)
    });
  }

  return data;
};

import DashboardStats from './components/DashboardStats';
import DashboardCharts from './components/DashboardCharts';
import RecentCoursesList from './components/RecentCoursesList';
import CourseContentEditor from './components/CourseContentEditor';
import QuickActionsGrid from './components/QuickActionsGrid';

export default function Dashboard() {
  const [courses, setCourses] = useState<CourseWithVideos[]>(coursesWithContent);
  const [revenueYear, setRevenueYear] = useState(2024);
  const [revenuePeriod, setRevenuePeriod] = useState<'quarter' | 'month'>('month');
  const [studentsYear, setStudentsYear] = useState(2024);
  const [studentsPeriod, setStudentsPeriod] = useState<'quarter' | 'month'>('month');

  // API data state
  const [summaryData, setSummaryData] = useState<any>(null);
  const [apiCourses, setApiCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<CourseWithVideos | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const categories = ["Programming", "Data Science", "AI/ML", "Design", "Business", "Marketing"];
  const [isUploadVideoDialogOpen, setIsUploadVideoDialogOpen] = useState(false);
  const [isScheduleEventDialogOpen, setIsScheduleEventDialogOpen] = useState(false);
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', description: '', courseId: '' });
  const [isIssueCertificateDialogOpen, setIsIssueCertificateDialogOpen] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [certificateForm, setCertificateForm] = useState({ student: '', courseId: '', date: '' });
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [uploadVideos, setUploadVideos] = useState<{
    id?: number;
    title: string;
    description: string;
    duration: string;
    file: any;
    uploadProgress: number;
    url: string;
  }[]>([{ title: "", description: "", duration: "", file: null, uploadProgress: 0, url: "" }]);

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
        reject(new Error('Network error during upload.'));
      });

      xhr.open('POST', url);
      xhr.send(formData);
    });
  };

  // Fetch all data in parallel for better performance
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [summaryRes, coursesRes] = await Promise.all([
          adminSummary(),
          adminListCourses()
        ]);

        setSummaryData(summaryRes.data);
        setApiCourses(coursesRes.data.results || []);
        console.log("Dashboard data loaded successfully");
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Handle video file upload for upload dialog
  const handleUploadDialogVideoFileChange = async (file: File, index: number) => {
    if (!file || !selectedCourseId) {
      if (!selectedCourseId) alert("Please select a course first");
      return;
    }

    const selectedCourse = apiCourses.find(c => c.id.toString() === selectedCourseId);
    const courseFolder = selectedCourse ? slugify(selectedCourse.title) : 'general';

    try {
      const uploadResult = await uploadWithProgress(
        import.meta.env.VITE_HOSTINGER_UPLOAD_URL || 'https://smartonlinelearningedu.com/hostinger_upload.php',
        file,
        courseFolder,
        (progress) => {
          const updatedVideos = [...uploadVideos];
          updatedVideos[index].uploadProgress = progress;
          setUploadVideos(updatedVideos);
        }
      );

      if (uploadResult.status === 'success') {
        const updatedVideos = [...uploadVideos];
        updatedVideos[index].url = uploadResult.url;
        updatedVideos[index].uploadProgress = 100;
        setUploadVideos(updatedVideos);
      }
    } catch (error: any) {
      alert('Video upload failed: ' + error.message);
    }
  };

  const addUploadDialogVideo = () => {
    setUploadVideos([...uploadVideos, { title: "", description: "", duration: "", file: null, uploadProgress: 0, url: "" }]);
  };

  const removeUploadDialogVideo = async (index: number) => {
    const videoToRemove = uploadVideos[index];
    try {
      if (videoToRemove.id && selectedCourseId) {
        await adminDeleteCourseMedia(parseInt(selectedCourseId, 10), videoToRemove.id);
        console.log(`✅ Video ${videoToRemove.id} deleted successfully from server.`);
      } else {
        console.log("🟡 Video not uploaded yet, removing locally only.");
      }

      setUploadVideos(uploadVideos.filter((_, i) => i !== index));
    } catch (error) {
      console.error("❌ Failed to delete video:", error);
    }
  };


  const handleUploadVideosToCourse = async () => {
    if (!selectedCourseId) return;

    try {
      for (const [index, video] of uploadVideos.entries()) {
        if (video.file) {
          const formData = new FormData();
          formData.append("course", selectedCourseId);
          formData.append("file", video.file);
          formData.append("media_type", "video");
          formData.append("title", video.title || `Video ${index + 1}`);
          formData.append("description", video.description || "");
          formData.append("duration", video.duration || "1");
          formData.append("order", String(index + 1));

          await createCourseMedia(parseInt(selectedCourseId, 10), formData);
        }
      }

      console.log("✅ All videos uploaded successfully!");

      setCourses(courses.map(course => {
        if (course.id.toString() === selectedCourseId) {
          const newVideos = uploadVideos
            .filter(v => v.url)
            .map((v, i) => ({
              id: Date.now() + i,
              title: v.title,
              description: v.description,
              url: v.url,
              duration: v.duration,
              order: i + 1,
            }));
          return { ...course, videos: [...course.videos, ...newVideos] };
        }
        return course;
      }));

      const refreshed = await adminListCourses();
      setApiCourses(refreshed.data.results || []);

      setIsUploadVideoDialogOpen(false);
      setSelectedCourseId("");
      setUploadVideos([{ title: "", description: "", duration: "", file: null, uploadProgress: 0, url: "" }]);
    } catch (error) {
      console.error("❌ Error uploading videos:", error);
      alert("Failed to upload videos. Please try again.");
    }
  };


  // New course form state
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    instructor: "",
    videos: [{ title: "", description: "", url: "", duration: "", file: null, uploadProgress: 0 }]
  });

  // Edit course form state
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    videos: [] as (VideoContent & { file?: any; uploadProgress?: number })[]
  });

  // Handle video file upload for edit dialog
  const handleEditVideoFileChange = async (file: File, index: number) => {
    if (!file) return;
    const courseFolder = editingCourse ? slugify(editingCourse.title) : 'general';

    try {
      const uploadResult = await uploadWithProgress(
        import.meta.env.VITE_HOSTINGER_UPLOAD_URL || 'https://smartonlinelearningedu.com/hostinger_upload.php',
        file,
        courseFolder,
        (progress) => {
          const updatedVideos = [...editFormData.videos];
          updatedVideos[index].uploadProgress = progress;
          setEditFormData({ ...editFormData, videos: updatedVideos });
        }
      );

      if (uploadResult.status === 'success') {
        const updatedVideos = [...editFormData.videos];
        updatedVideos[index].url = uploadResult.url;
        updatedVideos[index].uploadProgress = 100;
        setEditFormData({ ...editFormData, videos: updatedVideos });
      }
    } catch (error: any) {
      alert('Video upload failed: ' + error.message);
    }
  };

  const openEditDialog = (course: CourseWithVideos) => {
    setEditingCourse(course);
    setEditFormData({
      title: course.title,
      description: course.description,
      videos: [...course.videos]
    });
    setIsEditDialogOpen(true);
  };

  //   const handleSaveCourse = async () => {
  //   if (!editingCourse) return;

  //   try {
  //     const payload = new FormData();
  //     payload.append("title", editFormData.title);
  //     payload.append("description", editFormData.description);

  //     const res = await adminUpdateCourse(parseInt(editingCourse.id.toString(), 10), payload);
  //     const result = res?.data ?? {};

  //     for (const [index, video] of editFormData.videos.entries()) {
  //       if (video.file) {
  //         const mediaFormData = new FormData();
  //         mediaFormData.append("course", editingCourse.id.toString());
  //         mediaFormData.append("file", video.file);
  //         mediaFormData.append("media_type", "video");
  //         mediaFormData.append("title", video.title || `Video ${index + 1}`);
  //         mediaFormData.append("description", video.description || "");
  //         mediaFormData.append("duration", video.duration || "0");
  //         mediaFormData.append("order", String(index + 1));

  //         try {
  //           await createCourseMedia(parseInt(editingCourse.id.toString(), 10), mediaFormData);
  //           console.log(`✅ Uploaded video ${index + 1}: ${video.title}`);
  //         } catch (uploadError) {
  //           console.error(`❌ Failed to upload video ${video.title}:`, uploadError);
  //         }
  //       }
  //     }

  //     const updatedCourses = courses.map((course) =>
  //       course.id === editingCourse.id
  //         ? {
  //             ...course,
  //             title: result.title ?? editFormData.title,
  //             description: result.description ?? editFormData.description,
  //             videos: editFormData.videos,
  //           }
  //         : course
  //     );
  //     setCourses(updatedCourses);

  //     const coursesResponse = await adminListCourses();
  //     setApiCourses(coursesResponse.data.results || []);

  //     setIsEditDialogOpen(false);
  //     setEditingCourse(null);

  //     console.log("✅ Course content and videos updated successfully!");
  //   } catch (error) {
  //     console.error("❌ Failed to update course content:", error);
  //   }
  // };
  const handleSaveCourse = async () => {
    if (!editingCourse) return;

    try {
      // --- Update basic course info ---
      const courseFormData = new FormData();
      courseFormData.append("title", editFormData.title);
      courseFormData.append("description", editFormData.description);

      // send PATCH request
      await adminUpdateCourse(parseInt(editingCourse.id.toString(), 10), courseFormData);
      console.log("✅ Course info updated successfully");

      // --- Upload new videos if added ---
      for (const [index, video] of editFormData.videos.entries()) {
        if (video.file instanceof File) {
          const mediaFormData = new FormData();
          mediaFormData.append("course", editingCourse.id.toString());
          mediaFormData.append("file", video.file);
          mediaFormData.append("media_type", "video");
          mediaFormData.append("title", video.title || `Video ${index + 1}`);
          mediaFormData.append("description", video.description || "");
          mediaFormData.append("duration", video.duration || "0");
          mediaFormData.append("order", String(index + 1));

          try {
            const mediaRes = await createCourseMedia(parseInt(editingCourse.id.toString(), 10), mediaFormData);
            console.log(`✅ Uploaded video ${index + 1}: ${mediaRes.data.title}`);
          } catch (uploadError) {
            console.error(`❌ Failed to upload video ${video.title}:`, uploadError);
          }
        }
      }

      // --- Refresh course list after editing ---
      const updatedCoursesResponse = await adminListCourses();
      const updatedCourses = updatedCoursesResponse.data.results || [];
      setApiCourses(updatedCourses);

      // Update local course list for instant UI reflection
      setCourses((prev) =>
        prev.map((course) =>
          course.id === editingCourse.id
            ? {
              ...course,
              title: editFormData.title,
              description: editFormData.description,
              videos: editFormData.videos,
            }
            : course
        )
      );

      setIsEditDialogOpen(false);
      setEditingCourse(null);

      alert("✅ Course and videos updated successfully!");
    } catch (error) {
      console.error("❌ Failed to update course:", error);
      alert("Failed to update course. Please try again.");
    }
  };



  const handleAddCourse = async () => {
    const newCourseData: CourseWithVideos = {
      id: Date.now(),
      title: newCourse.title,
      description: newCourse.description,
      instructor: newCourse.instructor,
      students: 0,
      rating: 0,
      status: "draft",
      progress: 0,
      category: "General", // Default or get from form if you have it
      price: 0, // Default or get from form if you have it
      duration: "0h 0m", // Default or calculate from videos if you want
      thumbnail: "", // Default or get from form/file upload if you have it
      videos: newCourse.videos.map((video, index) => ({
        id: Date.now() + index,
        title: video.title,
        description: video.description,
        url: video.url,
        duration: video.duration,
        order: index + 1
      }))
    };

    setCourses([...courses, newCourseData]);

    // Refresh API courses data to show changes
    try {
      const coursesResponse = await adminListCourses();
      setApiCourses(coursesResponse.data.results || []);
    } catch (error) {
      console.error("❌ Failed to refresh courses data:", error);
    }

    setIsAddCourseDialogOpen(false);
    setNewCourse({
      title: "",
      description: "",
      instructor: "",
      videos: [{ title: "", description: "", url: "", duration: "", file: null, uploadProgress: 0 }]
    });
  };

  const addVideoToNewCourse = () => {
    setNewCourse({
      ...newCourse,
      videos: [...newCourse.videos, { title: "", description: "", url: "", duration: "", file: null, uploadProgress: 0 }]
    });
  };

  // Handle video file upload
  const handleVideoFileChange = async (file: File, index: number) => {
    if (!file) return;
    const courseFolder = newCourse.title ? slugify(newCourse.title) : 'general';

    try {
      const uploadResult = await uploadWithProgress(
        import.meta.env.VITE_HOSTINGER_UPLOAD_URL || 'https://smartonlinelearningedu.com/hostinger_upload.php',
        file,
        courseFolder,
        (progress) => {
          const updatedVideos = [...newCourse.videos];
          updatedVideos[index].uploadProgress = progress;
          setNewCourse({ ...newCourse, videos: updatedVideos });
        }
      );

      if (uploadResult.status === 'success') {
        const updatedVideos = [...newCourse.videos];
        updatedVideos[index].url = uploadResult.url;
        updatedVideos[index].uploadProgress = 100;
        setNewCourse({ ...newCourse, videos: updatedVideos });
      }
    } catch (error: any) {
      alert('Video upload failed: ' + error.message);
    }
  };

  const addVideoToEditCourse = () => {
    setEditFormData({
      ...editFormData,
      videos: [...editFormData.videos, {
        id: Date.now(),
        title: "",
        description: "",
        url: "",
        duration: "",
        order: editFormData.videos.length + 1
      }]
    });
  };

  const removeVideoFromEditCourse = async (videoId: number) => {
    if (!editingCourse) {
      console.error("❌ No course selected for editing.");
      return;
    }


    try {
      await adminDeleteCourseMedia(editingCourse.id, videoId);
      console.log(`✅ Video ${videoId} deleted successfully from server.`);

      setEditFormData({
        ...editFormData,
        videos: editFormData.videos.filter(video => video.id !== videoId),
      });

      const refreshed = await adminListCourses();
      setApiCourses(refreshed.data.results || []);
    } catch (error) {
      console.error("❌ Failed to delete video:", error);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Manage your course content and platform.</p>
        </div>
        <AddCourseDialog
          open={isAddCourseDialogOpen}
          setOpen={setIsAddCourseDialogOpen}
          categories={categories}
          onAddCourse={async (newCourse) => {
            try {
              // Create FormData for the API with course data (without videos)
              const formData = new FormData();
              // formData.append('title', newCourse.title);
              // formData.append('description', newCourse.description);
              // formData.append('price', newCourse.price);
              // formData.append('status', newCourse.status);
              // formData.append('category', newCourse.category);
              // formData.append('duration', newCourse.duration);

              // // Add thumbnail if available
              // if (newCourse.thumbnailFile) {
              //   formData.append('thumbnail', newCourse.thumbnailFile);
              // }
              formData.append('title', newCourse.title);
              formData.append('description', newCourse.description);
              formData.append('price', newCourse.price || '0.00');

              const statusMap: Record<string, string> = {
                active: 'published',
                draft: 'draft',
                archived: 'archived',
              };
              formData.append('status', statusMap[newCourse.status] ?? 'draft');

              if (newCourse.category) formData.append('category', newCourse.category);
              if (newCourse.duration) formData.append('duration', newCourse.duration);
              if (newCourse.nextCourseRecommendation)
                formData.append('next_course_recommendation', newCourse.nextCourseRecommendation);

              formData.append('instructors', JSON.stringify(newCourse.instructors.filter(i => i.trim() !== '')));

              if (newCourse.thumbnailFile) formData.append('thumbnail', newCourse.thumbnailFile);


              // Create the course first (without videos)
              const response = await adminCreateCourseMultipart(formData);
              const createdCourse = response.data;
              const courseId = createdCourse.id;

              console.log("✅ Course created successfully:", createdCourse);

              // Upload videos separately if any
              const uploadedVideos = [];
              if (courseId && newCourse.videos.length > 0) {
                for (const video of newCourse.videos) {
                  if (video.file) {
                    const mediaFormData = new FormData();
                    mediaFormData.append('course', String(courseId));
                    mediaFormData.append('file', video.file);
                    mediaFormData.append('media_type', 'video');
                    mediaFormData.append('title', video.title || video.file.name);
                    mediaFormData.append('description', video.description || '');
                    mediaFormData.append('duration', video.duration || '0:00');
                    mediaFormData.append('order', String(video.order || uploadedVideos.length + 1));

                    try {
                      const mediaResponse = await createCourseMedia(courseId, mediaFormData);
                      uploadedVideos.push({
                        id: mediaResponse.data.id,
                        title: mediaResponse.data.title,
                        description: mediaResponse.data.title,
                        url: mediaResponse.data.file,
                        duration: mediaResponse.data.duration || "0:00",
                        order: mediaResponse.data.order || uploadedVideos.length + 1,
                      });
                    } catch (mediaError) {
                      console.error("❌ Failed to upload video:", video.title, mediaError);
                    }
                  }
                }
              }

              // Add the course to local state with uploaded videos
              const courseWithVideos: CourseWithVideos = {
                id: createdCourse.id,
                title: createdCourse.title,
                description: createdCourse.description,
                instructor: newCourse.instructors.find((i) => i.trim() !== "") || "",
                students: 0,
                rating: 0,
                status: createdCourse.status,
                progress: 0,
                videos: uploadedVideos,
                category: createdCourse.category,
                price: Number(createdCourse.price || 0),
                duration: createdCourse.duration,
                thumbnail: createdCourse.thumbnail,
              };

              setCourses([...courses, courseWithVideos]);

              // Refresh API courses data
              const coursesResponse = await adminListCourses();
              setApiCourses(coursesResponse.data.results || []);

              console.log("✅ Course created successfully with", uploadedVideos.length, "videos!");
              return true;
            } catch (error) {
              console.error("❌ Failed to create course:", error);
              alert("Failed to create course. Please try again.");
              return false;
            }
          }}
        />
      </div>

      {/* Stats Cards */}
      <DashboardStats summaryData={summaryData} />

      {/* Analytics Charts */}
      <DashboardCharts summaryData={summaryData} generateSampleData={generateSampleData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <RecentCoursesList loading={loading} apiCourses={apiCourses} />

        {/* Course Content Editor */}
        <CourseContentEditor
          loading={loading}
          apiCourses={apiCourses}
          courses={courses}
          openEditDialog={openEditDialog}
        />
      </div>

      {/* Quick Actions */}
      <QuickActionsGrid
        setIsAddCourseDialogOpen={setIsAddCourseDialogOpen}
        setIsUploadVideoDialogOpen={setIsUploadVideoDialogOpen}
        setIsScheduleEventDialogOpen={setIsScheduleEventDialogOpen}
        setIsIssueCertificateDialogOpen={setIsIssueCertificateDialogOpen}
      />


      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update course information and video content</DialogTitle>
          </DialogHeader>
          {editingCourse && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Course Title</Label>
                <Input
                  id="edit-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="Enter course title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Enter course description"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Course Videos</Label>
                  <Button type="button" size="sm" onClick={addVideoToEditCourse}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Video
                  </Button>
                </div>

                {editFormData.videos.map((video, index) => (
                  <div key={video.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Video {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVideoFromEditCourse(video.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Video Title</Label>
                        <Input
                          value={video.title}
                          onChange={(e) => {
                            const updatedVideos = editFormData.videos.map(v =>
                              v.id === video.id ? { ...v, title: e.target.value } : v
                            );
                            setEditFormData({ ...editFormData, videos: updatedVideos });
                          }}
                          placeholder="Video title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input
                          value={video.duration}
                          onChange={(e) => {
                            const updatedVideos = editFormData.videos.map(v =>
                              v.id === video.id ? { ...v, duration: e.target.value } : v
                            );
                            setEditFormData({ ...editFormData, videos: updatedVideos });
                          }}
                          placeholder="e.g. 25:30"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Video Description</Label>
                      <Textarea
                        value={video.description}
                        onChange={(e) => {
                          const updatedVideos = editFormData.videos.map(v =>
                            v.id === video.id ? { ...v, description: e.target.value } : v
                          );
                          setEditFormData({ ...editFormData, videos: updatedVideos });
                        }}
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
                            const updatedVideos = editFormData.videos.map((v) =>
                              v.id === video.id ? { ...v, file, url: URL.createObjectURL(file) } : v
                            );
                            setEditFormData({ ...editFormData, videos: updatedVideos });
                          }
                        }}
                      />
                      {video.url && (
                        <video
                          src={video.url}
                          controls
                          className="w-full mt-2 rounded-md border border-border"
                        />
                      )}

                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCourse}>
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
