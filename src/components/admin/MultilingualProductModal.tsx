'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product, MultilingualProduct, LocalizedContent, ProductAttribute, ProductAttributeValue, Category } from '@/types';
import { Button } from '@/components/ui/Button';
import ProductAttributesSection from './ProductAttributesSection';
import ProductVariantsSection from './ProductVariantsSection';
import SEOSection from './SEOSection';
import Image from 'next/image';
import Price from '@/components/ui/Price';
import { formatPercentage } from '@/lib/numberFormatter';
import { DateTimePicker } from '@/components/ui/DateTimePicker';

interface MultilingualProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: MultilingualProduct & { categoryId: string }) => void;
  product: MultilingualProduct | null;
  categories: Category[];
}

type FormDataType = {
  name: LocalizedContent;
  slug: string;
  price: number;
  image: string;
  category: LocalizedContent;
  categoryId: string;
  description: LocalizedContent;
  inStock: boolean;
  rating: number;
  reviews: number;
  // Discount fields
  salePrice?: number | null;
  discountPercent?: number | null;
  onSale: boolean;
  saleStartDate?: Date | string | null;
  saleEndDate?: Date | string | null;
  // End discount fields
  attributes: ProductAttribute[];
  variants: any[]; // Added for variants
  seo: { // Added for SEO
    title: LocalizedContent;
    metaDescription: LocalizedContent;
    keywords: LocalizedContent;
  };
};

