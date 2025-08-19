'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CategoryWithChildren } from '@/lib/categoryUtils';

interface CategoriesContextType {
  categories: any[];
  categoryTree: CategoryWithChildren[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

interface CategoriesProviderProps {
  children: ReactNode;
}

export function CategoriesProvider({ children }: CategoriesProviderProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both regular categories and tree structure in parallel
      const [categoriesRes, treeRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/categories/tree')
      ]);

      if (!categoriesRes.ok || !treeRes.ok) {
        throw new Error('Failed to fetch categories');
      }

      const [categoriesData, treeData] = await Promise.all([
        categoriesRes.json(),
        treeRes.json()
      ]);

      setCategories(categoriesData.categories || []);
      setCategoryTree(treeData.tree || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    await fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const value: CategoriesContextType = {
    categories,
    categoryTree,
    loading,
    error,
    refreshCategories,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
