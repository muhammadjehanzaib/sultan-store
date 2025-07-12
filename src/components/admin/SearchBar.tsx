'use client';

import { useLanguage } from '@/contexts/LanguageContext';
// import { Input } from '@/components/ui/Input';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-md">
      {/* <Input
        type="text"
        placeholder={t('admin.products.searchPlaceholder')}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full"
      /> */}
    </div>
  );
}
