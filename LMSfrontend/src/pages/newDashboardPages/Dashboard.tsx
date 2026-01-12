import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

// Dashboard statistics cards data - will be updated with API data
const getStats = (summaryData: any) => {
  if (!summaryData) {
    return [
      {
        title: "Total Courses",
        value: "0",
        change: "0%",
        changeType: "increase" as const,
        icon: BookOpen,
        color: "bg-blue-500"
      },
      {
        title: "Active Students",
        value: "0",
        change: "0%",
        changeType: "increase" as const,
        icon: Users,
        color: "bg-green-500"
      },
      {
        title: "Video Content",
        value: "0",
        change: "0%",
        changeType: "increase" as const,
        icon: Video,
        color: "bg-purple-500"
      },
      {
        title: "Revenue",
        value: "$0",
        change: "0%",
        changeType: "increase" as const,
        icon: TrendingUp,
        color: "bg-green-600"
      }
    ];
  }

  const totalCourses = (summaryData.courses?.published || 0) + (summaryData.courses?.draft || 0);
  const activeStudents = summaryData.enrollments?.active || 0;
  const totalRevenue = summaryData.revenue?.total || 0;
  const totalVideos = summaryData.total_videos || 0;

  return [
    {
      title: "Total Courses",
      value: totalCourses.toString(),
      change: "+12%",
      changeType: "increase" as const,
      icon: BookOpen,
      color: "bg-blue-500"
    },
    {
      title: "Active Students",
      value: activeStudents.toString(),
      change: "+8%",
      changeType: "increase" as const,
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Video Content",
      value: totalVideos.toString(),
      change: "+20%",
      changeType: "increase" as const,
      icon: Video,
      color: "bg-purple-500"
    },
    {
      title: "Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      change: "+15%",
      changeType: "increase" as const,
      icon: TrendingUp,
      color: "bg-green-600"
    }
  ];
};

