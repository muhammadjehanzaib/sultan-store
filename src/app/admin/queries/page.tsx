"use client";
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

type QueryStatus = 'new' | 'in progress' | 'resolved';

const statusColors: Record<QueryStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  'in progress': 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
};

const mockQueries = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Order not received',
    message: 'I placed an order last week but have not received it yet.',
    date: '2024-06-01',
    status: 'new' as QueryStatus,
  },
  {
    id: 2,
    name: 'Fatima Ali',
    email: 'fatima@example.com',
    subject: 'Product inquiry',
    message: 'Is the smartwatch waterproof?',
    date: '2024-06-02',
    status: 'resolved' as QueryStatus,
  },
  {
    id: 3,
    name: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    subject: 'Return request',
    message: 'I want to return my order #1234.',
    date: '2024-06-03',
    status: 'in progress' as QueryStatus,
  },
];

export default function AdminQueries() {
  const [queries, setQueries] = useState(mockQueries);
  const [selectedQuery, setSelectedQuery] = useState<typeof mockQueries[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<QueryStatus>('new');

  const handleView = (query: typeof mockQueries[0]) => {
    setSelectedQuery(query);
    setModalStatus(query.status);
    setIsModalOpen(true);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModalStatus(e.target.value as QueryStatus);
  };

  const handleSaveStatus = () => {
    if (!selectedQuery) return;
    setQueries(prev =>
      prev.map(q =>
        q.id === selectedQuery.id ? { ...q, status: modalStatus } : q
      )
    );
    setIsModalOpen(false);
  };

  return (
    <AdminAuthGuard requiredRole={["admin", "manager", "support"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contact Queries</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">View and manage customer contact form submissions.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Message</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queries.map(q => (
                  <tr key={q.id} className="bg-white dark:bg-gray-800 border-b">
                    <td className="px-4 py-2">{q.name}</td>
                    <td className="px-4 py-2">{q.email}</td>
                    <td className="px-4 py-2">{q.subject}</td>
                    <td className="px-4 py-2 max-w-xs truncate" title={q.message}>{q.message}</td>
                    <td className="px-4 py-2">{q.date}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[q.status]}`}>{q.status}</span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => handleView(q)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Query Details Modal */}
          {isModalOpen && selectedQuery && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-lg">Query Details</h4>
                  <button className="text-gray-500 hover:text-gray-800 text-2xl font-bold" onClick={() => setIsModalOpen(false)}>×</button>
                </div>
                <div className="space-y-2">
                  <div><span className="font-semibold">Name:</span> {selectedQuery.name}</div>
                  <div><span className="font-semibold">Email:</span> {selectedQuery.email}</div>
                  <div><span className="font-semibold">Subject:</span> {selectedQuery.subject}</div>
                  <div><span className="font-semibold">Message:</span> <div className="bg-gray-100 dark:bg-gray-700 rounded p-2 mt-1 whitespace-pre-line">{selectedQuery.message}</div></div>
                  <div><span className="font-semibold">Date:</span> {selectedQuery.date}</div>
                  <div>
                    <span className="font-semibold">Status:</span>
                    <select
                      value={modalStatus}
                      onChange={handleStatusChange}
                      className="ml-2 p-1 border rounded"
                    >
                      <option value="new">New</option>
                      <option value="in progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${statusColors[modalStatus]}`}>{modalStatus}</span>
                  </div>
                </div>
                <div className="flex justify-end mt-6 gap-2">
                  <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleSaveStatus}>Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
} 