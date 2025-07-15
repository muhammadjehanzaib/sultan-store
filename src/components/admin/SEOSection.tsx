import React from 'react';
import { LocalizedContent } from '@/types';

interface SEOSectionProps {
  seo: {
    title: LocalizedContent;
    metaDescription: LocalizedContent;
    keywords: LocalizedContent;
  };
  setSEO: (seo: any) => void;
  selectedLanguage: 'en' | 'ar';
}

const SEOSection: React.FC<SEOSectionProps> = ({ seo, setSEO, selectedLanguage }) => {
  const handleChange = (field: keyof typeof seo, lang: 'en' | 'ar', value: string) => {
    setSEO({
      ...seo,
      [field]: {
        ...seo[field],
        [lang]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">SEO Title ({selectedLanguage === 'en' ? 'English' : 'Arabic'})</label>
        <input
          type="text"
          value={seo.title[selectedLanguage]}
          onChange={e => handleChange('title', selectedLanguage, e.target.value)}
          className="w-full p-2 border rounded"
          placeholder={selectedLanguage === 'en' ? 'SEO Title in English' : 'عنوان السيو بالعربية'}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Meta Description ({selectedLanguage === 'en' ? 'English' : 'Arabic'})</label>
        <textarea
          value={seo.metaDescription[selectedLanguage]}
          onChange={e => handleChange('metaDescription', selectedLanguage, e.target.value)}
          className="w-full p-2 border rounded"
          placeholder={selectedLanguage === 'en' ? 'Meta description in English' : 'وصف الميتا بالعربية'}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Keywords ({selectedLanguage === 'en' ? 'English' : 'Arabic'})</label>
        <input
          type="text"
          value={seo.keywords[selectedLanguage]}
          onChange={e => handleChange('keywords', selectedLanguage, e.target.value)}
          className="w-full p-2 border rounded"
          placeholder={selectedLanguage === 'en' ? 'Keywords in English' : 'الكلمات المفتاحية بالعربية'}
        />
      </div>
    </div>
  );
};

export default SEOSection; 