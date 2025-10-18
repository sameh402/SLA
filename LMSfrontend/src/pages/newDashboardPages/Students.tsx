import React, { useState ,useEffect } from 'react';
import { CourseWithVideos, coursesWithContent } from '@/lib/coursesData';
import { getCourseCategoryPopularity } from "@/api/admin";

// Legacy interface for backward compatibility with course pages
interface LegacyStudent {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: 'active' | 'inactive' | 'pending';
  courses: CourseWithVideos[];
  totalCourses: number;
  completedCourses: number;
  country: string;
  
}

// Legacy student data for backward compatibility
export const initialStudents: LegacyStudent[] = [
  {
    id: 1,
    name: "Emma Davis",
    email: "emma.davis@example.com",
    phone: "+1-555-0101",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    status: "active",
    courses: [coursesWithContent[0], coursesWithContent[1]],
    totalCourses: 2,
    completedCourses: 1,
    country: "USA"
  },
  {
    id: 2,
    name: "Ahmed Hassan",
    email: "ahmed.hassan@example.com",
    phone: "+20-100-123-4567",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    status: "active",
    courses: [coursesWithContent[2]],
    totalCourses: 1,
    completedCourses: 0,
    country: "Egypt"
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    email: "maria.rodriguez@example.com",
    phone: "+34-600-123-456",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    status: "active",
    courses: [coursesWithContent[1]],
    totalCourses: 1,
    completedCourses: 1,
    country: "Spain"
  },
  {
    id: 4,
    name: "Liu Wei",
    email: "liu.wei@example.com",
    phone: "+86-138-0013-8000",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    status: "active",
    courses: [coursesWithContent[0], coursesWithContent[2]],
    totalCourses: 2,
    completedCourses: 1,
    country: "China"
  }
];
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
  Search,
  Users,
  Globe,
  BookOpen,
  TrendingUp,
  Eye,
  MessageCircle,
  Award,
  Send,
  X
} from 'lucide-react';
// import { getAllUsersFromDjango } from '@shared/api';
import { adminListUsers, AdminUser , countrydistribution } from '@/api/admin';
import { useUserProfile } from '@/hooks/useUserProfile';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
 courseCategories: string[]; // 👈 all enrolled categories
  numberOfCoursesEnrolled: number;
  coursesEnrolled: string[];
  aftersaleRecommendationCourse: string;
  recommendationSent?: boolean;
}

// const categories = ["Programming", "Data Science", "AI/ML", "Design", "Business", "Marketing"];
const categories = ["General", "Programming","Language","Graphic","Medical"];


