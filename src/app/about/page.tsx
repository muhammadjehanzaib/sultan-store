'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Footer } from '@/components';

export default function AboutPage() {
  const { t, isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('about.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Our Story */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('about.ourStory')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('about.storyText1')}
            </p>
            <p className="text-gray-600">
              {t('about.storyText2')}
            </p>
          </div>

          {/* Our Mission */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('about.ourMission')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('about.missionText')}
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                {t('about.missionPoint1')}
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                {t('about.missionPoint2')}
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                {t('about.missionPoint3')}
              </li>
            </ul>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {t('about.whyChooseUs')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('about.feature1Title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('about.feature1Desc')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('about.feature2Title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('about.feature2Desc')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('about.feature3Title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('about.feature3Desc')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('about.feature4Title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('about.feature4Desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {t('about.ourTeam')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-white">👨‍💼</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {t('about.ceoName')}
              </h3>
              <p className="text-purple-600 text-sm mb-2">
                {t('about.ceoTitle')}
              </p>
              <p className="text-gray-600 text-sm">
                {t('about.ceoDesc')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-white">👩‍💻</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {t('about.ctoName')}
              </h3>
              <p className="text-purple-600 text-sm mb-2">
                {t('about.ctoTitle')}
              </p>
              <p className="text-gray-600 text-sm">
                {t('about.ctoDesc')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-white">👨‍🎨</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {t('about.designerName')}
              </h3>
              <p className="text-purple-600 text-sm mb-2">
                {t('about.designerTitle')}
              </p>
              <p className="text-gray-600 text-sm">
                {t('about.designerDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-purple-600 rounded-lg shadow-sm p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-purple-100">{t('about.stat1')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">10K+</div>
              <div className="text-purple-100">{t('about.stat2')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">99.9%</div>
              <div className="text-purple-100">{t('about.stat3')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-purple-100">{t('about.stat4')}</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('about.ctaTitle')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('about.ctaSubtitle')}
          </p>
          <div className={`flex justify-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              {t('about.startShopping')}
            </button>
            <button 
              onClick={() => window.location.href = '/contact'}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              {t('about.contactUs')}
            </button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}
