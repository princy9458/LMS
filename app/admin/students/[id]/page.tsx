'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User, Mail, BookOpen, Award, ArrowLeft, Loader2, Briefcase, GraduationCap, Calendar, MapPin, Building } from 'lucide-react';
import Link from 'next/link';

export default function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/lms/students/${id}`);
        const data = await res.json();
        if (data.success) {
          setStudent(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch student:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-zinc-500 font-medium">Student profile not found.</p>
        <Link href="/admin/students" className="text-indigo-600 hover:underline">Back to Students</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/students" className="p-2 hover:bg-zinc-100 rounded-full transition text-zinc-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold">
               {student.name?.substring(0, 1).toUpperCase()}
             </div>
             <div>
               <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{student.name}</h1>
               <p className="text-zinc-500 text-sm flex items-center gap-1.5">
                 <Mail className="w-3.5 h-3.5" /> {student.email}
               </p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition">
             Reset Password
           </button>
           <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition">
             Edit Profile
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Overview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-zinc-900 text-sm">Learning Overview</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div className="text-indigo-600 mb-1"><BookOpen className="w-4 h-4" /></div>
                  <div className="text-lg font-bold text-zinc-900">{student.enrolledCourses?.length || 0}</div>
                  <div className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">Courses</div>
               </div>
               <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-emerald-600 mb-1"><Award className="w-4 h-4" /></div>
                  <div className="text-lg font-bold text-zinc-900">{student.certificates?.length || 0}</div>
                  <div className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Awards</div>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-sm">
             <h3 className="font-bold text-zinc-900 text-sm">Skills & Interests</h3>
             <div className="flex flex-wrap gap-2">
                {(student.skills || ['Full-stack', 'UX/UI', 'Typescript']).map((skill: string) => (
                  <span key={skill} className="px-3 py-1 bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs rounded-full font-medium">
                    {skill}
                  </span>
                ))}
             </div>
          </div>
        </div>

        {/* Middle/Right Column - Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active enrollments */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <h3 className="font-bold text-zinc-900 text-sm">Current Enrollments</h3>
                <span className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">View All</span>
             </div>
             <div className="divide-y divide-zinc-100">
               {(student.enrolledCourses || []).length > 0 ? (
                 (student.enrolledCourses || []).map((course: any) => (
                   <div key={course._id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center text-indigo-600">
                            <BookOpen className="w-5 h-5" />
                         </div>
                         <div>
                            <div className="text-sm font-semibold text-zinc-900">{course.title || 'Untitled Course'}</div>
                            <div className="text-xs text-zinc-500">Progress: {course.progress || 0}%</div>
                         </div>
                      </div>
                      <div className="text-xs font-bold text-zinc-400">Enrolled Oct 2023</div>
                   </div>
                 ))
               ) : (
                 <div className="p-8 text-center text-zinc-400 text-sm italic">No active course enrollments.</div>
               )}
             </div>
          </div>

          {/* Career Activity */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-500" /> Career Activity
                </h3>
             </div>
             <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                   <Briefcase className="w-6 h-6 text-zinc-300" />
                </div>
                <div className="text-sm text-zinc-500">No recent job or internship applications.</div>
                <button className="text-xs font-bold text-indigo-600 hover:underline">Support Application Setup</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
