'use client';

import React, { useState } from 'react';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserDeleted: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  onUserDeleted,
  user
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to delete user');
        return;
      }

      onUserDeleted();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 sm:px-0">
      {/* Modal panel */}
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex justify-between items-start">
            <h3 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete User
            </h3>
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Confirmation message */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this user? This action cannot be undone.
          </div>

          {/* User Info */}
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-800 dark:text-gray-100 font-semibold">
                {user.name ? user.name.split(' ').map(n => n[0]).join('') : '??'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-300">{user.email}</p>
                <p className="text-xs text-gray-400 dark:text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-800 rounded-md">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">Warning</h4>
            <ul className="list-disc list-inside text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>All user sessions and login history</li>
              <li>Any associated user data and preferences</li>
              <li>User's access to all systems and resources</li>
            </ul>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-row-reverse gap-3">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
              isDeleting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
                  />
                </svg>
                Deleting...
              </>
            ) : (
              'Delete User'
            )}
          </button>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