// Sample comprehensive student data
const studentsData: Student[] = [
  {
    id: 1,
    name: "Emma Davis",
    email: "emma.davis@example.com",
    phone: "+1-555-0101",
    country: "USA",
    state: "California",
    courseCategory: "Programming",
    numberOfCoursesEnrolled: 3,
    coursesEnrolled: ["React Development", "JavaScript Fundamentals", "UI/UX Design"],
    aftersaleRecommendationCourse: "Advanced React Patterns",
    recommendationSent: false
  },
  {
    id: 2,
    name: "Ahmed Hassan",
    email: "ahmed.hassan@example.com",
    phone: "+20-100-123-4567",
    country: "Egypt",
    state: "Cairo",
    courseCategory: "Data Science",
    numberOfCoursesEnrolled: 2,
    coursesEnrolled: ["Python for Data Science", "Machine Learning Basics"],
    aftersaleRecommendationCourse: "Deep Learning Fundamentals",
    recommendationSent: true
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    email: "maria.rodriguez@example.com",
    phone: "+34-600-123-456",
    country: "Spain",
    state: "Madrid",
    courseCategory: "Marketing",
    numberOfCoursesEnrolled: 1,
    coursesEnrolled: ["Digital Marketing"],
    aftersaleRecommendationCourse: "Social Media Strategy",
    recommendationSent: false
  },
  {
    id: 4,
    name: "Liu Wei",
    email: "liu.wei@example.com",
    phone: "+86-138-0013-8000",
    country: "China",
    state: "Beijing",
    courseCategory: "AI/ML",
    numberOfCoursesEnrolled: 4,
    coursesEnrolled: ["AI/ML Fundamentals", "Python Programming", "Data Visualization", "Statistics"],
    aftersaleRecommendationCourse: "Computer Vision",
    recommendationSent: true
  },
  {
    id: 5,
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1-555-0102",
    country: "USA",
    state: "New York",
    courseCategory: "Business",
    numberOfCoursesEnrolled: 2,
    coursesEnrolled: ["Business Analytics", "Project Management"],
    aftersaleRecommendationCourse: "Leadership Skills",
    recommendationSent: false
  },
  {
    id: 6,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+44-7700-900123",
    country: "UK",
    state: "London",
    courseCategory: "Design",
    numberOfCoursesEnrolled: 3,
    coursesEnrolled: ["Web Design", "Graphic Design", "Photography"],
    aftersaleRecommendationCourse: "Brand Identity Design",
    recommendationSent: true
  },
  {
    id: 7,
    name: "Raj Patel",
    email: "raj.patel@example.com",
    phone: "+91-98765-43210",
    country: "India",
    state: "Mumbai",
    courseCategory: "Programming",
    numberOfCoursesEnrolled: 5,
    coursesEnrolled: ["Full Stack Development", "Node.js", "React", "MongoDB", "AWS"],
    aftersaleRecommendationCourse: "DevOps Fundamentals",
    recommendationSent: false
  },
  {
    id: 8,
    name: "Ana Silva",
    email: "ana.silva@example.com",
    phone: "+55-11-99999-8888",
    country: "Brazil",
    state: "São Paulo",
    courseCategory: "Marketing",
    numberOfCoursesEnrolled: 1,
    coursesEnrolled: ["Digital Marketing"],
    aftersaleRecommendationCourse: "E-commerce Strategy",
    recommendationSent: true
  },
  {
    id: 9,
    name: "Mohammed Al-Rashid",
    email: "mohammed.rashid@example.com",
    phone: "+966-50-123-4567",
    country: "Saudi Arabia",
    state: "Riyadh",
    courseCategory: "Programming",
    numberOfCoursesEnrolled: 2,
    coursesEnrolled: ["Cybersecurity Basics", "Network Administration"],
    aftersaleRecommendationCourse: "Ethical Hacking",
    recommendationSent: false
  },
  {
    id: 10,
    name: "Sophie Martin",
    email: "sophie.martin@example.com",
    phone: "+33-6-12-34-56-78",
    country: "France",
    state: "Paris",
    courseCategory: "Data Science",
    numberOfCoursesEnrolled: 3,
    coursesEnrolled: ["Data Science", "Python", "Statistics"],
    aftersaleRecommendationCourse: "Machine Learning",
    recommendationSent: true
  }
];

// Chart data for analytics - Map style visualization
const countryDistribution = [
  { name: 'USA', value: 2, students: 2, flag: '🇺🇸' },
  { name: 'Egypt', value: 1, students: 1, flag: '🇪🇬' },
  { name: 'Spain', value: 1, students: 1, flag: '🇪🇸' },
  { name: 'China', value: 1, students: 1, flag: '🇨🇳' },
  { name: 'UK', value: 1, students: 1, flag: '🇬🇧' },
  { name: 'India', value: 1, students: 1, flag: '🇮🇳' },
  { name: 'Brazil', value: 1, students: 1, flag: '🇧🇷' },
  { name: 'Saudi Arabia', value: 1, students: 1, flag: '🇸🇦' },
  { name: 'France', value: 1, students: 1, flag: '🇫🇷' }
];

