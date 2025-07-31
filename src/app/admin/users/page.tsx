'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import UserList from '@/components/admin/UserList';
import AddUserModal from '@/components/admin/AddUserModal';
import EditUserModal from '@/components/admin/EditUserModal';
import DeleteUserModal from '@/components/admin/DeleteUserModal';

interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'support' | 'viewer';
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean | null;
}

interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
}

export default function UsersPage() {
  const { user: currentUser } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10,
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchUsers = async (page = 1, limit = 10, role = '', search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(role && { role }),
        ...(search && { search }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.currentPage, pagination.limit, roleFilter, searchQuery);
  }, [pagination.currentPage, pagination.limit, roleFilter, searchQuery]);

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleUserAdded = () => {
    setShowAddModal(false);
    fetchUsers(pagination.currentPage, pagination.limit, roleFilter, searchQuery);
  };

  const handleUserUpdated = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    fetchUsers(pagination.currentPage, pagination.limit, roleFilter, searchQuery);
  };

  const handleUserDeleted = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
    fetchUsers(pagination.currentPage, pagination.limit, roleFilter, searchQuery);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, currentPage: 1 }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const canAddUsers = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const canEditUsers = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const canDeleteUsers = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-2 text-gray-600">
                Manage users and their roles in the system
              </p>
            </div>
            {canAddUsers && (
              <button
                onClick={handleAddUser}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add New User
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(e) => handleRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="support">Support</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            {/* Results per page */}
            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-2">
                Results per page
              </label>
              <select
                id="limit"
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* User List */}
        <UserList
          users={users}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEditUser={canEditUsers ? handleEditUser : undefined}
          onDeleteUser={canDeleteUsers ? handleDeleteUser : undefined}
          currentUserId={currentUser?.id}
        />

        {/* Modals */}
        {showAddModal && (
          <AddUserModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onUserAdded={handleUserAdded}
          />
        )}

        {showEditModal && selectedUser && (
          <EditUserModal
            isOpen={showEditModal}
            user={selectedUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onUserUpdated={handleUserUpdated}
          />
        )}

        {showDeleteModal && selectedUser && (
          <DeleteUserModal
            isOpen={showDeleteModal}
            user={selectedUser}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedUser(null);
            }}
            onUserDeleted={handleUserDeleted}
          />
        )}
      </div>
    </div>
  );
}