import React, { useState, useEffect } from 'react';
import { CourseWithVideos, VideoContent, coursesWithContent } from '@/lib/coursesData';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { adminSummary, adminListCourses, adminUpdateCourse, adminCreateCourseMultipart, createCourseMedia, adminDeleteCourseMedia } from '@/api/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import AddCourseDialog from '../components/AddCourseDialog';
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
  const [uploadVideos, setUploadVideos] = useState([{ id: Date.now(), title: "", description: "", duration: "", file: null, uploadProgress: 0, url: "" }]);

  // Sequential upload queue
  const [uploadQueue, setUploadQueue] = useState<{
    file: File;
    index: number;
    type: 'new' | 'edit' | 'uploadDialog';
  }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const processQueue = async () => {
      if (isUploading || uploadQueue.length === 0) return;

      setIsUploading(true);
      const item = uploadQueue[0];
      const { file, index, type } = item;

      const videoName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `videos/${videoName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (type === 'new') {
            setNewCourse(prev => {
              const updated = [...prev.videos];
              if (updated[index]) updated[index].uploadProgress = progress;
              return { ...prev, videos: updated };
            });
          } else if (type === 'edit') {
            setEditFormData(prev => {
              const updated = [...prev.videos];
              if (updated[index]) updated[index].uploadProgress = progress;
              return { ...prev, videos: updated };
            });
          } else if (type === 'uploadDialog') {
            setUploadVideos(prev => {
              const updated = [...prev];
              if (updated[index]) updated[index].uploadProgress = progress;
              return { ...prev, videos: updated };
            });
          }
        },
        (error) => {
          alert('Video upload failed: ' + error.message);
          setUploadQueue(prev => prev.slice(1));
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          if (type === 'new') {
            setNewCourse(prev => {
              const updated = [...prev.videos];
              if (updated[index]) {
                updated[index].url = downloadURL;
                updated[index].uploadProgress = 100;
              }
              return { ...prev, videos: updated };
            });
          } else if (type === 'edit') {
            setEditFormData(prev => {
              const updated = [...prev.videos];
              if (updated[index]) {
                updated[index].url = downloadURL;
                updated[index].uploadProgress = 100;
              }
              return { ...prev, videos: updated };
            });
          } else if (type === 'uploadDialog') {
            setUploadVideos(prev => {
              const updated = [...prev];
              if (updated[index]) {
                updated[index].url = downloadURL;
                updated[index].uploadProgress = 100;
              }
              return updated;
            });
          }
          setUploadQueue(prev => prev.slice(1));
          setIsUploading(false);
        }
      );
    };

    processQueue();
  }, [uploadQueue, isUploading]);

  // Fetch summary data
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const response = await adminSummary();
        setSummaryData(response.data);
        console.log("Summary Data:", response.data);
      } catch (error) {
        console.error('Error fetching summary data:', error);
      }
    };

    fetchSummaryData();
  }, []);

  // Fetch courses data
  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        const response = await adminListCourses();
        setApiCourses(response.data.results || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses data:', error);
        setLoading(false);
      }
    };

    fetchCoursesData();
  }, []);
  // Handle video file upload for upload dialog
  const handleUploadDialogVideoFileChange = (file, index) => {
    if (!file) return;
    setUploadQueue(prev => [...prev, { file, index, type: 'uploadDialog' }]);
  };

  const addUploadDialogVideo = () => {
    setUploadVideos([...uploadVideos, { id: Date.now(), title: "", description: "", duration: "", file: null, uploadProgress: 0, url: "" }]);
  };

  const removeUploadDialogVideo = async (index: number) => {
    const videoToRemove = uploadVideos[index];
    try {
      if ((videoToRemove as any).id && selectedCourseId) {
        await adminDeleteCourseMedia(parseInt(selectedCourseId, 10), (videoToRemove as any).id);
        console.log(`✅ Video ${(videoToRemove as any).id} deleted successfully from server.`);
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
      setUploadVideos([{ id: Date.now(), title: "", description: "", duration: "", file: null, uploadProgress: 0, url: "" }]);
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
  const handleEditVideoFileChange = (file, index) => {
    if (!file) return;
    setUploadQueue(prev => [...prev, { file, index, type: 'edit' }]);
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
  const handleVideoFileChange = (file, index) => {
    if (!file) return;
    setUploadQueue(prev => [...prev, { file, index, type: 'new' }]);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStats(summaryData).map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {stat.changeType === "increase" ? (
                    <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-1 text-red-500" />
                  )}
                  <span className={stat.changeType === "increase" ? "text-green-500" : "text-red-500"}>
                    {stat.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Track revenue performance over time</CardDescription>
              </div>
              <div className="flex gap-2">
                {/* <Select value={revenueYear.toString()} onValueChange={(value) => setRevenueYear(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={revenuePeriod} onValueChange={(value: 'quarter' | 'month') => setRevenuePeriod(value)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select> */}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summaryData?.revenue?.total ? [
                  { period: 'Total Revenue', value: summaryData.revenue.total },
                  { period: 'Last 7 Days', value: summaryData.revenue.last_7_days || 0 },
                  { period: 'Last 30 Days', value: summaryData.revenue.last_30_days || 0 }
                ] : generateSampleData('revenue', 3)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="period"
                    className="text-muted-foreground"
                    fontSize={12}
                  />
                  <YAxis
                    className="text-muted-foreground"
                    fontSize={12}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Active Students Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Students</CardTitle>
                <CardDescription>Monitor student engagement trends</CardDescription>
              </div>
              <div className="flex gap-2">
                {/* <Select value={studentsYear.toString()} onValueChange={(value) => setStudentsYear(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}
                {/* <Select value={studentsPeriod} onValueChange={(value: 'quarter' | 'month') => setStudentsPeriod(value)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select> */}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summaryData?.enrollments?.active ? [
                  { period: 'Active Students', value: summaryData.enrollments.active },
                  { period: 'Completed', value: summaryData.enrollments.completed || 0 },
                  // { period: 'Total Users', value: summaryData.users.users_by_role.role=="student" || 0 }
                  { period: 'Total Students', value: summaryData?.users_by_role?.find(r => r.role === 'student')?.count || 0 }
                ] : generateSampleData('enrollments', 3)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="period"
                    className="text-muted-foreground"
                    fontSize={12}
                  />
                  <YAxis
                    className="text-muted-foreground"
                    fontSize={12}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), 'Students']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--accent-foreground))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent-foreground))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--accent-foreground))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Courses</span>
              <Button variant="ghost" size="sm">View All</Button>
            </CardTitle>
            <CardDescription>
              Manage and monitor your latest courses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading courses...</div>
            ) : (
              apiCourses.slice(0, 5).map((course) => (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="block hover:bg-accent/40 transition rounded-lg"
                >
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-foreground">{course.title}</h3>
                        <Badge variant={course.status === "published" ? "default" : "secondary"}>
                          {course.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Price: ${course.price}</span>
                        <span>{course.media?.length || 0} media files</span>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-blue-500" />
                          {new Date(course.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Course Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Course Content</span>
              <Badge variant="secondary">{courses.length}</Badge>
            </CardTitle>
            <CardDescription>
              Edit course titles and content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">Loading courses...</div>
            ) : (
              apiCourses.map((course) => (
                <div key={course.id} className="p-3 border border-border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground">{course.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Video className="w-3 h-3 mr-1" />
                      {course.media?.length || 0} media files
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {course.status}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full text-xs h-7"
                    onClick={() => {
                      // Convert API course to CourseWithVideos format for editing
                      const courseForEdit: CourseWithVideos = {
                        id: course.id,
                        title: course.title,
                        description: course.description,
                        instructor: "Admin", // API doesn't provide instructor info
                        students: 0, // Would need to get from enrollments
                        rating: 0, // Would need to get from reviews
                        status: course.status,
                        progress: 0,
                        category: "General",
                        price: parseFloat(course.price),
                        duration: "0h 0m",
                        thumbnail: course.thumbnail,
                        videos: course.media?.map((media: any, index: number) => ({
                          id: media.id,
                          title: media.title,
                          description: media.title,
                          url: media.file,
                          duration: media.duration || "0:00",
                          order: media.order || index + 1
                        })) || []
                      };
                      openEditDialog(courseForEdit);
                    }}
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    Edit Content
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="relative">
        <div className="absolute inset-0 backdrop-blur-[1px] bg-white/70 z-10 pointer-events-none rounded-lg"></div>
        <Card className="opacity-80">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col" onClick={() => setIsAddCourseDialogOpen(true)}>
                <BookOpen className="w-6 h-6 mb-2" />
                <span>Add New Course</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={() => setIsUploadVideoDialogOpen(true)}>
                <Edit className="w-6 h-6 mb-2" />
                <span>Edit Course</span>
              </Button>
              {/* Upload Videos Dialog */}
              <Dialog open={isUploadVideoDialogOpen} onOpenChange={setIsUploadVideoDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload Videos to Course</DialogTitle>
                    <DialogDescription>
                      Select a course and upload one or more videos.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="select-course">Select Course</Label>
                      <select
                        id="select-course"
                        className="w-full border rounded px-2 py-1"
                        value={selectedCourseId}
                        onChange={e => setSelectedCourseId(e.target.value)}
                      >
                        <option value="">-- Select a course --</option>
                        {apiCourses.map(course => (
                          <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Videos</Label>
                        <Button type="button" size="sm" onClick={addUploadDialogVideo}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Video
                        </Button>
                      </div>
                      {uploadVideos.map((video, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Video {index + 1}</h4>
                            {uploadVideos.length > 1 && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeUploadDialogVideo(index)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Video Title</Label>
                              <Input
                                value={video.title}
                                onChange={e => {
                                  const updated = [...uploadVideos];
                                  updated[index].title = e.target.value;
                                  setUploadVideos(updated);
                                }}
                                placeholder="Video title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Duration</Label>
                              <Input
                                value={video.duration}
                                onChange={e => {
                                  const updated = [...uploadVideos];
                                  updated[index].duration = e.target.value;
                                  setUploadVideos(updated);
                                }}
                                placeholder="e.g. 25:30"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Video Description</Label>
                            <Textarea
                              value={video.description}
                              onChange={e => {
                                const updated = [...uploadVideos];
                                updated[index].description = e.target.value;
                                setUploadVideos(updated);
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
                                  const updated = [...uploadVideos];
                                  updated[index].file = file;
                                  updated[index].url = URL.createObjectURL(file);
                                  setUploadVideos(updated);
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
                      <Button variant="outline" onClick={() => setIsUploadVideoDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUploadVideosToCourse} disabled={!selectedCourseId || uploadVideos.some(v => !v.url)}>
                        Upload to Course
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="h-20 flex-col" onClick={() => setIsScheduleEventDialogOpen(true)}>
                <Calendar className="w-6 h-6 mb-2" />
                <span>Schedule Event</span>
              </Button>
              {/* Schedule Event Dialog */}
              <Dialog open={isScheduleEventDialogOpen} onOpenChange={setIsScheduleEventDialogOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Schedule New Event</DialogTitle>
                    <DialogDescription>
                      Create and schedule an event for a course.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-title">Event Title</Label>
                      <Input
                        id="event-title"
                        value={eventForm.title}
                        onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                        placeholder="Enter event title"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-date">Date</Label>
                        <Input
                          id="event-date"
                          type="date"
                          value={eventForm.date}
                          onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-time">Time</Label>
                        <Input
                          id="event-time"
                          type="time"
                          value={eventForm.time}
                          onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-course">Related Course</Label>
                      <select
                        id="event-course"
                        className="w-full border rounded px-2 py-1"
                        value={eventForm.courseId}
                        onChange={e => setEventForm({ ...eventForm, courseId: e.target.value })}
                      >
                        <option value="">-- Select a course (optional) --</option>
                        {apiCourses.map(course => (
                          <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-description">Description</Label>
                      <Textarea
                        id="event-description"
                        value={eventForm.description}
                        onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                        placeholder="Event description"
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsScheduleEventDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          setScheduledEvents([...scheduledEvents, { ...eventForm, id: Date.now() }]);
                          setIsScheduleEventDialogOpen(false);
                          setEventForm({ title: '', date: '', time: '', description: '', courseId: '' });
                        }}
                        disabled={!eventForm.title || !eventForm.date || !eventForm.time}
                      >
                        Schedule
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="h-20 flex-col" onClick={() => setIsIssueCertificateDialogOpen(true)}>
                <Award className="w-6 h-6 mb-2" />
                <span>Issue Certificate</span>
              </Button>
              {/* Issue Certificate Dialog */}
              <Dialog open={isIssueCertificateDialogOpen} onOpenChange={setIsIssueCertificateDialogOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Issue Certificate</DialogTitle>
                    <DialogDescription>
                      Select a course and enter student details to issue a certificate.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cert-student">Student Name or Email</Label>
                      <Input
                        id="cert-student"
                        value={certificateForm.student}
                        onChange={e => setCertificateForm({ ...certificateForm, student: e.target.value })}
                        placeholder="Enter student name or email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cert-course">Course</Label>
                      <select
                        id="cert-course"
                        className="w-full border rounded px-2 py-1"
                        value={certificateForm.courseId}
                        onChange={e => setCertificateForm({ ...certificateForm, courseId: e.target.value })}
                      >
                        <option value="">-- Select a course --</option>
                        {apiCourses.map(course => (
                          <option key={course.id} value={course.id}>{course.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cert-date">Date</Label>
                      <Input
                        id="cert-date"
                        type="date"
                        value={certificateForm.date}
                        onChange={e => setCertificateForm({ ...certificateForm, date: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsIssueCertificateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          setCertificates([...certificates, { ...certificateForm, id: Date.now() }]);
                          setIsIssueCertificateDialogOpen(false);
                          setCertificateForm({ student: '', courseId: '', date: '' });
                        }}
                        disabled={!certificateForm.student || !certificateForm.courseId || !certificateForm.date}
                      >
                        Issue
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>


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
