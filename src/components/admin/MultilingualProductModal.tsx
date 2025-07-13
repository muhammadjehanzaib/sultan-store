'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product, MultilingualProduct, LocalizedContent, ProductAttribute, ProductAttributeValue } from '@/types';
import { Button } from '@/components/ui/Button';

interface MultilingualProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: MultilingualProduct) => void;
  product: Product | null;
}

type FormDataType = {
  name: LocalizedContent;
  price: number;
  image: string;
  category: LocalizedContent;
  description: LocalizedContent;
  inStock: boolean;
  rating: number;
  reviews: number;
  attributes: ProductAttribute[];
};

export function MultilingualProductModal({ isOpen, onClose, onSave, product }: MultilingualProductModalProps) {
  const { t, isRTL } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>('en');
  const [formData, setFormData] = useState<FormDataType>({
    name: { en: '', ar: '' },
    price: 0,
    image: '',
    category: { en: '', ar: '' },
    description: { en: '', ar: '' },
    inStock: true,
    rating: 0,
    reviews: 0,
    attributes: []
  });

  // Add states for managing attributes
  const [showAttributeForm, setShowAttributeForm] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<ProductAttribute | null>(null);
  const [newAttribute, setNewAttribute] = useState<ProductAttribute>({
    id: '',
    name: '',
    type: 'color',
    values: [],
    required: false
  });

  // Helper function to handle conversion between old and new data formats
  const convertToLocalizedContent = (value: any): LocalizedContent => {
    if (typeof value === 'string') {
      return { en: value, ar: value }; // Default: same value for both languages
    }
    return value || { en: '', ar: '' };
  };

  useEffect(() => {
    if (product) {
      setFormData({
        name: convertToLocalizedContent(product.name),
        price: product.price || 0,
        image: product.image || '',
        category: convertToLocalizedContent(product.category),
        description: convertToLocalizedContent(product.description),
        inStock: product.inStock !== false,
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        attributes: product.attributes || []
      });
    } else {
      setFormData({
        name: { en: '', ar: '' },
        price: 0,
        image: '',
        category: { en: '', ar: '' },
        description: { en: '', ar: '' },
        inStock: true,
        rating: 0,
        reviews: 0,
        attributes: []
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that both languages have content for required fields
    if (!formData.name.en || !formData.name.ar || 
        !formData.category.en || !formData.category.ar || 
        !formData.price) {
      alert('Please fill in all required fields for both languages');
      return;
    }

    const productData: MultilingualProduct = {
      id: product?.id || Date.now(),
      name: formData.name,
      price: formData.price,
      image: formData.image,
      category: formData.category,
      description: formData.description,
      inStock: formData.inStock,
      rating: formData.rating,
      reviews: formData.reviews,
      attributes: formData.attributes
    };

    onSave(productData);
  };

  const handleLocalizedInputChange = (
    field: keyof Pick<FormDataType, 'name' | 'category' | 'description'>,
    language: 'en' | 'ar',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [language]: value
      }
    }));
  };

  const handleSimpleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  const categories = [
    { en: 'Electronics', ar: 'الإلكترونيات' },
    { en: 'Fashion', ar: 'الأزياء' },
    { en: 'Home & Kitchen', ar: 'المنزل والمطبخ' },
    { en: 'Sports', ar: 'الرياضة' },
    { en: 'Books', ar: 'الكتب' },
    { en: 'Beauty', ar: 'الجمال' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {product ? 'Edit Product' : 'Add Product'} (Multilingual)
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

        {/* Language Selection Tabs */}
        <div className="flex space-x-1 mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setSelectedLanguage('en')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedLanguage === 'en'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🇺🇸 English
          </button>
          <button
            type="button"
            onClick={() => setSelectedLanguage('ar')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedLanguage === 'ar'
                ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🇸🇦 العربية
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Name ({selectedLanguage === 'en' ? 'English' : 'Arabic'}) *
            </label>
            <input
              type="text"
              value={formData.name[selectedLanguage]}
              onChange={(e) => handleLocalizedInputChange('name', selectedLanguage, e.target.value)}
              required
              className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                selectedLanguage === 'ar' ? 'text-right' : 'text-left'
              }`}
              placeholder={selectedLanguage === 'en' ? 'Enter product name in English' : 'أدخل اسم المنتج بالعربية'}
              dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
            />
            {/* Show preview of the other language */}
            <p className="mt-1 text-xs text-gray-500">
              {selectedLanguage === 'en' ? 'Arabic' : 'English'}: {formData.name[selectedLanguage === 'en' ? 'ar' : 'en'] || 'Not filled'}
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category ({selectedLanguage === 'en' ? 'English' : 'Arabic'}) *
            </label>
            <select
              value={formData.category[selectedLanguage]}
              onChange={(e) => handleLocalizedInputChange('category', selectedLanguage, e.target.value)}
              required
              className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                selectedLanguage === 'ar' ? 'text-right' : 'text-left'
              }`}
              dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
            >
              <option value="">
                {selectedLanguage === 'en' ? 'Select category' : 'اختر التصنيف'}
              </option>
              {categories.map((cat, index) => (
                <option key={index} value={cat[selectedLanguage]}>
                  {cat[selectedLanguage]}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {selectedLanguage === 'en' ? 'Arabic' : 'English'}: {formData.category[selectedLanguage === 'en' ? 'ar' : 'en'] || 'Not filled'}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description ({selectedLanguage === 'en' ? 'English' : 'Arabic'})
            </label>
            <textarea
              value={formData.description[selectedLanguage]}
              onChange={(e) => handleLocalizedInputChange('description', selectedLanguage, e.target.value)}
              rows={4}
              className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                selectedLanguage === 'ar' ? 'text-right' : 'text-left'
              }`}
              placeholder={selectedLanguage === 'en' ? 'Enter product description in English' : 'أدخل وصف المنتج بالعربية'}
              dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
            />
            <p className="mt-1 text-xs text-gray-500">
              {selectedLanguage === 'en' ? 'Arabic' : 'English'}: {formData.description[selectedLanguage === 'en' ? 'ar' : 'en'] || 'Not filled'}
            </p>
          </div>

          {/* Non-localized fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleSimpleInputChange('price', parseFloat(e.target.value) || 0)}
                required
                step="0.01"
                min="0"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => handleSimpleInputChange('image', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating (0-5)
              </label>
              <input
                type="number"
                value={formData.rating}
                onChange={(e) => handleSimpleInputChange('rating', parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0"
                max="5"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Reviews
              </label>
              <input
                type="number"
                value={formData.reviews}
                onChange={(e) => handleSimpleInputChange('reviews', parseInt(e.target.value) || 0)}
                min="0"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Stock Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => handleSimpleInputChange('inStock', e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                In Stock
              </span>
            </label>
          </div>

          {/* Attributes Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Attributes</h3>
            {formData.attributes.map((attribute, index) => (
              <div key={index} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">{attribute.name} ({attribute.type})</h4>
                  <button
                    className="text-red-500"
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        attributes: prev.attributes.filter((_, i) => i !== index)
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>

                {/* Attribute Values */}
                <div className="mt-2 space-y-2">
                  {attribute.values.map((value, vIndex) => (
                    <div 
                      key={vIndex} 
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded-md"
                    >
                      <span className="text-gray-900 dark:text-white">
                        {value.value} {attribute.type === 'color' && value.hexColor && (
                          <span 
                            className="inline-block w-4 h-4 ml-2 rounded-full border"
                            style={{ backgroundColor: value.hexColor }}
                          ></span>
                        )}
                      </span>
                      <button
                        className="text-red-500"
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            attributes: prev.attributes.map((attr, aIndex) =>
                              aIndex === index
                                ? { ...attr, values: attr.values.filter((_, valIndex) => valIndex !== vIndex) }
                                : attr
                            )
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Value */}
                <div className="mt-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder={attribute.type === 'color' ? 'Enter color name or hex code (#FF0000)' : 'Enter value'}
                      className="flex-1 p-2 border border-gray-300 rounded"
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          const value = e.currentTarget.value.trim();
                          if (!value) return;

                          const newValue: ProductAttributeValue = {
                            id: value.toLowerCase().replace(/\s+/g, '-'),
                            value,
                            hexColor: attribute.type === 'color' && value.startsWith('#') ? value : undefined
                          };

                          setFormData(prev => ({
                            ...prev,
                            attributes: prev.attributes.map((attr, aIndex) =>
                              aIndex === index
                                ? { ...attr, values: [...attr.values, newValue] }
                                : attr
                            )
                          }));

                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        const value = input.value.trim();
                        if (!value) return;

                        const newValue: ProductAttributeValue = {
                          id: value.toLowerCase().replace(/\s+/g, '-'),
                          value,
                          hexColor: attribute.type === 'color' && value.startsWith('#') ? value : undefined
                        };

                        setFormData(prev => ({
                          ...prev,
                          attributes: prev.attributes.map((attr, aIndex) =>
                            aIndex === index
                              ? { ...attr, values: [...attr.values, newValue] }
                              : attr
                          )
                        }));

                        input.value = '';
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Attribute */}
            <div className="mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                onClick={() => setShowAttributeForm(true)}
              >
                <span className="mr-2">+</span> Add Attribute
              </button>
            </div>

            {showAttributeForm && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white">New Attribute</h4>
                <input
                  type="text"
                  placeholder="Attribute Name"
                  value={newAttribute.name}
                  onChange={e => setNewAttribute({ ...newAttribute, name: e.target.value })}
                  className="w-full p-2 mb-2 border"
                />
                <select
                  value={newAttribute.type}
                  onChange={e => setNewAttribute({ ...newAttribute, type: e.target.value as any })}
                  className="w-full p-2 mb-2 border"
                >
                  <option value="color">Color</option>
                  <option value="size">Size</option>
                  <option value="material">Material</option>
                  <option value="style">Style</option>
                </select>
                <button
                  type="button"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
                  onClick={() => {
                    if (!newAttribute.name.trim()) {
                      alert('Please enter an attribute name');
                      return;
                    }
                    
                    const attributeToAdd = {
                      ...newAttribute,
                      id: newAttribute.name.toLowerCase().replace(/\s+/g, '-')
                    };
                    
                    setFormData(prev => ({
                      ...prev,
                      attributes: [...prev.attributes, attributeToAdd]
                    }));
                    setNewAttribute({ id: '', name: '', type: 'color', values: [], required: false });
                    setShowAttributeForm(false);
                  }}
                >
                  Save Attribute
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  onClick={() => setShowAttributeForm(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 ${isRTL ? 'space-x-reverse' : ''}`}>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t('common.save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