const enrollmentTrends = {
  2022: {
    quarter: [
      { period: 'Q1', students: 120 },
      { period: 'Q2', students: 145 },
      { period: 'Q3', students: 167 },
      { period: 'Q4', students: 189 }
    ],
    month: [
      { period: 'Jan', students: 35 },
      { period: 'Feb', students: 42 },
      { period: 'Mar', students: 43 },
      { period: 'Apr', students: 48 },
      { period: 'May', students: 49 },
      { period: 'Jun', students: 48 },
      { period: 'Jul', students: 52 },
      { period: 'Aug', students: 55 },
      { period: 'Sep', students: 60 },
      { period: 'Oct', students: 58 },
      { period: 'Nov', students: 65 },
      { period: 'Dec', students: 66 }
    ]
  },
  2023: {
    quarter: [
      { period: 'Q1', students: 195 },
      { period: 'Q2', students: 225 },
      { period: 'Q3', students: 267 },
      { period: 'Q4', students: 289 }
    ],
    month: [
      { period: 'Jan', students: 62 },
      { period: 'Feb', students: 65 },
      { period: 'Mar', students: 68 },
      { period: 'Apr', students: 72 },
      { period: 'May', students: 75 },
      { period: 'Jun', students: 78 },
      { period: 'Jul', students: 82 },
      { period: 'Aug', students: 88 },
      { period: 'Sep', students: 97 },
      { period: 'Oct', students: 92 },
      { period: 'Nov', students: 98 },
      { period: 'Dec', students: 99 }
    ]
  },
  2024: {
    quarter: [
      { period: 'Q1', students: 310 },
      { period: 'Q2', students: 345 },
      { period: 'Q3', students: 378 },
      { period: 'Q4', students: 395 }
    ],
    month: [
      { period: 'Jan', students: 95 },
      { period: 'Feb', students: 102 },
      { period: 'Mar', students: 113 },
      { period: 'Apr', students: 111 },
      { period: 'May', students: 115 },
      { period: 'Jun', students: 119 },
      { period: 'Jul', students: 122 },
      { period: 'Aug', students: 125 },
      { period: 'Sep', students: 131 },
      { period: 'Oct', students: 128 },
      { period: 'Nov', students: 133 },
      { period: 'Dec', students: 134 }
    ]
  }
};

const availableYears = [2022, 2023, 2024];

