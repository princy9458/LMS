'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function CreateCertificatePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateUrl: '',
    courseId: ''
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        const data = await res.json();
        if (data.success) {
          setCourses(data.data || []);
          if (!formData.courseId && data.data?.length) {
            setFormData((prev) => ({ ...prev, courseId: data.data[0]._id }));
          }
        }
      } catch (error) {
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [formData.courseId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.name || !formData.courseId) {
      toast.error('Certificate name and course are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create certificate');

      toast.success('Certificate created');
      setFormData((prev) => ({
        ...prev,
        name: '',
        description: '',
        templateUrl: ''
      }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to create certificate');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Add New Certificate</h1>
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
              className="mt-1 w-full border border-zinc-300 rounded-md px-3 py-2 text-sm"
              disabled={loading}
            >
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
              {courses.length === 0 && <option value="">No courses found</option>}
            </select>
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
            disabled={submitting}
            className="bg-[#2271b1] hover:bg-[#135e96] text-white text-sm font-medium px-4 py-2 rounded-md flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Certificate
          </button>
        </form>
      </div>
    </div>
  );
}
