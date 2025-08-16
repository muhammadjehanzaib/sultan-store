'use client';

import React, { useState, useEffect } from 'react';

export type ContactQueryStatus = 'new' | 'in progress' | 'resolved' | 'closed';

export interface ContactQuery {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactQueryStatus;
  createdAt: string;
  updatedAt: string;
}

interface ContactQueriesTableProps {
  onQueryUpdate?: () => void;
}

const statusColors: Record<ContactQueryStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  'in progress': 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export default function ContactQueriesTable({ onQueryUpdate }: ContactQueriesTableProps) {
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<ContactQueryStatus>('new');
  const [updating, setUpdating] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchQueries = async (page = 1, status = 'all') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(status !== 'all' && { status })
      });

      const response = await fetch(`/api/contact?${params}`);
      const data = await response.json();

      if (response.ok) {
        setQueries(data.contactQueries);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch contact queries');
      }
    } catch (err) {
      setError('Failed to fetch contact queries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  const handleView = (query: ContactQuery) => {
    setSelectedQuery(query);
    setModalStatus(query.status);
    setIsModalOpen(true);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModalStatus(e.target.value as ContactQueryStatus);
  };

  const handleSaveStatus = async () => {
    if (!selectedQuery) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/contact/${selectedQuery.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: modalStatus }),
      });

      const result = await response.json();

      if (response.ok) {
        // Update local state
        setQueries(prev =>
          prev.map(q =>
            q.id === selectedQuery.id 
              ? { ...q, status: modalStatus, updatedAt: new Date().toISOString() }
              : q
          )
        );
        setIsModalOpen(false);
        onQueryUpdate?.();
      } else {
        alert(result.error || 'Failed to update query status');
      }
    } catch (error) {
      alert('Failed to update query status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (queryId: string) => {
    if (!confirm('Are you sure you want to delete this contact query?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contact/${queryId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setQueries(prev => prev.filter(q => q.id !== queryId));
        onQueryUpdate?.();
      } else {
        alert(result.error || 'Failed to delete query');
      }
    } catch (error) {
      alert('Failed to delete query');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading contact queries...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
        <button 
          onClick={() => fetchQueries(currentPage, statusFilter)}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Total: {totalCount} queries
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-white dark:bg-gray-800 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Subject</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Message</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Date</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {queries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No contact queries found
                </td>
              </tr>
            ) : (
              queries.map((query) => (
                <tr key={query.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{query.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{query.email}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{query.subject}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-600 dark:text-gray-300" title={query.message}>
                    {query.message}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[query.status]}`}>
                      {query.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {formatDate(query.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                        onClick={() => handleView(query)}
                      >
                        View
                      </button>
                      <button 
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                        onClick={() => handleDelete(query.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Query Details Modal */}
      {isModalOpen && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white">Query Details</h4>
              <button 
                className="text-gray-500 hover:text-gray-800 text-2xl font-bold" 
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Name:</span>
                <p className="text-gray-600 dark:text-gray-300">{selectedQuery.name}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Email:</span>
                <p className="text-gray-600 dark:text-gray-300">{selectedQuery.email}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Subject:</span>
                <p className="text-gray-600 dark:text-gray-300">{selectedQuery.subject}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Message:</span>
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 mt-1 whitespace-pre-line text-gray-700 dark:text-gray-300">
                  {selectedQuery.message}
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Created:</span>
                <p className="text-gray-600 dark:text-gray-300">{formatDate(selectedQuery.createdAt)}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Status:</span>
                <div className="flex items-center space-x-3 mt-1">
                  <select
                    value={modalStatus}
                    onChange={handleStatusChange}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="new">New</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[modalStatus]}`}>
                    {modalStatus}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" 
                onClick={() => setIsModalOpen(false)}
                disabled={updating}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50" 
                onClick={handleSaveStatus}
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
