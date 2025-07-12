'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { ProductModal } from '@/components/admin/ProductModal';
import { Button } from '@/components/ui/Button';
import { products } from '@/data/products';
import { Product } from '@/types';

export default function AdminProducts() {
  const { t, isRTL } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productsData, setProductsData] = useState(products);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId: number) => {
    setProductsData(prev => prev.filter(p => p.id !== productId));
  };

  const handleSaveProduct = (product: Product) => {
    if (selectedProduct) {
      // Edit existing product
      setProductsData(prev => 
        prev.map(p => p.id === product.id ? product : p)
      );
    } else {
      // Add new product
      const newProduct = {
        ...product,
        id: Math.max(...productsData.map(p => p.id)) + 1
      };
      setProductsData(prev => [...prev, newProduct]);
    }
    setIsModalOpen(false);
  };

  return (
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

        <ProductsTable
          products={productsData}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />

        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
          product={selectedProduct}
        />
      </div>
    </AdminLayout>
  );
}
