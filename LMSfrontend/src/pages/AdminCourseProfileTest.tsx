import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/client";

export default function AdminCourseProfileTest() {
  // Fetch a list of courses to provide links for testing
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-courses-test"],
    queryFn: async () => {
      try {
        const response = await api.get("/api/admin/courses/");
        console.log("Courses API response:", response);
        return response.data;
      } catch (err) {
        console.error("Error fetching courses:", err);
        throw err;
      }
    },
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Course Profile Test Page</h1>
        <p className="text-muted-foreground">
          This page helps test the AdminCourseProfile component
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Available Courses</h2>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-red-500">
              <p>Error loading courses</p>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          )}

          {data && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click on any course to view its profile:
              </p>

              <div className="grid gap-4">
                {Array.isArray(data.results ? data.results : data) ? (
                  (data.results ? data.results : data).map((course: any) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between border p-4 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {course.title} (ID: {course.id})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {course.status} · ${course.price}
                        </p>
                      </div>
                      <Link to={`/admin/courses/${course.id}`}>
                        <Button>View Profile</Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p>No courses found</p>
                )}
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800">Debugging Tips</h3>
                <ul className="list-disc list-inside text-sm text-yellow-700 mt-2">
                  <li>Check browser console for errors</li>
                  <li>Verify API response format matches component expectations</li>
                  <li>Ensure course IDs are valid</li>
                  <li>Check network tab for API call status</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