const courseEnrollmentData = [
  { category: 'Programming', count: 15 },
  { category: 'Data Science', count: 8 },
  { category: 'AI/ML', count: 6 },
  { category: 'Design', count: 5 },
  { category: 'Business', count: 4 },
  { category: 'Marketing', count: 3 }
];

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [enrollmentYear, setEnrollmentYear] = useState(2024);
  const [enrollmentPeriod, setEnrollmentPeriod] = useState<'quarter' | 'month'>('month');
  const [data, setData] = useState<{ category: string; count: number }[]>([]);
  const [countryDistribution, setCountryDistribution] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const { userProfile, loading  } = useUserProfile();



  useEffect(() => {
    const fetchPopularity = async () => {
      try {
        const response = await getCourseCategoryPopularity();
        setData(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch course category popularity:", error);
      } finally {
        (false);
      }
    };
    fetchPopularity();
  }, []);


  // student distribution
  
  useEffect(() => {
    fetchCountryDistribution();
  }, []);

  const fetchCountryDistribution = async () => {
    try {
      const res = await countrydistribution();
      const data = res.data;
      setCountryDistribution(data);
      const total = data.reduce((sum: number, item: any) => sum + item.count, 0);
      setTotalStudents(total);
    } catch (error) {
      console.error("Error fetching country distribution:", error);
    }
  };

  // Get unique countries for filter
  const countries = Array.from(new Set(students.map(s => s.country))).sort();

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
const matchesCategory =
    categoryFilter === "all" ||
    (student.courseCategories &&
      student.courseCategories.some(
        (cat) => cat.toLowerCase() === categoryFilter.toLowerCase()
      ));

    const matchesCountry = countryFilter === "all" || student.country === countryFilter;
    
    return matchesSearch && matchesCategory && matchesCountry;
  });

  const TotalStudents = students.length;
  // const topCountry =
  // countries.length > 0
  //   ? countries.reduce((a, b) =>
  //       students.filter(s => s.country === a).length > students.filter(s => s.country === b).length ? a : b
  //     )
  //   : "N/A";

  const toggleRecommendation = (studentId: number) => {
    setStudents(prev => prev.map(student =>
      student.id === studentId
        ? { ...student, recommendationSent: !student.recommendationSent }
        : student
    ));
  };

  React.useEffect(() => {
  async function fetchStudents() {
      try {
        const res = await adminListUsers();
        const users: AdminUser[] = res.data?.results ?? [];
        const studentsOnly = users.filter((u) => u.role === 'student');
        // const mappedStudents: Student[] = studentsOnly.map((user) => ({
        //   id: user.id,
        //   name: `${(user.first_name || '').trim()} ${(user.last_name || '').trim()}`.trim() || user.username,
        //   email: (user.email || '').trim() || user.username,
        //   whatsappNumber: user.phone || '',
        //   country: user.country || 'N/A',
        //   state: '',
        //   courseCategory: primaryCategory, // 🧭 first course category
        //   numberOfCoursesEnrolled: courses.length, // 🧮 count of enrolled courses
        //   coursesEnrolled: courseTitles, // 🎓 list of enrolled course titles
        //   aftersaleRecommendationCourse: '',
        //   recommendationSent: false,
        // }));
        const mappedStudents: Student[] = studentsOnly.map((user) => {
        const courses = user.courses_enrolled || [];
        const courseTitles = courses.map((c: any) => c.title);
        const nextRecommendations = courses.map((c: any) => c.next_recommendation || "N/A");
         const allCategories = Array.from(
          new Set(courses.map((c: any) => c.category).filter(Boolean))
        );

        return {
          id: user.id,
          name:
            `${(user.first_name || "").trim()} ${(user.last_name || "").trim()}`.trim() ||
            user.username,
          email: (user.email || "").trim() || user.username,
          whatsappNumber: user.phone || "",
          country: user.country || "N/A",
          state: "",
         courseCategories: allCategories, // ✅ store all enrolled categories
          numberOfCoursesEnrolled: courses.length,
          coursesEnrolled: courseTitles,
          aftersaleRecommendationCourse: "",
          recommendationSent: false,
          nextCourseRecommendations: nextRecommendations, // ✅ rename and store array
        };
      });

        setStudents(mappedStudents);
      } catch (e) {
        console.error('Failed to load users', e);
        setStudents([]);
      }
  }
  fetchStudents();
}, []);




