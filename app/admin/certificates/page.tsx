'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const PAGE_SIZE = 20;

type Course = {
  _id: string;
  title: string;
};

type Certificate = {
  _id: string;
  name: string;
  description?: string;
  templateUrl?: string;
  courseId?: string;
  createdAt?: string;
};

export default function CertificatesPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const certificateRef = useRef<HTMLDivElement | null>(null);
  const [certificateData, setCertificateData] = useState({
    studentName: '',
    courseName: '',
    date: ''
  });
  const activeLocale = 'en';

  const getDisplayTitle = (title: any) => {
    if (typeof title === 'string') return title;
    if (title && typeof title === 'object') return title[activeLocale] || title.en || Object.values(title)[0] || '';
    return '';
  };

  const courseMap = useMemo(() => {
    const map: Record<string, string> = {};
    courses.forEach((course) => {
      map[course._id] = getDisplayTitle(course.title);
    });
    return map;
  }, [courses]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [certsRes, coursesRes] = await Promise.all([
          fetch('/api/certificates'),
          fetch('/api/courses')
        ]);

        const certsData = await certsRes.json();
        const coursesData = await coursesRes.json();

        if (certsData.success) {
          setCertificates(certsData.data || []);
        }
        if (coursesData.success) {
          setCourses(coursesData.data || []);
        }
      } catch (error) {
        toast.error('Failed to load certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCertificates = certificates.filter((certificate) => {
    const titleMatch = certificate.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const courseMatch = (courseMap[certificate.courseId || ''] || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSearch = !searchQuery || titleMatch || courseMatch;

    let matchesDate = true;
    if (dateFilter === 'last7') {
      const date = new Date(certificate.createdAt || Date.now());
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      matchesDate = date >= cutoff;
    }
    if (dateFilter === 'last30') {
      const date = new Date(certificate.createdAt || Date.now());
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      matchesDate = date >= cutoff;
    }

    return matchesSearch && matchesDate;
  });

  const totalItems = filteredCertificates.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedCertificates = filteredCertificates.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (page !== currentPage) {
      setPage(currentPage);
    }
  }, [currentPage, page]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pagedCertificates.map((cert) => cert._id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDelete = async (certificateId: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/certificates/${certificateId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete certificate');
      setCertificates((prev) => prev.filter((cert) => cert._id !== certificateId));
      toast.success('Certificate deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete certificate');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkApply = async () => {
    if (!bulkAction || selectedIds.length === 0) return;

    if (bulkAction === 'edit') {
      if (selectedIds.length !== 1) {
        toast.error('Select a single certificate to edit');
        return;
      }
      router.push(`/admin/certificates/${selectedIds[0]}/edit`);
      return;
    }

    if (bulkAction === 'trash') {
      if (!confirm('Move selected certificates to trash?')) return;
      setIsDeleting(true);
      try {
        await Promise.all(selectedIds.map((id) => fetch(`/api/certificates/${id}`, { method: 'DELETE' })));
        setCertificates((prev) => prev.filter((cert) => !selectedIds.includes(cert._id)));
        setSelectedIds([]);
        toast.success('Selected certificates deleted');
      } catch (error) {
        toast.error('Failed to delete selected certificates');
      } finally {
        setIsDeleting(false);
        setBulkAction('');
      }
    }
  };

  const generateCertificatePDF = async (studentName: string, courseName: string) => {
    const dateText = new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    setCertificateData({
      studentName,
      courseName,
      date: dateText
    });

    await new Promise((resolve) => setTimeout(resolve, 50));

    if (!certificateRef.current) {
      throw new Error('Certificate template not ready');
    }

    const canvas = await html2canvas(certificateRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save('certificate.pdf');
  };

  const handleDownload = async (certificate: Certificate) => {
    const courseName = courseMap[certificate.courseId || ''] || 'Course';
    const studentName = window
      .prompt('Enter student name for the certificate', 'Student Name')
      ?.trim();

    if (!studentName) {
      toast.error('Student name is required to download');
      return;
    }

    try {
      setDownloadingId(certificate._id);
      await generateCertificatePDF(studentName, courseName);
      toast.success('Certificate downloaded');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate certificate');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Certificates</h1>
        </div>
        <Link
          href="/admin/certificates/create"
          className="bg-[#2271b1] hover:bg-[#135e96] text-white font-medium px-4 py-2 rounded-md transition text-sm"
        >
          + Add New Certificate
        </Link>
      </div>

      <div className="border-b border-zinc-200">
        <nav className="flex gap-6 text-sm font-medium text-zinc-600">
          <span className="border-b-2 border-[#2271b1] text-[#2271b1] pb-2">Certificates</span>
          <Link href="/admin/certificates/settings" className="pb-2 hover:text-zinc-900">Settings</Link>
          <Link href="/admin/certificates/shortcodes" className="pb-2 hover:text-zinc-900">Shortcodes</Link>
          <Link href="/admin/certificates/fonts" className="pb-2 hover:text-zinc-900">Fonts</Link>
        </nav>
      </div>

      <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
        <div className="p-3 border-b border-zinc-200 flex flex-wrap items-center gap-2">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="">Bulk actions</option>
            <option value="edit">Edit</option>
            <option value="trash">Move to Trash</option>
          </select>
          <button
            type="button"
            onClick={handleBulkApply}
            className="border border-zinc-300 rounded-md px-3 py-1 text-sm"
            disabled={isDeleting}
          >
            Apply
          </button>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-zinc-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="all">All dates</option>
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
          </select>

          <button
            type="button"
            onClick={() => setDateFilter('all')}
            className="border border-zinc-300 rounded-md px-3 py-1 text-sm"
          >
            Reset
          </button>
          <button type="button" className="border border-zinc-300 rounded-md px-3 py-1 text-sm">
            Filter
          </button>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Certificates"
                className="border border-zinc-300 rounded-md pl-8 pr-3 py-1 text-sm"
              />
            </div>
            <button className="border border-zinc-300 rounded-md px-3 py-1 text-sm">Search Certificates</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === pagedCertificates.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Used in</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : pagedCertificates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    No certificates found.
                  </td>
                </tr>
              ) : (
                pagedCertificates.map((cert) => {
                  const courseTitle = courseMap[cert.courseId || ''] || '-';
                  return (
                    <tr key={cert._id} className="group hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(cert._id)}
                          onChange={() => toggleSelect(cert._id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-blue-600">
                          <Link href={`/admin/certificates/${cert._id}/edit`} className="hover:underline">
                            {cert.name}
                          </Link>
                        </div>
                        <div className="text-xs text-zinc-500 mt-1 opacity-0 group-hover:opacity-100 transition">
                          <Link href={`/admin/certificates/${cert._id}/edit`} className="hover:underline">
                            Edit
                          </Link>
                          <span className="mx-1">|</span>
                          <Link href={`/admin/certificates/${cert._id}/edit`} className="hover:underline">
                            Quick Edit
                          </Link>
                          <span className="mx-1">|</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(cert._id)}
                            className="text-red-600 hover:underline"
                          >
                            Trash
                          </button>
                          <span className="mx-1">|</span>
                          <Link href={`/admin/certificates/${cert._id}/edit`} className="hover:underline">
                            View
                          </Link>
                          <span className="mx-1">|</span>
                          <button
                            type="button"
                            onClick={() => handleDownload(cert)}
                            className="hover:underline text-[#2271b1]"
                            disabled={downloadingId === cert._id}
                          >
                            {downloadingId === cert._id ? 'Downloading...' : 'Download'}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-zinc-500">Courses: {cert.courseId ? 1 : 0}</div>
                        <div className="text-xs text-zinc-500">Quizzes: 0</div>
                        <div className="text-xs text-blue-600">{courseTitle}</div>
                      </td>
                      <td className="px-4 py-3">Admin</td>
                      <td className="px-4 py-3">
                        {cert.createdAt
                          ? new Date(cert.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '-'}
                      </td>
                      <td className="px-4 py-3">Builder</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-zinc-200 flex items-center justify-end gap-3 text-sm text-zinc-600">
          <span>{totalItems} items</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              className="border border-zinc-300 rounded px-2 py-1 disabled:opacity-50"
            >
              &lt;&lt;
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border border-zinc-300 rounded px-2 py-1 disabled:opacity-50"
            >
              &lt;
            </button>
            <span className="px-2">{currentPage}</span>
            <span className="text-zinc-500">of {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border border-zinc-300 rounded px-2 py-1 disabled:opacity-50"
            >
              &gt;
            </button>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={currentPage === totalPages}
              className="border border-zinc-300 rounded px-2 py-1 disabled:opacity-50"
            >
              &gt;&gt;
            </button>
          </div>
        </div>
      </div>

      <div className="fixed -left-[9999px] top-0">
        <div
          ref={certificateRef}
          className="w-[1123px] h-[794px] bg-white border border-zinc-200 rounded-3xl p-12 flex flex-col justify-between text-center"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Certificate</p>
            <h2 className="text-4xl font-bold text-zinc-900 mt-3">Certificate of Completion</h2>
          </div>

          <div className="space-y-6">
            <p className="text-base text-zinc-500">This certifies that</p>
            <p className="text-3xl font-bold text-zinc-900">{certificateData.studentName}</p>
            <p className="text-base text-zinc-500">has successfully completed</p>
            <p className="text-2xl font-semibold text-zinc-800">{certificateData.courseName}</p>
            <p className="text-sm text-zinc-400 italic">
              "This certifies that {certificateData.studentName} has successfully completed {certificateData.courseName}"
            </p>
          </div>

          <div className="flex items-center justify-between text-sm text-zinc-500">
            <div className="text-left">
              <p className="text-xs uppercase tracking-widest text-zinc-400">Date</p>
              <p className="font-semibold text-zinc-700 mt-2">{certificateData.date}</p>
            </div>
            <div className="text-center">
              <div className="w-56 h-px bg-zinc-300 mx-auto mb-2" />
              <p className="text-xs uppercase tracking-widest text-zinc-400">Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
