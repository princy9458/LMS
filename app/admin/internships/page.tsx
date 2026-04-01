'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Plus, Loader2, Edit, Trash2, Search, AlertCircle, MapPin, Calendar, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminInternshipsPage() {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchInternships = async () => {
    try {
      const res = await fetch('/api/lms/internships');
      const data = await res.json();
      if (data.success) {
        setInternships(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch internships:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/lms/internships/${deleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setInternships(internships.filter((i) => i._id !== deleteId));
        setDeleteId(null);
      }
    } catch (error) {
      console.error('Failed to delete internship:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredInternships = internships.filter((i) => 
    i.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.employer?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage);
  const paginatedInternships = filteredInternships.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-500" /> Internship Placement
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Manage student internships and industry placements.</p>
        </div>
        <Link 
          href="/admin/internships/create"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Internship
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Controls */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search internships..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-zinc-900"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Employer</th>
                <th className="px-6 py-4 hidden md:table-cell">Duration</th>
                <th className="px-6 py-4 hidden sm:table-cell">Stipend</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                    Loading internships...
                  </td>
                </tr>
              ) : paginatedInternships.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <div className="bg-zinc-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Building2 className="w-8 h-8 text-zinc-300" />
                    </div>
                    No internships found.
                  </td>
                </tr>
              ) : (
                paginatedInternships.map((intern) => (
                  <tr key={intern._id} className="hover:bg-zinc-50/50 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-zinc-900">{intern.title}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{intern.location || 'Remote'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-700 font-medium">{intern.employer?.companyName || 'Corporate Partner'}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        {intern.duration || '3 Months'}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                        <DollarSign className="w-3.5 h-3.5" />
                        {intern.stipend || 'Unpaid'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/internships/${intern._id}/edit`}
                          className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => setDeleteId(intern._id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
            <div className="text-xs text-zinc-500 font-medium">
              Showing <span className="text-zinc-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-zinc-900">{Math.min(currentPage * itemsPerPage, filteredInternships.length)}</span> of <span className="text-zinc-900">{filteredInternships.length}</span> placements
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                      currentPage === i + 1 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-zinc-200">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-zinc-900 mb-2">Delete Placement</h3>
            <p className="text-center text-zinc-500 text-sm mb-6">
              Remove this internship opportunity? This action is permanent.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-white hover:bg-zinc-50 text-zinc-700 font-medium py-2 rounded-xl transition-all border border-zinc-200">Cancel</button>
              <button 
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-2 rounded-xl transition-all flex items-center justify-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
