'use client';

import React, { useState, useEffect } from 'react';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'manager' | 'support' | 'viewer';
    emailVerified: boolean | null;
  };
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  onUserUpdated,
  user,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'viewer',
    emailVerified: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        emailVerified: !!user.emailVerified,
      });
      setErrors({});
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    return newErrors;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        setErrors({ general: result.error || 'Failed to update user' });
        return;
      }

      onUserUpdated();
      onClose();
    } catch (error) {
      setErrors({ general: 'Unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 sm:px-0">
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-user-modal-title"
      >
        <div className="px-6 pt-5 pb-4">
          <div className="flex justify-between items-center mb-4">
            <h3
              id="edit-user-modal-title"
              className="text-lg font-medium text-gray-900 dark:text-white"
            >
              Edit User
            </h3>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 ${
                    errors.firstName ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 ${
                    errors.lastName ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 ${
                  errors.role ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="viewer">Viewer</option>
                <option value="support">Support</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role}</p>}
            </div>

            {/* Email Verified */}
            <div className="flex items-center">
              <input
                id="emailVerified"
                name="emailVerified"
                type="checkbox"
                checked={!!formData.emailVerified}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="emailVerified" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Email Verified
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-row-reverse gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Updating...
              </>
            ) : (
              'Update User'
            )}
          </button>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
