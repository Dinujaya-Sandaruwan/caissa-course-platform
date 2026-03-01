"use client";

import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Loader2,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";

interface CourseOption {
  _id: string;
  title: string;
  enrollmentCount: number;
}

interface Student {
  _id: string;
  name: string;
  phone: string;
  enrolledAt: string;
}

export default function CoachStudentsPage() {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState("");

  // Initial fetch — get courses list
  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/coach/students");
        if (res.ok) {
          const data = await res.json();
          setCourses(data.courses);
          if (data.courses.length > 0) {
            setSelectedCourse(data.courses[0]._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setError("Failed to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Fetch students when course changes
  useEffect(() => {
    if (!selectedCourse) return;
    async function fetchStudents() {
      setLoadingStudents(true);
      try {
        const res = await fetch(
          `/api/coach/students?courseId=${selectedCourse}`,
        );
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students);
        }
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoadingStudents(false);
      }
    }
    fetchStudents();
  }, [selectedCourse]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const selectedCourseData = courses.find((c) => c._id === selectedCourse);

  return (
    <div className="space-y-10 relative z-10">
      {/* Page Header */}
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-300 rounded-r-full" />
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-[family-name:var(--font-outfit)] tracking-tight leading-tight">
            My Students
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-0.5">
            View enrolled students across your courses
          </p>
        </div>
      </div>

      {/* No Published Courses */}
      {courses.length === 0 && (
        <div className="bg-white rounded-[2rem] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 text-center">
          <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            No published courses
          </h3>
          <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">
            Once you publish a course, enrolled students will appear here.
          </p>
        </div>
      )}

      {/* Course Selector + Students Table */}
      {courses.length > 0 && (
        <>
          {/* Course Selector */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5">
            <label className="text-sm font-bold text-gray-700 block mb-2">
              Select Course
            </label>
            <div className="relative">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="appearance-none w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 bg-gray-50/50 text-gray-900 text-base font-semibold transition-all focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 cursor-pointer pr-12"
              >
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title} ({course.enrollmentCount || 0} students)
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] ring-1 ring-gray-900/5 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedCourseData?.title}
              </h2>
              <span className="text-sm font-bold text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
                {loadingStudents ? "..." : students.length} student
                {students.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loadingStudents ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">
                  No students enrolled yet
                </p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="hidden sm:grid grid-cols-[auto_1fr_150px_120px] gap-3 px-6 py-3 bg-gray-50/80 border-b border-gray-100">
                  <span className="w-10 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    #
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Student Name
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    WhatsApp
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                    Enrolled
                  </span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-100">
                  {students.map((student, i) => (
                    <div
                      key={student._id}
                      className="grid grid-cols-1 sm:grid-cols-[auto_1fr_150px_120px] gap-3 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors"
                    >
                      <span className="hidden sm:block w-10 text-xs font-bold text-gray-400">
                        {i + 1}
                      </span>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {student.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        {student.phone || "—"}
                      </span>
                      <span className="text-xs text-gray-400 sm:text-right">
                        {student.enrolledAt
                          ? new Date(student.enrolledAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
