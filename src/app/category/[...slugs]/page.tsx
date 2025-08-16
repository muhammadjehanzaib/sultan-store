'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { CategoryWithChildren } from '@/lib/categoryUtils';
import { Product } from '@/types';
import { ProductGrid } from '@/components';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';

// Breadcrumb Component
const Breadcrumbs: React.FC<{ slugs: string[] }> = ({ slugs }) => {
  const { language } = useLanguage();
  
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
        </li>
        {slugs.map((slug, index) => {
          const href = `/category/${slugs.slice(0, index + 1).join('/')}`;
          const isLast = index === slugs.length - 1;
          
          return (
            <li key={slug} className="flex items-center">
              <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {isLast ? (
                <span className="text-gray-900 font-medium capitalize">
                  {slug.replace('-', ' ')}
                </span>
              ) : (
                <Link href={href} className="text-gray-500 hover:text-gray-700 capitalize">
                  {slug.replace('-', ' ')}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Subcategories Grid Component
const SubcategoriesGrid: React.FC<{ subcategories: CategoryWithChildren[] }> = ({ subcategories }) => {
  const { language } = useLanguage();
  
  if (!subcategories.length) return null;
  
  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Subcategories</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {subcategories.map(subcategory => (
          <Link
            key={subcategory.id}
            href={`/category/${subcategory.path}`}
            className="group p-4 bg-white rounded-lg border hover:border-purple-300 hover:shadow-md transition-all duration-200"
          >
            <div className="text-center">
              {subcategory.image ? (
                <img 
                  src={subcategory.image} 
                  alt={subcategory.name_en}
                  className="w-16 h-16 mx-auto mb-3 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 mx-auto mb-3 text-3xl flex items-center justify-center">
                  {subcategory.icon || '📦'}
                </div>
              )}
              <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                {language === 'ar' ? subcategory.name_ar : subcategory.name_en}
              </h4>
              {subcategory.productCount && (
                <p className="text-sm text-gray-500 mt-1">
                  {subcategory.productCount} products
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Main Category Page Component
export default function CategoryPage() {
  const params = useParams();
  const { language } = useLanguage();
  const [category, setCategory] = useState<CategoryWithChildren | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const slugs = useMemo(() => {
    return Array.isArray(params.slugs) 
      ? params.slugs.filter((slug): slug is string => typeof slug === 'string') 
      : [params.slugs].filter((slug): slug is string => typeof slug === 'string');
  }, [params.slugs]);
  
  useEffect(() => {
    async function fetchCategoryAndProducts() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch category by path
        const categoryPath = slugs.join('/');
        if (!categoryPath) {
          setError('Invalid category path');
          setLoading(false);
          return;
        }
        
        const categoryResponse = await fetch(`/api/categories/by-path?path=${encodeURIComponent(categoryPath)}`);
        
        if (!categoryResponse.ok) {
          throw new Error('Category not found');
        }
        
        const categoryData = await categoryResponse.json();
        setCategory(categoryData.category);
        
        // Fetch products for this category AND all its subcategories
        if (categoryData.category?.id) {
          const productsResponse = await fetch(`/api/categories/${categoryData.category.id}/products?includeSubcategories=true`);
          if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            setProducts(productsData.products || []);
          } else {
            setProducts([]);
          }
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load category');
        setCategory(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    
    if (slugs.length > 0) {
      fetchCategoryAndProducts();
    }
  }, [slugs]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }
  
  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested category could not be found.'}</p>
          <Link href="/" className="text-purple-600 hover:text-purple-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  const categoryName = language === 'ar' ? category.name_ar : category.name_en;
  const categoryDescription = language === 'ar' ? category.description_ar : category.description_en;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumbs */}
        <Breadcrumbs slugs={slugs} />
        
        {/* Category Header */}
        <div className="mt-8 mb-12">
          <div className="flex items-center space-x-4 mb-4">
            {category.image ? (
              <img 
                src={category.image} 
                alt={categoryName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : category.icon ? (
              <div className="w-16 h-16 text-4xl flex items-center justify-center">
                {category.icon}
              </div>
            ) : null}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {categoryName}
              </h1>
              {categoryDescription && (
                <p className="text-gray-600 mt-2 text-lg">
                  {categoryDescription}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <SubcategoriesGrid subcategories={category.children} />
        )}
        
        {/* Products */}
        {products.length > 0 ? (
          <ProductGrid
            products={products}
            title={`Products in ${categoryName}`}
            subtitle={`Browse our ${categoryName.toLowerCase()} collection`}
            showHeader={true}
            showViewAllButton={false}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
