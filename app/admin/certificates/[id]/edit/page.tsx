'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function EditCertificatePage() {
  const params = useParams();
  const router = useRouter();
  const certificateId = params?.id as string | undefined;
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateUrl: '',
    courseId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      console.log('Resolving certificate data for ID:', certificateId);
      if (!certificateId) {
        console.warn('Certificate ID is missing from params');
        return;
      }
      try {
        const [certRes, courseRes] = await Promise.all([
          fetch(`/api/certificates/${certificateId}`),
          fetch('/api/courses')
        ]);

        const certData = await certRes.json();
        const courseData = await courseRes.json();

        if (!certRes.ok || !certData.success) {
          throw new Error(certData.error || 'Certificate not found');
        }

        if (courseData.success) {
          setCourses(courseData.data || []);
        }

        setFormData({
          name: certData.data?.name || '',
          description: certData.data?.description || '',
          templateUrl: certData.data?.templateUrl || '',
          courseId: certData.data?.courseId || ''
        });
      } catch (error: any) {
        toast.error(error.message || 'Failed to load certificate');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [certificateId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!certificateId) return;

    if (!formData.name || !formData.courseId) {
      toast.error('Certificate name and course are required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/certificates/${certificateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update certificate');
      }
      toast.success('Certificate updated');
      router.push('/admin/certificates');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update certificate');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Edit Certificate</h1>
        </div>
        <Link href="/admin/certificates" className="text-sm text-zinc-500 hover:text-zinc-900">
          &larr; Back to Certificates
        </Link>
      </div>

      <div className="bg-white border border-zinc-200 rounded-md p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700">Certificate Name</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">Course</label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData((prev) => ({ ...prev, courseId: e.target.value }))}
              className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
              {courses.length === 0 && !loading && <option value="" disabled>No courses found. Please create a course first.</option>}
            </select>
            {courses.length === 0 && !loading && (
              <p className="mt-1 text-xs text-amber-600 italic">
                Tip: You must have at least one course to assign a certificate.
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">Template URL (optional)</label>
            <input
              value={formData.templateUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, templateUrl: e.target.value }))}
              className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#2271b1] hover:bg-[#135e96] text-white text-sm font-medium px-4 py-2 rounded-md flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Update Certificate
          </button>
        </form>
      </div>
    </div>
  );
}
