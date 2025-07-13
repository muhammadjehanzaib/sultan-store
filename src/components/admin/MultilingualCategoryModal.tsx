"use client";

import { useState, useEffect } from 'react';
import { MultilingualCategory, LocalizedContent } from '@/types';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface MultilingualCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: MultilingualCategory) => void;
  category: MultilingualCategory | null;
}

export function MultilingualCategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
}: MultilingualCategoryModalProps) {
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState<MultilingualCategory>({
    id: '',
    name: { en: '', ar: '' },
    slug: '',
    description: { en: '', ar: '' },
    icon: '',
    isActive: true,
    sortOrder: 1
  });

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        id: '',
        name: { en: '', ar: '' },
        slug: '',
        description: { en: '', ar: '' },
        icon: '',
        isActive: true,
        sortOrder: 1
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id && formData.name.en && formData.name.ar && formData.slug) {
      onSave(formData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field?: keyof LocalizedContent,
  ) => {
    const { name, value } = e.target;

    if (name === 'name.en' || name === 'name.ar') {
      const language = name.split('.')[1] as keyof LocalizedContent;
      setFormData((prev) => ({
        ...prev,
        name: {
          ...prev.name,
          [language]: value,
        },
      }));
      
      // Auto-generate slug from English name
      if (name === 'name.en') {
        const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setFormData((prev) => ({
          ...prev,
          slug,
        }));
      }
      
      // Auto-generate id when name changes (for new categories)
      if (name === 'name.en' && !category) {
        const id = value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        setFormData((prev) => ({
          ...prev,
          id,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {category ? 'Edit Category' : 'Add Category'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name (English)
            </label>
            <input
              type="text"
              name="name.en"
              value={formData.name.en}
              onChange={(e) => handleInputChange(e, 'en')}
              required
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name (Arabic)
            </label>
            <input
              type="text"
              name="name.ar"
              value={formData.name.ar}
              onChange={(e) => handleInputChange(e, 'ar')}
              required
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ID
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={(e) => handleInputChange(e, 'en')}
              required
              disabled={!!category}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {category ? 'Category ID cannot be changed' : 'Unique identifier for the category'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={(e) => handleInputChange(e, 'en')}
              required
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Slug should be unique and URL-friendly.
            </p>
          </div>

          <div className={`flex space-x-4 pt-4`}>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
