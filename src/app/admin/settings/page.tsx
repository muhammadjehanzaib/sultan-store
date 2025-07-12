'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminLayout } from '@/components/admin/AdminLayout';
// import { SettingsNavigation } from '@/components/admin/SettingsNavigation';
// import { SiteSettingsPanel } from '@/components/admin/SiteSettingsPanel';
// import { PaymentSettingsPanel } from '@/components/admin/PaymentSettingsPanel';
// import { ShippingSettingsPanel } from '@/components/admin/ShippingSettingsPanel';
// import { TaxSettingsPanel } from '@/components/admin/TaxSettingsPanel';
// import { EmailTemplatesPanel } from '@/components/admin/EmailTemplatesPanel';

export default function AdminSettings() {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('site');

  // const renderSettingsPanel = () => {
  //   switch (activeTab) {
  //     case 'site':
  //       return <SiteSettingsPanel />;
  //     case 'payment':
  //       return <PaymentSettingsPanel />;
  //     case 'shipping':
  //       return <ShippingSettingsPanel />;
  //     case 'tax':
  //       return <TaxSettingsPanel />;
  //     case 'email':
  //       return <EmailTemplatesPanel />;
  //     default:
  //       return <SiteSettingsPanel />;
  //   }
  // };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.settings.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('admin.settings.subtitle')}
          </p>
        </div>

        {/* <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SettingsNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
            />
          </div>
          
          <div className="lg:col-span-3">
            {renderSettingsPanel()}
          </div>
        </div> */}
      </div>
    </AdminLayout>
  );
}
