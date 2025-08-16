'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { scrollToElement } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { AuthModal } from '@/components/auth/AuthModal';
import { Logo } from '@/components/ui/Logo';
import { CategoryMegaMenu } from '@/components/navigation/CategoryMegaMenu';
import { CategoryWithChildren } from '@/lib/categoryUtils';
import { 
  IoSearch, 
  IoCart, 
  IoMenu, 
  IoClose, 
  IoChevronDown,
  IoHome,
  IoStorefront,
  IoCall,
  IoInformationCircle
} from 'react-icons/io5';
import { 
  HiUser, 
  HiCog, 
  HiLocationMarker, 
  HiLogout,
  HiShoppingBag
} from 'react-icons/hi';

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onSearchClick?: () => void;
  onLogoClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount = 0,
  onCartClick,
  onSearchClick,
  onLogoClick,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isTabletProductsDropdownOpen, setIsTabletProductsDropdownOpen] = useState(false);
  const { t, isRTL, language } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const productsDropdownRef = useRef<HTMLDivElement>(null);
  const tabletProductsDropdownRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      setCategoriesLoading(true);
      try {
        const response = await fetch('/api/categories/tree');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        const categories = data.tree || [];
        setCategories(categories);
      } catch (error) {
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target as Node)) {
        setIsProductsDropdownOpen(false);
      }
      if (tabletProductsDropdownRef.current && !tabletProductsDropdownRef.current.contains(event.target as Node)) {
        setIsTabletProductsDropdownOpen(false);
      }
    }

    if (isProfileDropdownOpen || isProductsDropdownOpen || isTabletProductsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isProfileDropdownOpen, isProductsDropdownOpen, isTabletProductsDropdownOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleMobileNavClick = (action: () => void) => {
    action();
    closeMobileMenu();
  };

  const handleHomeNavigation = () => {
    // Check if we're on the home page
    if (window.location.pathname === '/') {
      // We're on the home page, just scroll to featured products
      scrollToElement('featured-products');
    } else {
      // We're on another page, navigate to home
      router.push('/');
    }
  };

  const handleCategoryNavigation = (categorySlug: string) => {
    router.push(`/category/${categorySlug}`);
  };

  const handleAboutNavigation = () => {
    router.push('/about');
  };

  const handleContactNavigation = () => {
    router.push('/contact');
  };
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-2">
          {/* Logo */}
          <div className="flex items-center">
            <Logo
              variant="default"
              size="sm"
              onClick={onLogoClick}
              className="hover:scale-105 transition-transform duration-200"
            />
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className={`hidden lg:flex ${isRTL ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
            <button
              onClick={handleHomeNavigation}
              className="text-gray-500 hover:text-gray-900 transition-colors mx-4"
            >
              {t('nav.home')}
            </button>

            <div className="relative flex items-center bg-gray-50 rounded-lg border border-gray-200 w-[500px]">
              {/* CategoryMegaMenu */}
              <div className="flex-shrink-0">
                {!categoriesLoading && categories.length > 0 ? (
                  <CategoryMegaMenu 
                    categories={categories}
                    className="border-r border-gray-200 rounded-l-lg"
                  />
                ) : (
                  <button
                    className={`w-[140px] px-4 py-2 text-gray-600 bg-gray-100 border-r border-gray-200 rounded-l-lg ${isRTL ? 'space-x-reverse' : ''}`}
                    disabled
                  >
                    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                      <span>{categoriesLoading ? 'Loading...' : 'No Categories'}</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Search Field */}
              <button
                onClick={onSearchClick}
                className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors w-full"
              >
                <IoSearch className="text-lg mr-2 text-gray-500" />
                <span className="text-sm truncate">{t('search.placeholder')}</span>
              </button>
            </div>

          </nav>

          {/* Tablet Navigation - Hidden on mobile and desktop */}
          <nav className={`hidden md:flex lg:hidden ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
            {/* Combined All Products and Search Component - Tablet */}
            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 w-80">
              {/* All Products Dropdown - Tablet Only */}
              <div
                className="relative z-50"
                ref={tabletProductsDropdownRef}
              >
                <button
                  onClick={() => setIsTabletProductsDropdownOpen(!isTabletProductsDropdownOpen)}
                  className={`px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 ease-in-out flex items-center justify-between border-r border-gray-200 whitespace-nowrap font-medium shadow-sm hover:shadow-md rounded-l-lg ${isRTL ? 'space-x-reverse' : ''}`}
                >
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                    <span className="text-lg">🏷️</span>
                    <span className="text-sm">{t('nav.allCategories')}</span>
                  </div>
                  <IoChevronDown className={`text-sm transition-transform duration-200 ${isTabletProductsDropdownOpen ? 'rotate-180' : ''} flex-shrink-0`} />
                </button>

                {/* Dropdown Menu */}
                {isTabletProductsDropdownOpen && (
                  <div className={`absolute top-full mt-2 w-56 bg-white rounded-lg shadow-xl border py-2 z-[100] ${isRTL ? 'right-0' : 'left-0'}`}>
                    {categoriesLoading ? (
                      <div className="px-4 py-2 text-gray-400 text-sm">Loading...</div>
                    ) : categories.length === 0 ? (
                      <div className="px-4 py-2 text-gray-400 text-sm">No categories</div>
                    ) : categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          handleCategoryNavigation(category.path || category.slug);
                          setIsTabletProductsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center ${isRTL ? 'text-right space-x-reverse space-x-3' : 'text-left space-x-3'}`}
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span>{language === 'ar' ? category.name_ar : category.name_en}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Field - Tablet */}
              <button
                onClick={onSearchClick}
                className="flex items-center px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors min-w-0 flex-1"
              >
                <IoSearch className="text-lg mr-2 text-gray-500" />
                <span className="text-sm truncate">{t('search.placeholder')}</span>
              </button>
            </div>
          </nav>

          {/* Actions */}
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
            {/* Search Button - Mobile Only */}
            <button
              onClick={onSearchClick}
              className="md:hidden flex items-center justify-center w-10 h-10 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              aria-label="Search"
              title="Search (Ctrl+K)"
            >
              <IoSearch className="text-lg" />
            </button>

            {/* Language Switcher - Desktop Only */}
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>

            {/* Notifications - Desktop Only */}
            <NotificationBell className="hidden lg:block" />

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative flex items-center justify-center w-10 h-10 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              aria-label="Shopping Cart"
            >
              <span className="sr-only">Cart</span>
              <IoCart className="text-lg" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            {/* Auth/Profile - Desktop Only */}
            <div className={`hidden lg:flex items-center ${isRTL ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
              {isAuthenticated && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className={`flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}
                  >
                    <HiUser className="text-lg" />
                    <span>{user.firstName || user.name}</span>
                    <IoChevronDown className="text-sm" />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className={`absolute mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50 ${isRTL ? 'left-0' : 'right-0'}`}>
                      {/* Show profile links only for non-guest users */}
                      {!user.isGuest && (
                        <>
                          <button
                            onClick={() => {
                              router.push('/profile');
                              setIsProfileDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center ${isRTL ? 'text-right space-x-reverse space-x-3' : 'text-left space-x-3'}`}
                          >
                            <span className="text-lg">👤</span>
                            <span>{t('profile.myProfile')}</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push('/orders');
                              setIsProfileDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center ${isRTL ? 'text-right space-x-reverse space-x-3' : 'text-left space-x-3'}`}
                          >
                            <span className="text-lg">📦</span>
                            <span>{t('profile.myOrders')}</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push('/profile?section=addresses');
                              setIsProfileDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center ${isRTL ? 'text-right space-x-reverse space-x-3' : 'text-left space-x-3'}`}
                          >
                            <span className="text-lg">📍</span>
                            <span>{t('profile.myAddresses')}</span>
                          </button>
                          {/* Show admin panel button only for admin, manager, and support roles */}
                          {['admin', 'manager', 'support'].includes(user.role) && (
                            <button
                              onClick={() => {
                                router.push('/admin');
                                setIsProfileDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center ${isRTL ? 'text-right space-x-reverse space-x-3' : 'text-left space-x-3'}`}
                            >
                              <span className="text-lg">⚙️</span>
                              <span>{t('admin.title')}</span>
                            </button>
                          )}
                          <div className="border-t border-gray-100 my-1"></div>
                        </>
                      )}
                      
                      {/* Show guest info and orders link for guest users */}
                      {user.isGuest && (
                        <>
                          <div className="px-4 py-2 text-sm text-gray-500">
                            <div className="font-medium text-gray-700">Guest User</div>
                            <div className="text-xs">{user.email}</div>
                          </div>
                          <button
                            onClick={() => {
                              router.push('/orders');
                              setIsProfileDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center ${isRTL ? 'text-right space-x-reverse space-x-3' : 'text-left space-x-3'}`}
                          >
                            <span className="text-lg">📦</span>
                            <span>{t('profile.myOrders')}</span>
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center ${isRTL ? 'text-right space-x-reverse space-x-3' : 'text-left space-x-3'}`}
                      >
                        <span className="text-lg">🚪</span>
                        <span>{user.isGuest ? t('auth.endSession') || 'End Session' : t('profile.logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    {t('auth.signIn')}
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => { setAuthMode('register'); setAuthModalOpen(true); }}
                    className="px-3 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    {t('auth.signUp')}
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button - Visible on mobile and tablet */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden flex items-center justify-center w-10 h-10 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              aria-label={t('nav.menu')}
            >
              <IoMenu className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm lg:hidden"
            onClick={closeMobileMenu}
          />

          {/* ❌ Sticky Close Button */}
          <div className="fixed top-4 right-4 z-[60]">
            <button
              onClick={closeMobileMenu}
              className="text-gray-500 hover:text-purple-600 transition-colors bg-white p-2 rounded-full shadow-md"
              aria-label="Close Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            dir={isRTL ? 'rtl' : 'ltr'}
            className="fixed top-0 left-0 w-full h-full bg-white z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out translate-x-0"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pt-[80px]">
              {/* Navigation Links */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('nav.navigation')}
                </h3>
                <button
                  onClick={() => handleMobileNavClick(handleHomeNavigation)}
                  className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">🏠</span>
                  <span className="font-medium">{t('nav.home')}</span>
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('nav.categories')}
                </h3>
                <div className="space-y-2">
                  {categoriesLoading ? (
                    <div className="px-4 py-2 text-gray-400 text-sm">Loading...</div>
                  ) : categories.length === 0 ? (
                    <div className="px-4 py-2 text-gray-400 text-sm">No categories</div>
                  ) : categories.map((category) => (
                    <div key={category.id}>
                      {/* Main Category */}
                      <button
                        onClick={() =>
                          handleMobileNavClick(() =>
                            handleCategoryNavigation(category.path || category.slug)
                          )
                        }
                        className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                      >
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium">{language === 'ar' ? category.name_ar : category.name_en}</span>
                      </button>
                      
                      {/* Subcategories */}
                      {category.children && category.children.length > 0 && (
                        <div className="ml-8 mt-1 space-y-1">
                          {category.children.map((subcategory: CategoryWithChildren) => (
                            <button
                              key={subcategory.id}
                              onClick={() =>
                                handleMobileNavClick(() =>
                                  handleCategoryNavigation(subcategory.path || subcategory.slug)
                                )
                              }
                              className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-2"
                            >
                              <span className="text-sm">{subcategory.icon}</span>
                              <span>{language === 'ar' ? subcategory.name_ar : subcategory.name_en}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* About & Contact */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('nav.navigation')}
                </h3>
                <button
                  onClick={() => handleMobileNavClick(handleAboutNavigation)}
                  className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">ℹ️</span>
                  <span className="font-medium">{t('nav.aboutUs')}</span>
                </button>
                <button
                  onClick={() => handleMobileNavClick(handleContactNavigation)}
                  className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">📞</span>
                  <span className="font-medium">{t('nav.contactUs')}</span>
                </button>
              </div>

              {/* Language Switcher */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t('language')}
                </h3>
                <div className="px-4">
                  <LanguageSwitcher />
                </div>
              </div>

              {/* Auth Section */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t('auth.account')}
                </h3>
                {isAuthenticated && user ? (
                  <>
                    {/* Show profile links only for non-guest users */}
                    {!user.isGuest && (
                      <>
                        <button
                          onClick={() => handleMobileNavClick(() => router.push('/profile'))}
                          className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                        >
                          <span className="text-lg">👤</span>
                          <span className="font-medium">{t('profile.myProfile')}</span>
                        </button>
                        <button
                          onClick={() =>
                            handleMobileNavClick(() =>
                              router.push('/orders')
                            )
                          }
                          className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                        >
                          <span className="text-lg">📦</span>
                          <span className="font-medium">{t('profile.myOrders')}</span>
                        </button>
                      </>
                    )}
                    
                    {/* Show guest info and orders link for guest users */}
                    {user.isGuest && (
                      <>
                        <div className="px-4 py-2 text-sm text-gray-500">
                          <div className="font-medium text-gray-700">Guest User</div>
                          <div className="text-xs">{user.email}</div>
                        </div>
                        <button
                          onClick={() => handleMobileNavClick(() => router.push('/orders'))}
                          className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                        >
                          <span className="text-lg">📦</span>
                          <span className="font-medium">{t('profile.myOrders')}</span>
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => handleMobileNavClick(() => logout())}
                      className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                    >
                      <span className="text-lg">🚪</span>
                      <span className="font-medium">{user.isGuest ? t('auth.endSession') || 'End Session' : t('profile.logout')}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setAuthModalOpen(true);
                        closeMobileMenu();
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                    >
                      <span className="text-lg">👤</span>
                      <span className="font-medium">{t('auth.signIn')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('register');
                        setAuthModalOpen(true);
                        closeMobileMenu();
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-3"
                    >
                      <span className="text-lg">📝</span>
                      <span className="font-medium">{t('auth.signUp')}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}


      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
        mode={authMode}
      />
    </header>
  );
};