export function MultilingualProductModal({ isOpen, onClose, onSave, product, categories }: MultilingualProductModalProps) {
  const { t, isRTL } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>('en');
  const [formData, setFormData] = useState<FormDataType>({
    name: { en: '', ar: '' },
    slug: '',
    price: 0,
    image: '',
    category: { en: '', ar: '' },
    categoryId: '',
    description: { en: '', ar: '' },
    inStock: true,
    rating: 0,
    reviews: 0,
    // Discount fields
    salePrice: null,
    discountPercent: null,
    onSale: false,
    saleStartDate: null,
    saleEndDate: null,
    // End discount fields
    attributes: [],
    variants: [],
    seo: {
      title: { en: '', ar: '' },
      metaDescription: { en: '', ar: '' },
      keywords: { en: '', ar: '' }
    }
  });

  // Image upload states
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageUploadMethod, setImageUploadMethod] = useState<'url' | 'upload'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to handle conversion between old and new data formats
  const convertToLocalizedContent = (value: any): LocalizedContent => {
    if (typeof value === 'string') {
      return { en: value, ar: value }; // Default: same value for both languages
    }
    return value || { en: '', ar: '' };
  };

  useEffect(() => {
    if (product) {
      // Find categoryId by matching English name
      const matchedCategory = categories.find(c => 
        c.name === (typeof product.category === 'string' ? product.category : product.category.en) ||
        c.name_en === (typeof product.category === 'string' ? product.category : product.category.en)
      );
      
      setFormData({
        name: {
          en: product.name?.en || (product as any).name_en || (typeof product.name === 'string' ? product.name : ''),
          ar: product.name?.ar || (product as any).name_ar || ''
        },
        slug: product.slug || '',
        price: product.price || 0,
        image: product.image || '',
        category: {
          en: typeof product.category === 'object' ? 
            (product.category.en || (product.category as any).name_en || '') : 
            ((product as any).category_en || product.category || ''),
          ar: typeof product.category === 'object' ? 
            (product.category.ar || (product.category as any).name_ar || '') : 
            ((product as any).category_ar || product.category || '')
        },
        categoryId: matchedCategory?.id || '',
        description: {
          en: product.description?.en || (product as any).description_en || (typeof product.description === 'string' ? product.description : ''),
          ar: product.description?.ar || (product as any).description_ar || ''
        },
        inStock: product.inStock !== false,
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        // Discount fields
        salePrice: product.salePrice || null,
        discountPercent: product.discountPercent || null,
        onSale: product.onSale || false,
        saleStartDate: product.saleStartDate || null,
        saleEndDate: product.saleEndDate || null,
        attributes: (product.attributes || []).map(attr => ({
          ...attr,
          values: (attr.values || []).map(val => ({
            ...val,
            priceModifier: typeof val.priceModifier === 'number' ? val.priceModifier : (typeof (val as any).price === 'number' ? (val as any).price : 0)
          }))
        })),
        variants: (() => {
          const variants = Array.isArray((product as any).variants) && (product as any).variants.length > 0 ? (product as any).variants : [];
          // Ensure variants have proper structure
          const processedVariants = variants.map((variant: any) => ({
            id: variant.id || `variant-${Date.now()}-${Math.random()}`,
            attributeValues: variant.attributeValues || {},
            price: variant.price,
            image: variant.image || '',
            sku: variant.sku || '',
            inStock: variant.inStock !== false,
            stockQuantity: variant.stockQuantity || 0
          }));
          return processedVariants;
        })(),
        seo: {
          title: (product.seo && product.seo.title) ? product.seo.title : { en: '', ar: '' },
          metaDescription: (product.seo && product.seo.metaDescription) ? product.seo.metaDescription : { en: '', ar: '' },
          keywords: (product.seo && product.seo.keywords) ? product.seo.keywords : { en: '', ar: '' }
        }
      });
      setImagePreview(product.image || '');
    } else {
      setFormData({
        name: { en: '', ar: '' },
        slug: '',
        price: 0,
        image: '',
        category: { en: '', ar: '' },
        categoryId: '',
        description: { en: '', ar: '' },
        inStock: true,
        rating: 0,
        reviews: 0,
        // Discount fields for new products
        salePrice: null,
        discountPercent: null,
        onSale: false,
        saleStartDate: null,
        saleEndDate: null,
        // End discount fields
        attributes: [],
        variants: [],
        seo: {
          title: { en: '', ar: '' },
          metaDescription: { en: '', ar: '' },
          keywords: { en: '', ar: '' }
        }
      });
      setImagePreview('');
    }
  }, [product, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that both languages have content for required fields
    if (!formData.name.en || !formData.name.ar || !formData.categoryId || !formData.price) {
      alert('Please fill in all required fields for both languages and select a category');
      return;
    }

    // Ensure attributes have proper structure before saving
    const processedAttributes = formData.attributes.map(attr => ({
      ...attr,
      // Ensure all required fields are present
      values: attr.values.map(val => ({
        ...val,
        inStock: val.inStock !== false, // Default to true if undefined
        priceModifier: val.priceModifier || 0 // Default to 0 if undefined
      }))
    }));

    const productData: MultilingualProduct & { categoryId: string } = {
      id: product?.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name,
      slug: formData.slug,
      price: formData.price,
      image: formData.image,
      category: formData.category,
      categoryId: formData.categoryId,
      description: formData.description,
      inStock: formData.inStock,
      rating: formData.rating,
      reviews: formData.reviews,
      attributes: processedAttributes,
      variants: formData.variants,
      seo: formData.seo,
      // Add discount fields
      onSale: formData.onSale,
      salePrice: formData.salePrice,
      discountPercent: formData.discountPercent,
      saleStartDate: formData.saleStartDate,
      saleEndDate: formData.saleEndDate
    };
    
    // Validate attributes before saving
    const validationErrors: string[] = [];
    processedAttributes.forEach((attr, index) => {
      if (!attr.name) validationErrors.push(`Attribute ${index + 1}: Missing name`);
      if (!attr.type) validationErrors.push(`Attribute ${index + 1}: Missing type`);
      if (!attr.values || attr.values.length === 0) {
        validationErrors.push(`Attribute ${index + 1}: No values added`);
      } else {
        attr.values.forEach((val, valIndex) => {
          if (!val.value) validationErrors.push(`Attribute ${index + 1}, Value ${valIndex + 1}: Missing value`);
        });
      }
    });
    
    if (validationErrors.length > 0) {
      alert('Please fix the following issues with attributes:\n\n' + validationErrors.join('\n'));
      return;
    }

    onSave(productData);
  };

  const handleLocalizedInputChange = (
    field: keyof Pick<FormDataType, 'name' | 'category' | 'description' | 'seo'>,
    language: 'en' | 'ar',
    value: string
  ) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: {
          ...prev[field],
          [language]: value
        }
      };
      if (field === 'name' && language === 'en') {
        // Generate a unique slug by adding timestamp
        const baseSlug = value
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        const timestamp = Date.now().toString().slice(-6); // Last 6 digits
        updated.slug = `${baseSlug}-${timestamp}`;
      }
      return updated;
    });
  };

  const handleSimpleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Image handling functions
  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }));
    setImagePreview(url);
  };

  const handleFileUpload = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        // In a real app, you would upload to a server and get back a URL
        // For now, we'll use the data URL as a placeholder
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleFileUpload(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Category select handler
  const handleCategoryChange = (categoryId: string) => {
    const selected = categories.find(c => c.id === categoryId);
    setFormData(prev => ({
      ...prev,
      categoryId,
      category: selected ? { 
        en: selected.name_en || selected.name, 
        ar: selected.name_ar || selected.name 
      } : { en: '', ar: '' },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {product ? t('admin.products.editProduct') : t('admin.products.addProduct')} (Multilingual)
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

        <form onSubmit={handleSubmit} className="mt-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column - Basic Information */}
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Basic Information
                </h4>
                
          {/* Product Name */}
                <div className="space-y-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  <p className="text-xs text-gray-500">
              {selectedLanguage === 'en' ? 'Arabic' : 'English'}: {formData.name[selectedLanguage === 'en' ? 'ar' : 'en'] || 'Not filled'}
            </p>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              required
              placeholder="e.g. wireless-headphones"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              The slug is used in the product URL and should be unique.
            </p>
          </div>

          {/* Category */}
                <div className="space-y-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category ({selectedLanguage === 'en' ? 'English' : 'Arabic'}) *
            </label>
            <select
              value={formData.categoryId}
              onChange={e => handleCategoryChange(e.target.value)}
              required
              className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${selectedLanguage === 'ar' ? 'text-right' : 'text-left'}`}
              dir={selectedLanguage === 'ar' ? 'rtl' : 'ltr'}
            >
              <option value="">{selectedLanguage === 'en' ? 'Select category' : 'اختر الفئة'}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {selectedLanguage === 'ar' ? cat.name_ar : cat.name_en}
                </option>
              ))}
            </select>
                  <p className="text-xs text-gray-500">
              {selectedLanguage === 'en' ? 'Arabic' : 'English'}: {formData.category[selectedLanguage === 'en' ? 'ar' : 'en'] || 'Not filled'}
            </p>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      <Image src="/icons/Saudi_Riyal_Symbo.svg" alt="Riyal" width={18} height={18} style={{ display: 'inline-block' }} />
                    </span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleSimpleInputChange('price', parseFloat(e.target.value) || 0)}
                      required
                      step="0.01"
                      min="0"
                      className="w-full p-3 pl-8 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
          </div>

          {/* Description */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Description
                </h4>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Description ({selectedLanguage === 'en' ? 'English' : 'Arabic'})
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
                  <p className="text-xs text-gray-500">
              {selectedLanguage === 'en' ? 'Arabic' : 'English'}: {formData.description[selectedLanguage === 'en' ? 'ar' : 'en'] || 'Not filled'}
            </p>
          </div>
              </div>
            </div>

            {/* Right Column - Media & Settings */}
            <div className="space-y-6">
              
              {/* Image Upload */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  {t('admin.products.imageUpload.title')}
                </h4>
                
                {/* Image Upload Method Toggle */}
                <div className="flex space-x-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setImageUploadMethod('url')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      imageUploadMethod === 'url'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('admin.products.imageUpload.urlInput')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadMethod('upload')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      imageUploadMethod === 'upload'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {t('admin.products.imageUpload.fileUpload')}
                  </button>
                </div>

                {/* Image Upload Area */}
                <div className="space-y-4">
                  {imageUploadMethod === 'url' ? (
                    // URL Input
            <div>
              <input
                type="url"
                value={formData.image}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        placeholder={t('admin.products.imageUpload.urlPlaceholder')}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
                  ) : (
                    // File Upload
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragOver
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="space-y-4">
                        <div className="text-4xl">📁</div>
                        <div>
                          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            {t('admin.products.imageUpload.dropImage')}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('admin.products.imageUpload.orClickToBrowse')}
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={triggerFileInput}
                          variant="outline"
                          className="mx-auto"
                        >
                          {t('admin.products.imageUpload.chooseFile')}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('admin.products.imageUpload.imagePreview')}
                      </label>
                      <div className="relative w-32 h-32 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/images/products/placeholder.jpg';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, image: '' }));
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Settings */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Product Settings
                </h4>
                <div className="space-y-4">
                  {/* Stock Status */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.inStock}
                        onChange={(e) => handleSimpleInputChange('inStock', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        In Stock
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Discount Settings */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Settings
                  </h4>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.onSale}
                      onChange={(e) => {
                        const onSale = e.target.checked;
                        setFormData(prev => ({ 
                          ...prev, 
                          onSale,
                          // Reset discount fields if turning off sale
                          ...(onSale ? {} : {
                            salePrice: null,
                            discountPercent: null,
                            saleStartDate: null,
                            saleEndDate: null
                          })
                        }));
                      }}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      Enable Sale
                    </span>
                  </label>
                </div>

                {formData.onSale && (
                  <div className="space-y-4">
                    {/* Sale Price Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sale Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          <Image src="/icons/Saudi_Riyal_Symbo.svg" alt="Riyal" width={18} height={18} style={{ display: 'inline-block' }} />
                        </span>
                        <input
                          type="number"
                          value={formData.salePrice || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setFormData(prev => ({ 
                              ...prev, 
                              salePrice: isNaN(value) ? null : value
                            }));
                          }}
                          step="0.01"
                          min="0"
                          max={formData.price - 0.01}
                          className="w-full p-3 pl-8 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder={`Must be less than ${formData.price}`}
                        />
                      </div>
                      {formData.salePrice && formData.salePrice >= formData.price && (
                        <p className="text-red-500 text-xs mt-1">
                          Sale price must be less than regular price
                        </p>
                      )}
                      {formData.salePrice && formData.price > 0 && formData.salePrice < formData.price && (
                        <p className="text-green-600 text-xs mt-1">
                          Discount: {formatPercentage(Math.round(((formData.price - formData.salePrice) / formData.price) * 100), isRTL ? 'ar' : 'en')} {t('discount.off')}
                        </p>
                      )}
                    </div>

                    {/* Discount Percentage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Discount Percentage
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.discountPercent || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            setFormData(prev => ({ 
                              ...prev, 
                              discountPercent: isNaN(value) ? null : Math.min(Math.max(value, 0), 99)
                            }));
                          }}
                          step="1"
                          min="0"
                          max="99"
                          className="w-full p-3 pr-8 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Enter percentage (1-99)"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                      {formData.discountPercent && formData.price > 0 && (
                        <p className="text-green-600 text-xs mt-1">
                          Sale price will be: <Price amount={formData.price * (1 - formData.discountPercent / 100)} locale="en" className="font-semibold" />
                        </p>
                      )}
                    </div>

                    {/* Sale Duration */}
                    <div className="space-y-4">
                      <DateTimePicker
                        label="Sale Start Date"
                        value={formData.saleStartDate}
                        onChange={(value) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            saleStartDate: value
                          }));
                        }}
                        placeholder="Select when the sale should start"
                      />
                      
                      <DateTimePicker
                        label="Sale End Date"
                        value={formData.saleEndDate}
                        onChange={(value) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            saleEndDate: value
                          }));
                        }}
                        min={(() => {
                          if (!formData.saleStartDate) return undefined;
                          if (typeof formData.saleStartDate === 'string') {
                            return formData.saleStartDate;
                          }
                          return formData.saleStartDate?.toISOString().slice(0, 16);
                        })()}
                        placeholder="Select when the sale should end"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Attributes Section */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Product Attributes</h4>
                <ProductAttributesSection
                  attributes={formData.attributes}
                  setAttributes={(attributes) => setFormData(prev => ({ ...prev, attributes }))}
                  selectedLanguage={selectedLanguage}
                />
              </div>

              {/* Variants Section */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Product Variants</h4>
                <ProductVariantsSection
                  key={`${product?.id || 'new'}`}
                  attributes={formData.attributes}
                  variants={formData.variants || []}
                  setVariants={(variants) => setFormData(prev => ({ ...prev, variants }))}
                  selectedLanguage={selectedLanguage}
                />
              </div>

              {/* SEO Section */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">SEO Settings</h4>
                <SEOSection
                  seo={formData.seo || { title: { en: '', ar: '' }, metaDescription: { en: '', ar: '' }, keywords: { en: '', ar: '' } }}
                  setSEO={(seo) => setFormData(prev => ({ ...prev, seo }))}
                  selectedLanguage={selectedLanguage}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6 ${isRTL ? 'space-x-reverse' : ''}`}>
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
