'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductsTable } from '@/components/admin/ProductsTable';
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
  const apiToProduct = (apiProduct: any): Product => {
    if (!apiProduct || !apiProduct.id) {
      console.error('Invalid API product data:', apiProduct);
      throw new Error('Invalid product data received from API');
    }

    console.log('apiToProduct: Converting API product:', apiProduct.id, 'variants:', apiProduct.variants?.length || 0);
    console.log('apiToProduct: Raw API product:', JSON.stringify(apiProduct, null, 2));

    // Process attributes properly
    const processedAttributes = (apiProduct.attributes || []).map((attr: any) => {
      console.log('🔍 Processing attribute:', attr.name, 'type:', attr.type, 'values count:', attr.values?.length || 0);
      console.log('🔍 Raw attribute data:', JSON.stringify(attr, null, 2));
      return {
        id: attr.id,
        name: attr.name,
        type: attr.type,
        required: attr.required || false,
        values: (attr.values || []).map((val: any) => {
          console.log('🔍 Processing attribute value:', val.value, 'label:', val.label);
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
      console.log('Processing variant:', variant.id, 'attributeValues relation:', variant.attributeValues);

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
        console.log('Converted relational attributeValues to:', attributeValues);
      } else if (variant.attributeValues) {
        // Legacy structure: direct object or JSON string
        if (typeof variant.attributeValues === 'string') {
          try {
            attributeValues = JSON.parse(variant.attributeValues);
          } catch (e) {
            console.error('Failed to parse attributeValues:', variant.attributeValues);
            attributeValues = {};
          }
        } else if (typeof variant.attributeValues === 'object') {
          attributeValues = variant.attributeValues;
        }
      }

      // Initialize attributeValues with default values if empty and attributes exist
      if (Object.keys(attributeValues).length === 0 && processedAttributes.length > 0) {
        console.log('Initializing empty attributeValues for variant:', variant.id);
        processedAttributes.forEach((attr: ProductAttribute) => {
          if (attr.values && attr.values.length > 0) {
            attributeValues[attr.id] = attr.values[0].id; // Use first available value as default
          }
        });
        console.log('Initialized attributeValues:', attributeValues);
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

      console.log('Processed variant:', processedVariant);
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

    console.log('🔍 apiToProduct: Final converted product:', {
      id: product.id,
      name: product.name,
      attributeCount: product.attributes?.length || 0
    });
    console.log('🔍 apiToProduct: Final product attributes:', product.attributes);
    
    // Validate attributes structure
    if (product.attributes && product.attributes.length > 0) {
      product.attributes.forEach((attr: any, index: number) => {
        console.log(`🔍 Attribute ${index + 1}:`, {
          id: attr.id,
          name: attr.name,
          type: attr.type,
          valueCount: attr.values?.length || 0
        });
      });
    }
    
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
      variants: product.variants || [],
      attributes: product.attributes || [],
    };

    return apiData;
  };

  // Fetch products from API
  useEffect(() => {
    setLoading(true);
    fetch('/api/products?includeRelations=true')
      .then(res => res.json())
      .then((data: any) => {
        console.log('API Response:', data);
        // Handle both direct array and wrapped response
        const products = Array.isArray(data) ? data : (data.products || []);
        console.log('Products to process:', products);
        setProductsData(products.map(apiToProduct));
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
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
          const refreshResponse = await fetch(`/api/products?includeRelations=true`);
          const refreshData = await refreshResponse.json();
          const products = Array.isArray(refreshData) ? refreshData : (refreshData.products || []);
          const updatedProduct = products.find((p: any) => p.id === selectedProduct!.id);
          if (updatedProduct) {
            setProductsData(prev => prev.map(p => p.id === selectedProduct!.id ? apiToProduct(updatedProduct) : p));
          }
        } else {
          console.error('Update failed:', data);
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
          const refreshResponse = await fetch(`/api/products?includeRelations=true`);
          const refreshData = await refreshResponse.json();
          const products = Array.isArray(refreshData) ? refreshData : (refreshData.products || []);
          setProductsData(products.map(apiToProduct));
        } else {
          console.error('Create failed:', data);
          alert(`Failed to create product: ${data.error || 'Unknown error'}`);
          return;
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Network error:', error);
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
