import React from 'react';
import { categories } from '@/data/products';
import { scrollToElement } from '@/lib/utils';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">SultanStore</h3>
            <p className="text-gray-400 mb-4">
              Your one-stop shop for everything you need. Quality products at unbeatable prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                📘
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                🐦
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                📷
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-400">
              {categories.map((category) => (
                <li key={category.id}>
                  <button 
                    onClick={() => scrollToElement('featured-products')} 
                    className="hover:text-white transition-colors text-left"
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Returns
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} ShopEasy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
