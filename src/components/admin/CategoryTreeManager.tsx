'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';

interface CategoryWithChildren {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  path?: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  sortOrder?: number;
  level: number;
  parentId?: string;
  children?: CategoryWithChildren[];
  productCount?: number;
}

interface CategoryTreeManagerProps {
  categories: CategoryWithChildren[];
  onEdit: (category: CategoryWithChildren) => void;
  onDelete: (categoryId: string) => void;
  onToggleActive: (categoryId: string, isActive: boolean) => void;
  onMove: (categoryId: string, newParentId: string | null, newSortOrder: number) => void;
  onAddSubcategory: (parentCategory: CategoryWithChildren) => void;
  selectedCategories?: string[];
  onSelectCategory?: (categoryId: string) => void;
}

export const CategoryTreeManager: React.FC<CategoryTreeManagerProps> = ({
  categories,
  onEdit,
  onDelete,
  onToggleActive,
  onMove,
  onAddSubcategory,
  selectedCategories = [],
  onSelectCategory,
}) => {
  const { t, language, isRTL } = useLanguage();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-expand categories with children on load
  useEffect(() => {
    const categoriesWithChildren = categories.filter(cat => cat.children && cat.children.length > 0);
    setExpandedCategories(new Set(categoriesWithChildren.map(cat => cat.id)));
  }, [categories]);

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  };

  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedItem(categoryId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(categoryId);
  };

  const handleDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetCategoryId) return;

    // Find the dragged category and target category
    const draggedCategory = findCategoryById(draggedItem, categories);
    const targetCategory = findCategoryById(targetCategoryId, categories);
    
    if (!draggedCategory || !targetCategory) return;

    // Prevent dropping a category onto its own child
    if (isChildOf(targetCategoryId, draggedItem, categories)) {
      alert('Cannot move a category into its own subcategory');
      return;
    }

    // Move the category
    onMove(draggedItem, targetCategoryId, (targetCategory.children?.length || 0));
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const getCategoryName = (category: CategoryWithChildren): string => {
    return language === 'ar' ? category.name_ar : category.name_en;
  };

  const getIndentLevel = (level: number): string => {
    return `${level * 24}px`;
  };

  const filterCategories = (cats: CategoryWithChildren[], query: string): CategoryWithChildren[] => {
    if (!query) return cats;
    
    return cats.filter(cat => {
      const nameMatch = cat.name_en.toLowerCase().includes(query.toLowerCase()) ||
                       cat.name_ar.toLowerCase().includes(query.toLowerCase());
      const childMatch = cat.children && filterCategories(cat.children, query).length > 0;
      return nameMatch || childMatch;
    }).map(cat => ({
      ...cat,
      children: cat.children ? filterCategories(cat.children, query) : []
    }));
  };

  const renderCategory = (category: CategoryWithChildren, level: number = 0): React.ReactNode => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedCategories.includes(category.id);
    const isDragging = draggedItem === category.id;
    const isDragOver = dragOverItem === category.id;

    return (
      <div key={category.id} className={`${isDragging ? 'opacity-50' : ''}`}>
        {/* Main Category Row */}
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, category.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, category.id)}
          onDrop={(e) => handleDrop(e, category.id)}
          className={`
            flex items-center py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-move
            ${isDragOver ? 'bg-blue-50 border-blue-200' : ''}
            ${isSelected ? 'bg-blue-50' : ''}
          `}
          style={{ marginLeft: getIndentLevel(level) }}
        >
          {/* Expansion Toggle */}
          <div className="flex items-center w-8">
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(category.id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Selection Checkbox */}
          {onSelectCategory && (
            <div className="mr-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelectCategory(category.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Drag Handle */}
          <div className="mr-3 text-gray-400 hover:text-gray-600 cursor-move">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3,15H21V13H3V15M3,19H21V17H3V19M3,11H21V9H3V11M3,5V7H21V5H3Z" />
            </svg>
          </div>

          {/* Category Icon */}
          <div className="mr-3 text-2xl flex-shrink-0">
            {category.icon || '🏷️'}
          </div>

          {/* Category Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 truncate">
                {getCategoryName(category)}
              </span>
              <span className="text-sm text-gray-500">
                ({language === 'ar' ? category.name_en : category.name_ar})
              </span>
              {!category.isActive && (
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  Inactive
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 flex items-center space-x-4">
              <span>/{category.slug}</span>
              <span>Level: {level + 1}</span>
              {category.productCount !== undefined && (
                <span>{category.productCount} products</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
            <div title="Add Subcategory">
              <Button
                onClick={() => onAddSubcategory(category)}
                variant="outline"
                size="sm"
                className="text-green-600 hover:text-green-700"
              >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>
            </div>
            <Button
              onClick={() => onEdit(category)}
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
            >
              Edit
            </Button>
            <Button
              onClick={() => onToggleActive(category.id, !category.isActive)}
              variant="outline"
              size="sm"
              className={category.isActive 
                ? "text-yellow-600 hover:text-yellow-700" 
                : "text-green-600 hover:text-green-700"
              }
            >
              {category.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              onClick={() => onDelete(category.id)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredCategories = filterCategories(categories, searchQuery);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      {/* Header with Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{categories.length} total categories</span>
            <span>{categories.filter(cat => cat.isActive).length} active</span>
          </div>
        </div>
      </div>

      {/* Tree View */}
      <div className="max-h-[600px] overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏷️</div>
            <p className="text-gray-500">
              {searchQuery ? `No categories found matching "${searchQuery}"` : 'No categories found'}
            </p>
          </div>
        ) : (
          <div>
            {filteredCategories.map(category => renderCategory(category, 0))}
          </div>
        )}
      </div>

      {/* Footer with Instructions */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        <p>💡 Drag and drop to reorder categories • Click the arrow to expand/collapse • Use the + button to add subcategories</p>
      </div>
    </div>
  );
};

// Helper functions
function findCategoryById(id: string, categories: CategoryWithChildren[]): CategoryWithChildren | null {
  for (const category of categories) {
    if (category.id === id) return category;
    if (category.children) {
      const found = findCategoryById(id, category.children);
      if (found) return found;
    }
  }
  return null;
}

function isChildOf(childId: string, parentId: string, categories: CategoryWithChildren[]): boolean {
  const parent = findCategoryById(parentId, categories);
  if (!parent || !parent.children) return false;
  
  for (const child of parent.children) {
    if (child.id === childId) return true;
    if (isChildOf(childId, child.id, categories)) return true;
  }
  return false;
}
