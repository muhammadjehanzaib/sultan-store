'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { MultilingualProductModal } from '@/components/admin/MultilingualProductModal';
import { Button } from '@/components/ui/Button';
import { products } from '@/data/products';
import { Product, MultilingualProduct, Category } from '@/types';
import { convertToLegacyProduct, convertToMultilingualProduct } from '@/lib/multilingualUtils';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import Price from '@/components/ui/Price';

export default function AdminProducts() {
  const { t, isRTL } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productsData, setProductsData] = useState(products);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

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
    fetch('/api/categories')
      .then(res => res.json())
      .then((data: { categories: Category[] }) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  // Helper: Map API product to frontend format
  const apiToProduct = (apiProduct: any): Product => ({
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
    attributes: apiProduct.attributes || [],
    variants: apiProduct.variants || [],
  });

  // Helper: Map frontend product to API format
  const productToApi = (product: MultilingualProduct) => {
    // Find categoryId by matching the English name
    const categoryId = categories.find(
      c => c.name === product.category.en
    )?.id;
    return {
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
      variants: product.variants || [],
      attributes: product.attributes || [],
    };
  };

  // Fetch products from API
  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then(res => res.json())
      .then((data: { products: any[] }) => {
        setProductsData(data.products.map(apiToProduct));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDeleteProduct = async (productId: number) => {
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
    let response, data: any;
    if (isEdit) {
      response = await fetch(`/api/products/${selectedProduct!.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });
      data = await response.json();
      if (response.ok) {
        setProductsData(prev => prev.map(p => p.id === selectedProduct!.id ? apiToProduct(data.product) : p));
      }
    } else {
      response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });
      data = await response.json();
      if (response.ok) {
        setProductsData(prev => [apiToProduct(data.product), ...prev]);
      }
    }
    setIsModalOpen(false);
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

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
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
          <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('admin.products.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {t('admin.products.subtitle')}
              </p>
            </div>
            <Button onClick={handleAddProduct} className="bg-blue-600 hover:bg-blue-700">
              {t('admin.products.addProduct')}
            </Button>
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

          <ProductsTable
            products={productsData}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            selectedProducts={selectedProducts}
            onSelectProduct={handleSelectProduct}
            onSelectAll={handleSelectAll}
          />

          {/* Only render the modal if categories are loaded */}
          {Array.isArray(categories) && categories.length > 0 && (
            <MultilingualProductModal
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
