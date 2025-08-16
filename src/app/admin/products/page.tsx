'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { EnhancedProductsTable } from '@/components/admin/EnhancedProductsTable';
import { ProductDashboard } from '@/components/admin/ProductDashboard';
import { MultilingualProductModal } from '@/components/admin/MultilingualProductModal';
import { Button } from '@/components/ui/Button';
import { Product, MultilingualProduct, Category, ProductAttribute } from '@/types';
import { convertToMultilingualProduct } from '@/lib/multilingualUtils';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import Price from '@/components/ui/Price';

export default function AdminProducts() {
  const { t, isRTL } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<'dashboard' | 'table'>('dashboard');

  const handleAddProduct = () => {
    if (!Array.isArray(categories) || categories.length === 0) {
      alert('Categories are still loading. Please wait.');
      return;
    }
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    if (!Array.isArray(categories) || categories.length === 0) {
      alert('Categories are still loading. Please wait.');
      return;
    }
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Fetch categories for use in product modal and mapping
  useEffect(() => {
    fetch('/api/categories?includeInactive=true')
      .then(res => res.json())
      .then((data: { categories: Category[] }) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  // Helper: Map API product to frontend format
  const apiToProduct = (apiProduct: any): Product => {
    if (!apiProduct || !apiProduct.id) {
      throw new Error('Invalid product data received from API');
    }


    // Process attributes properly
    const processedAttributes = (apiProduct.attributes || []).map((attr: any) => {
      return {
        id: attr.id,
        name: attr.name,
        type: attr.type,
        required: attr.required || false,
        values: (attr.values || []).map((val: any) => {
          return {
            id: val.id,
            value: val.value,
            label: val.label || val.value,
            hexColor: val.hexColor,
            priceModifier: typeof val.priceModifier === 'number' ? val.priceModifier : 0,
            inStock: val.inStock !== false, // Default to true
            imageUrl: val.imageUrl
          };
        })
      };
    });

    // Process variants properly - handle new relational structure
    const processedVariants = (apiProduct.variants || []).map((variant: any) => {

      // Convert relational attributeValues to simple object format for frontend compatibility
      let attributeValues: Record<string, string> = {};

      if (variant.attributeValues && Array.isArray(variant.attributeValues)) {
        variant.attributeValues.forEach((joinRecord: any) => {
          if (joinRecord.attributeValue && joinRecord.attributeValue.attribute) {
            const attributeId = joinRecord.attributeValue.attribute.id;
            const valueId = joinRecord.attributeValue.id;
            attributeValues[attributeId] = valueId;
          }
        });
      } else if (variant.attributeValues) {
        // Legacy structure: direct object or JSON string
        if (typeof variant.attributeValues === 'string') {
          try {
            attributeValues = JSON.parse(variant.attributeValues);
          } catch (e) {
            attributeValues = {};
          }
        } else if (typeof variant.attributeValues === 'object') {
          attributeValues = variant.attributeValues;
        }
      }

      // Initialize attributeValues with default values if empty and attributes exist
      if (Object.keys(attributeValues).length === 0 && processedAttributes.length > 0) {
        processedAttributes.forEach((attr: ProductAttribute) => {
          if (attr.values && attr.values.length > 0) {
            attributeValues[attr.id] = attr.values[0].id; // Use first available value as default
          }
        });
      }

      const processedVariant = {
        id: variant.id,
        attributeValues,
        price: variant.price,
        image: variant.image || '',
        sku: variant.sku || '',
        inStock: variant.inStock !== false,
        stockQuantity: variant.stockQuantity || 0
      };

      return processedVariant;
    });

    // Store original multilingual data for later use
    const product = {
      id: apiProduct.id,
      name: apiProduct.name_en || '',
      slug: apiProduct.slug,
      price: apiProduct.price,
      image: apiProduct.image,
      category: apiProduct.category ? apiProduct.category.name_en : '',
      description: apiProduct.description_en || '',
      inStock: apiProduct.inStock,
      rating: apiProduct.rating,
      reviews: apiProduct.reviews,
      // Include discount fields from API
      salePrice: apiProduct.salePrice,
      discountPercent: apiProduct.discountPercent,
      onSale: apiProduct.onSale || false,
      saleStartDate: apiProduct.saleStartDate,
      saleEndDate: apiProduct.saleEndDate,
      // Properly preserve attributes with values
      attributes: processedAttributes,
      // Properly preserve variants
      variants: processedVariants,
      // Keep original multilingual data
      name_en: apiProduct.name_en,
      name_ar: apiProduct.name_ar,
      description_en: apiProduct.description_en,
      description_ar: apiProduct.description_ar,
      category_en: apiProduct.category ? apiProduct.category.name_en : '',
      category_ar: apiProduct.category ? apiProduct.category.name_ar : '',
    };

    return product as Product;
  };

  // Helper: Map frontend product to API format
  const productToApi = (product: MultilingualProduct) => {
    // Find categoryId by matching the English name
    const categoryId = categories.find(
      c => c.name_en === product.category.en || c.name === product.category.en
    )?.id;

    const apiData = {
      name_en: product.name.en,
      name_ar: product.name.ar,
      slug: product.slug,
      image: product.image,
      price: product.price,
      categoryId,
      description_en: product.description?.en || '',
      description_ar: product.description?.ar || '',
      inStock: product.inStock,
      rating: product.rating,
      reviews: product.reviews,
      // Include discount fields
      salePrice: product.salePrice || null,
      discountPercent: product.discountPercent || null,
      onSale: product.onSale || false,
      saleStartDate: product.saleStartDate || null,
      saleEndDate: product.saleEndDate || null,
      variants: product.variants || [],
      attributes: product.attributes || [],
    };

    return apiData;
  };

  // Fetch products from API
  useEffect(() => {
    setLoading(true);
    fetch('/api/products?includeRelations=true&includeInactiveCategories=true')
      .then(res => res.json())
      .then((data: any) => {
        // Handle both direct array and wrapped response
        const products = Array.isArray(data) ? data : (data.products || []);
        setProductsData(products.map(apiToProduct));
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  }, []);

  const handleDeleteProduct = async (productId: string) => {
    if (confirm(t('admin.products.deleteConfirm'))) {
      // Optimistically update UI
      setProductsData(prev => prev.filter(p => p.id !== productId));
      setSelectedProducts(prev => prev.filter(id => id !== productId));
      // Call API
      await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    }
  };

  const handleSaveProduct = async (multilingualProduct: MultilingualProduct) => {
    const isEdit = !!selectedProduct;
    const apiPayload = productToApi(multilingualProduct);

    // Validate payload before sending
    if (!apiPayload.categoryId) {
      alert('Please select a category');
      return;
    }

    let response, data: any;
    try {
      if (isEdit) {
        response = await fetch(`/api/products/${selectedProduct!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload),
        });
        data = await response.json();
        if (response.ok) {
          // For PATCH, the API returns just a message, so we need to refetch the product
          const refreshResponse = await fetch(`/api/products?includeRelations=true&includeInactiveCategories=true`);
          const refreshData = await refreshResponse.json();
          const products = Array.isArray(refreshData) ? refreshData : (refreshData.products || []);
          const updatedProduct = products.find((p: any) => p.id === selectedProduct!.id);
          if (updatedProduct) {
            setProductsData(prev => prev.map(p => p.id === selectedProduct!.id ? apiToProduct(updatedProduct) : p));
          }
        } else {
          alert(`Failed to update product: ${data.error || 'Unknown error'}`);
          return;
        }
      } else {
        response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload),
        });
        data = await response.json();
        if (response.ok) {
          // For POST, the API returns just an ID, so we need to refetch all products
          const refreshResponse = await fetch(`/api/products?includeRelations=true&includeInactiveCategories=true`);
          const refreshData = await refreshResponse.json();
          const products = Array.isArray(refreshData) ? refreshData : (refreshData.products || []);
          setProductsData(products.map(apiToProduct));
        } else {
          alert(`Failed to create product: ${data.error || 'Unknown error'}`);
          return;
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      alert('Network error occurred. Please try again.');
    }
  };

  const handleBulkDelete = () => {
    if (confirm(t('admin.products.bulkDeleteConfirm'))) {
      setProductsData(prev => prev.filter(p => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
      setShowBulkActions(false);
    }
  };

  const handleBulkActivate = () => {
    setProductsData(prev =>
      prev.map(p =>
        selectedProducts.includes(p.id)
          ? { ...p, inStock: true }
          : p
      )
    );
    setSelectedProducts([]);
    setShowBulkActions(false);
  };

  const handleBulkDeactivate = () => {
    setProductsData(prev =>
      prev.map(p =>
        selectedProducts.includes(p.id)
          ? { ...p, inStock: false }
          : p
      )
    );
    setSelectedProducts([]);
    setShowBulkActions(false);
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === productsData.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(productsData.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle individual product stock toggle
  const handleToggleStock = async (productId: string, inStock: boolean) => {
    try {
      // Optimistically update UI
      setProductsData(prev => prev.map(p => 
        p.id === productId ? { ...p, inStock } : p
      ));

      // Call API to update the product
      const product = productsData.find(p => p.id === productId);
      if (!product) return;

      const multilingualProduct = convertToMultilingualProduct(product);
      const apiPayload = {
        ...productToApi(multilingualProduct),
        inStock
      };

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        // Revert UI change if API call failed
        setProductsData(prev => prev.map(p => 
          p.id === productId ? { ...p, inStock: !inStock } : p
        ));
        const error = await response.json();
        alert(`Failed to update product stock: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      // Revert UI change
      setProductsData(prev => prev.map(p => 
        p.id === productId ? { ...p, inStock: !inStock } : p
      ));
      alert('Network error occurred. Please try again.');
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    // Create a copy of the product with a new ID and modified name
    const duplicatedProduct = {
      ...product,
      id: '', // Will be generated by the API
      name: typeof product.name === 'string' 
        ? `${product.name} (Copy)`
        : {
            en: `${product.name?.en || product.name_en || ''} (Copy)`,
            ar: `${product.name?.ar || product.name_ar || ''} (نسخة)`
          },
      name_en: `${product.name_en || ''} (Copy)`,
      name_ar: `${product.name_ar || ''} (نسخة)`,
      slug: `${product.slug}-copy`
    };
    
    setSelectedProduct(duplicatedProduct);
    setIsModalOpen(true);
  };

  const handleImportProducts = () => {
    // TODO: Implement product import functionality
    alert('Product import feature will be implemented soon!');
  };

  const handleExportProducts = () => {
    // TODO: Implement product export functionality  
    alert('Product export feature will be implemented soon!');
  };

  // Calculate statistics
  const totalProducts = productsData.length;
  const inStockProducts = productsData.filter(p => p.inStock).length;
  const outOfStockProducts = productsData.filter(p => !p.inStock).length;
  const totalValue = productsData.reduce((sum, p) => sum + p.price, 0);

  if (loading) {
    return <div className="p-8 text-center">Loading products...</div>;
  }

  return (
    <AdminAuthGuard requiredRole={["admin", "manager"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('admin.products.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {t('admin.products.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    viewMode === 'dashboard'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  📋 Table
                </button>
              </div>
              <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700">
                {t('admin.products.addProduct')}
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Stock</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{inStockProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <span className="text-2xl">❌</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Out of Stock</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{outOfStockProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    <Price amount={totalValue} locale={isRTL ? 'ar' : 'en'} className="text-2xl font-bold text-gray-900 dark:text-white" />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {selectedProducts.length} products selected
                  </span>
                  <Button
                    onClick={handleSelectAll}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {selectedProducts.length === productsData.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className={`flex space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
                  <Button
                    onClick={handleBulkActivate}
                    variant="outline"
                    size="sm"
                    className="text-green-600 hover:text-green-700"
                  >
                    Activate Stock
                  </Button>
                  <Button
                    onClick={handleBulkDeactivate}
                    variant="outline"
                    size="sm"
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    Deactivate Stock
                  </Button>
                  <Button
                    onClick={handleBulkDelete}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Conditional rendering based on view mode */}
          {viewMode === 'dashboard' ? (
            <ProductDashboard
              products={productsData}
              categories={categories}
              onAddProduct={handleAddProduct}
              onImportProducts={handleImportProducts}
              onExportProducts={handleExportProducts}
            />
          ) : (
            <EnhancedProductsTable
              products={productsData}
              categories={categories}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onToggleStock={handleToggleStock}
              onDuplicate={handleDuplicateProduct}
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              onSelectAll={handleSelectAll}
            />
          )}

          {/* Only render the modal if categories are loaded */}
          {Array.isArray(categories) && categories.length > 0 && (
            <MultilingualProductModal
              key={selectedProduct ? selectedProduct.id : 'new'}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveProduct}
              product={selectedProduct ? convertToMultilingualProduct(selectedProduct) : null}
              categories={categories}
            />
          )}
        </div>
      </AdminLayout>
    </AdminAuthGuard>
  );
}
