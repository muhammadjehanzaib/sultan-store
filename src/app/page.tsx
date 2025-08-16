'use client';

import { CampaignSlider, ProductSlider, Footer } from '@/components';
import { CategorySection } from '@/components/homepage/CategorySection';
import { Product } from '@/types';
import { scrollToElement } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Helper function to robustly convert various inStock values to boolean
function convertToInStockBoolean(value: any): boolean {
  // Handle explicit false values
  if (value === false || value === 'false' || value === 0 || value === '0') {
    return false;
  }
  
  // Handle explicit true values  
  if (value === true || value === 'true' || value === 1 || value === '1') {
    return true;
  }
  
  // Handle null/undefined - default to false (out of stock)
  if (value === null || value === undefined) {
    return false;
  }
  
  // Fallback to Boolean conversion
  return Boolean(value);
}

export default function Home() {
  const { dispatch } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products and categories from API
  useEffect(() => {
    Promise.all([
      fetch('/api/products?includeRelations=true'),
      fetch('/api/categories')
    ])
      .then(async ([productsRes, categoriesRes]) => {
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        
        // Process products
        const products = Array.isArray(productsData) ? productsData : [];
        const frontendProducts = products.map((apiProduct: any) => ({
          id: apiProduct.id,
          name: { en: apiProduct.name_en || '', ar: apiProduct.name_ar || '' },
          slug: apiProduct.slug,
          price: apiProduct.price,
          image: apiProduct.image,
          category: apiProduct.category
            ? { en: apiProduct.category.name_en || '', ar: apiProduct.category.name_ar || '' }
            : { en: '', ar: '' },
          description: { en: apiProduct.description_en || '', ar: apiProduct.description_ar || '' },
          inStock: convertToInStockBoolean(apiProduct.inStock),
          rating: apiProduct.rating,
          reviews: apiProduct.reviews,
          attributes: apiProduct.attributes || [],
          variants: apiProduct.variants || [],
          // Include discount fields
          salePrice: apiProduct.salePrice,
          discountPercent: apiProduct.discountPercent,
          onSale: apiProduct.onSale || false,
          saleStartDate: apiProduct.saleStartDate,
          saleEndDate: apiProduct.saleEndDate,
        }));
        
        // Process categories - API returns { categories: [...] }
        const categoriesList = Array.isArray(categoriesData?.categories) ? categoriesData.categories : [];
        
        // Filter only main categories (those without parentId) for home page "Shop by Category" section
        const mainCategories = categoriesList.filter((apiCategory: any) => !apiCategory.parentId);
        
        const frontendCategories = mainCategories.map((apiCategory: any) => ({
          id: apiCategory.id,
          name: { en: apiCategory.name_en || '', ar: apiCategory.name_ar || '' },
          slug: apiCategory.slug,
          path: apiCategory.path,
          icon: apiCategory.icon || '📦', // Default icon
          image: apiCategory.image,
          productCount: apiCategory.productCount || 0,
          isActive: apiCategory.isActive !== false,
          children: apiCategory.children ? apiCategory.children.map((child: any) => ({
            id: child.id,
            name: { en: child.name_en || '', ar: child.name_ar || '' },
            slug: child.slug,
            path: child.path,
            icon: child.icon,
            image: child.image,
            productCount: child.productCount || 0,
            isActive: child.isActive !== false,
          })) : [],
        }));
        
        setProducts(frontendProducts);
        setCategories(frontendCategories);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product: Product, selectedAttributes?: { [attributeId: string]: string }) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, selectedAttributes } });
  };

  const handleViewProduct = (product: Product) => {
    router.push(`/product/${product.slug}`);
  };

  const handleViewAllItems = () => {
    // Navigate to products page or category page to show all products
    router.push('/search');
  };

  const handleHeroButtonClick = () => {
    scrollToElement('featured-products');
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Campaign Slider - Multiple slides with arrows */}
      <CampaignSlider />
      
      <CategorySection categories={categories} />
      
      <ProductSlider 
        products={products}
        onAddToCart={handleAddToCart}
        onViewProduct={handleViewProduct}
        onViewAllItems={handleViewAllItems}
        title="All Products"
        subtitle="Browse all our products in one line with horizontal scrolling"
        showErrorButton={true}
        showViewAllButton={true}
      />
      
      <Footer />
    </div>
  );
}
