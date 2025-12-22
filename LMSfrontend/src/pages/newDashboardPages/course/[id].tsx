// import React from 'react';
// import { useParams, useLocation } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import { Star, Video, Users } from 'lucide-react';

// import { coursesWithContent } from '@/lib/coursesData';
// import { initialStudents } from '../Students';

// const CoursePage = () => {

//   const { id } = useParams();
//   const location = useLocation();
//   // Prefer course from navigation state, fallback to static data
//   const course = location.state?.course || coursesWithContent.find(c => c.id.toString() === id);

//   if (!course) {
//     return <div className="p-8 text-center text-lg">Course not found.</div>;
//   }

//   // Find students enrolled in this course
//   const enrolledStudents = initialStudents.filter(student => student.courses.some(c => c.id === course.id));

//   return (
//     <div className="max-w-4xl mx-auto py-8 space-y-8">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center space-x-2">
//             <span>{course.title}</span>
//             <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>{course.status}</Badge>
//           </CardTitle>
//           <CardDescription>{course.description}</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
//             <div className="flex items-center"><Users className="w-4 h-4 mr-1" />{course.students} students</div>
//             <div className="flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />{course.rating}</div>
//             <div className="flex items-center"><Video className="w-4 h-4 mr-1" />{course.videos.length} videos</div>
//             <div>Instructor: <span className="font-medium text-foreground">{course.instructor}</span></div>
//           </div>
//           <div className="mt-2">
//             <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
//               <span>Progress</span>
//               <span>{course.progress}%</span>
//             </div>
//             <Progress value={course.progress} className="h-2" />
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Course Videos</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {course.videos.length === 0 && <div className="text-muted-foreground">No videos yet.</div>}
//           {course.videos.map(video => (
//             <div key={video.id} className="border rounded-lg p-4 space-y-2">
//               <div className="flex items-center justify-between">
//                 <div className="font-medium">{video.title}</div>
//                 <span className="text-xs text-muted-foreground">{video.duration}</span>
//               </div>
//               <div className="text-sm text-muted-foreground">{video.description}</div>
//               {video.url && (
//                 <video controls className="w-full max-w-lg mt-2">
//                   <source src={video.url} type="video/mp4" />
//                   Your browser does not support the video tag.
//                 </video>
//               )}
//             </div>
//           ))}
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Enrolled Students</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {enrolledStudents.length === 0 ? (
//             <div className="text-muted-foreground">No students enrolled yet.</div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {enrolledStudents.map(student => (
//                 <div key={student.id} className="flex items-center gap-4 p-2 border rounded-lg">
//                   <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
//                   <div>
//                     <div className="font-medium">{student.name}</div>
//                     <div className="text-xs text-muted-foreground">{student.email}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default CoursePage;
import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Video, Users } from 'lucide-react';
import { coursesWithContent } from '@/lib/coursesData';
import { adminGetCourseEnrolledStudents, adminGetCourseProfile } from '@/api/admin';
import { TextAvatar } from '@/components/TextAvatar';

const CoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [course, setCourse] = useState<any>(location.state?.course || null);
  const [loading, setLoading] = useState(!course);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalInstructors, setTotalInstructors] = useState(0);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const [enrollmentRes, profileRes] = await Promise.all([
          adminGetCourseEnrolledStudents(Number(id)),
          adminGetCourseProfile(Number(id))
        ]);

        if (profileRes.data) {
          setCourse(profileRes.data);
        }

        if (enrollmentRes.data) {
          setEnrolledStudents(Array.isArray(enrollmentRes.data.students) ? enrollmentRes.data.students : []);
          setInstructors(Array.isArray(enrollmentRes.data.instructors) ? enrollmentRes.data.instructors : []);
          setTotalStudents(Number(enrollmentRes.data.total_students) || 0);
          setTotalInstructors(Number(enrollmentRes.data.total_instructors) || 0);
        }
      } catch (error) {
        console.error('❌ Failed to fetch course data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourseData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading course...</div>;
  }

  if (!course) {
    return <div className="p-8 text-center text-lg">Course not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Course Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>{course.title}</span>
            <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
              {course.status}
            </Badge>
          </CardTitle>
          <CardDescription>{course.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {totalStudents} students
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
              {course.rating || 0}
            </div>
            <div className="flex items-center">
              <Video className="w-4 h-4 mr-1" />
              {Array.isArray(course.videos) ? course.videos.length : 0} videos
            </div>
            {course.instructor && (
              <div>
                Instructor:{' '}
                <span className="font-medium text-foreground">
                  {course.instructor}
                </span>
              </div>
            )}
          </div>

          {course.progress !== undefined && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Videos */}
      <Card>
        <CardHeader>
          <CardTitle>Course Videos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!Array.isArray(course.videos) || course.videos.length === 0 ? (
            <div className="text-muted-foreground">No videos yet.</div>
          ) : (
            course.videos.map((video, index) => (
              <div
                key={video.id || `${video.title}-${index}`}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{video.title}</div>
                  <span className="text-xs text-muted-foreground">
                    {video.duration || '—'}
                  </span>
                </div>
                {video.description && (
                  <div className="text-sm text-muted-foreground">
                    {video.description}
                  </div>
                )}
                {video.url && (
                  <video
                    controls
                    className="w-full max-w-lg mt-2 rounded-md border"
                  >
                    <source src={video.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Enrolled Students & Instructors */}
      <Card>
        <CardHeader>
          <CardTitle>Course Participants</CardTitle>
          <CardDescription>
            {totalStudents} Students •
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Students */}
          {Array.isArray(enrolledStudents) && enrolledStudents.length > 0 && (
            <>
              <h4 className="font-semibold text-foreground mb-2">Students</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrolledStudents.map((student, index) => (
                  <div
                    key={student.id || `student-${index}`}
                    className="flex items-center gap-4 p-2 border rounded-lg"
                  >
                    <TextAvatar name={student.name || 'Unknown'} />
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Instructors */}
          {Array.isArray(instructors) && instructors.length > 0 && (
            <>
              {/* <h4 className="font-semibold text-foreground mb-2 mt-6">Instructors</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instructors.map((instructor, index) => (
                  <div
                    key={instructor.id || `instructor-${index}`}
                    className="flex items-center gap-4 p-2 border rounded-lg"
                  >
                    <TextAvatar name={instructor.name || 'Unknown'} />
                    <div>
                      <div className="font-medium">{instructor.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {instructor.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div> */}
            </>
          )}

          {/* Fallback */}
          {enrolledStudents.length === 0 && instructors.length === 0 && (
            <div className="text-muted-foreground">No participants yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoursePage;