// top conuntry
const countryCount = students.reduce((acc, student) => {
    const country = student.country || "Unknown";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  // Find the top country
  const topCountry = Object.entries(countryCount).sort((a, b) => b[1] - a[1])[0];
  console.log("top Country:" , topCountry)
  const [countryName, count] = topCountry || ["Unknown", 0];






const isAdmin = userProfile?.role === 'admin';
console.log("userProfile",userProfile)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive student analytics and management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            {TotalStudents} Total Students
          </Badge>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{TotalStudents}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Country</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topCountry}</div>
            <p className="text-xs text-muted-foreground">{students.filter(s => s.country === topCountry).length} students</p>
          </CardContent>
        </Card> */}
         <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Top Country</CardTitle>
        <Globe className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-center gap-2">
          {/* <span>{getCountryFlag(countryName)}</span> */}
          <span>{countryName}</span>
        </div>
        <p className="text-xs text-muted-foreground">{count} students</p>
      </CardContent>
    </Card>

        <TooltipProvider>
          <UITooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Countries</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{countries.length}</div>
                  <p className="text-xs text-muted-foreground">Global reach</p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-semibold mb-2">Countries with Students:</p>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  {countries.map((country, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <span>{countryDistribution.find(c => c.name === country)?.flag}</span>
                      <span>{country}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TooltipContent>
          </UITooltip>
        </TooltipProvider>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card>
      <CardHeader>
        <CardTitle>Course Category Popularity</CardTitle>
        <CardDescription>Number of enrollments by category</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-10">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No data available</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="category" className="text-muted-foreground" fontSize={12} />
                <YAxis className="text-muted-foreground" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>

        {/* Enrollment Trends */}
        {/* <Card className="lg:col-span-2 opacity-20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Enrollment Trends</CardTitle>
                <CardDescription>Track enrollment performance over time</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={enrollmentYear.toString()} onValueChange={(value) => setEnrollmentYear(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={enrollmentPeriod} onValueChange={(value: 'quarter' | 'month') => setEnrollmentPeriod(value)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={enrollmentTrends[enrollmentYear]?.[enrollmentPeriod] || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="period"
                    className="text-muted-foreground"
                    fontSize={12}
                  />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => [value.toLocaleString(), 'Students']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card> */}

        {/* Country Distribution Map */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Student Distribution</CardTitle>
            <CardDescription>Global student map</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 overflow-y-auto">
              <div className="space-y-3">
                {countryDistribution.map((country, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <p className="font-medium">{country.name}</p>
                        <p className="text-sm text-muted-foreground">{country.students} student{country.students !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(country.students / Math.max(...countryDistribution.map(c => c.students))) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 block">{((country.students / totalStudents) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card> */}
        <Card>
      <CardHeader>
        <CardTitle>Student Distribution</CardTitle>
        <CardDescription>Global student map</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-80 overflow-y-auto">
          <div className="space-y-3">
            {countryDistribution.map((country, index) => {
              const maxCount = Math.max(...countryDistribution.map(c => c.count));
              const percentage = ((country.count / totalStudents) * 100).toFixed(1);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{country.country}</p>
                    <p className="text-sm text-muted-foreground">
                      {country.count} student{country.count !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${(country.count / maxCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
      </div>

      {/* Course Category Analytics */}
     
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Course Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students Data</CardTitle>
          <CardDescription>
            Showing {filteredStudents.length} of {totalStudents} students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Course Category</TableHead>
                  <TableHead className="text-center">Courses Count</TableHead>
                  <TableHead>Enrolled Courses</TableHead>
                  <TableHead>Courses Recomendation</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-muted-foreground">{student.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-green-600" />
                        <span className="text-sm">{student.whatsappNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-muted-foreground" />
                        <span>{student.country}</span>
                      </div>
                    </TableCell>
                   <TableCell>
  <div className="flex flex-wrap gap-1">
    {student.courseCategories.map((cat, idx) => (
      <Badge key={idx} variant="outline" className="text-xs">
        {cat}
      </Badge>
    ))}
  </div>
</TableCell>

                    <TableCell className="text-center">
                      <Badge variant="secondary">{student.numberOfCoursesEnrolled}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {student.coursesEnrolled.map((course, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                                  <TableCell>
                  <div className="space-y-1">
                    {student.nextCourseRecommendations && student.nextCourseRecommendations.length > 0 ? (
                      student.nextCourseRecommendations.map((rec, index) => (
                        <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                          {rec}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        N/A
                      </Badge>
                    )}
                  </div>
</TableCell>

                   
                    <TableCell className="text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={student.recommendationSent ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleRecommendation(student.id)}
                          className={student.recommendationSent ? "text-muted-foreground" : ""}
                        >
                          {student.recommendationSent ? (
                            <><X className="w-3 h-3 mr-1" />No</>
                          ) : (
                            <><Send className="w-3 h-3 mr-1" />Yes</>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No students found</h3>
              <p className="text-muted-foreground">Try adjusting your search filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




