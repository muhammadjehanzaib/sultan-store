'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { Footer } from '@/components';

// Sidebar navigation items
const sidebarItems = [
  { id: 'contact', label: 'Contact Us', path: '/customer-care', isActive: true },
  { id: 'faq', label: 'Frequently Asked Questions', path: '/customer-care/faq', isActive: false },
  { id: 'returns', label: 'Return and Exchange', path: '/customer-care/returns', isActive: false },
  { id: 'privacy', label: 'Privacy Policy', path: '/customer-care/privacy', isActive: false },
];

interface ContactFormData {
  emailAddress: string;
  mobileNumber: string;
  region: string;
  messageType: string;
  description: string;
  attachment?: File | null;
}

export default function CustomerCarePage() {
  const { t, isRTL, language } = useLanguage();
  const [formData, setFormData] = useState<ContactFormData>({
    emailAddress: '',
    mobileNumber: '',
    region: '',
    messageType: '',
    description: '',
    attachment: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRobotChecked, setIsRobotChecked] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Convert to base64 using FileReader (same as product uploads)
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAttachmentPreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview('');
    }
    
    setFormData(prev => ({
      ...prev,
      attachment: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRobotChecked) {
      alert('Please verify that you are not a robot.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data similar to product upload
      const submitData = {
        emailAddress: formData.emailAddress,
        mobileNumber: formData.mobileNumber,
        region: formData.region,
        messageType: formData.messageType,
        description: formData.description,
        attachment: attachmentPreview || null, // base64 data URL
        attachmentName: formData.attachment?.name || null
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setFormData({
          emailAddress: '',
          mobileNumber: '',
          region: '',
          messageType: '',
          description: '',
          attachment: null,
        });
        setAttachmentPreview('');
        setIsRobotChecked(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm text-gray-500">
            <Link href="/" className="hover:text-purple-600">Home</Link>
            <span className="mx-2"></span>
            <span className="text-purple-600">Customer Care</span>
            <span className="mx-2"></span>
            <span className="text-gray-900">Contact Us</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <nav className="p-4">
                <ul className="space-y-1">
                  {sidebarItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.path}
                        className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                          item.isActive
                            ? 'bg-purple-100 text-purple-700 font-medium border-r-4 border-purple-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                        }`}
                      >
                        <span className="mr-2">
                          {item.isActive && <span className="text-purple-600">▶</span>}
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact US</h1>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Address */}
                <div>
                  <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="emailAddress"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    required
                    className="w-full text-gray-700  px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Region */}
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                    Region <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                    className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="">Choose...</option>
                    <option value="riyadh">Riyadh</option>
                    <option value="jeddah">Jeddah</option>
                    <option value="dammam">Dammam</option>
                    <option value="mecca">Mecca</option>
                    <option value="medina">Medina</option>
                    <option value="tabuk">Tabuk</option>
                    <option value="abha">Abha</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Type of Message */}
                <div>
                  <label htmlFor="messageType" className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Message <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="messageType"
                    name="messageType"
                    value={formData.messageType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 text-gray-700 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="">Choose...</option>
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Related</option>
                    <option value="technical">Technical Support</option>
                    <option value="complaint">Complaint</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-md">
                    {/* Toolbar */}
                    <div className="border-b border-gray-300 p-2 bg-gray-50">
                      <div className="flex items-center space-x-1 text-gray-700">
                        <button 
                          type="button" 
                          className={`p-2 hover:bg-gray-200 rounded text-sm font-bold ${
                            isBold ? 'bg-gray-200 text-purple-600' : 'text-gray-700'
                          }`}
                          onClick={() => setIsBold(!isBold)}
                          title="Bold"
                        >
                          B
                        </button>
                        <button 
                          type="button" 
                          className={`p-2 hover:bg-gray-200 rounded text-sm italic ${
                            isItalic ? 'bg-gray-200 text-purple-600' : 'text-gray-700'
                          }`}
                          onClick={() => setIsItalic(!isItalic)}
                          title="Italic"
                        >
                          I
                        </button>
                        <button 
                          type="button" 
                          className={`p-2 hover:bg-gray-200 rounded text-sm underline ${
                            isUnderline ? 'bg-gray-200 text-purple-600' : 'text-gray-700'
                          }`}
                          onClick={() => setIsUnderline(!isUnderline)}
                          title="Underline"
                        >
                          U
                        </button>
                      </div>
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={8}
                      className={`w-full px-4 py-3 border-0 focus:ring-0 focus:outline-none resize-none text-gray-900 bg-white ${
                        isBold ? 'font-bold' : ''
                      } ${
                        isItalic ? 'italic' : ''
                      } ${
                        isUnderline ? 'underline' : ''
                      }`}
                      placeholder="Type something"
                      style={{ color: '#1f2937' }}
                    />
                  </div>
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📎 Attachment
                  </label>
                  <input
                    type="file"
                    id="attachment"
                    name="attachment"
                    onChange={handleFileChange}
                    className="text-gray-700 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  />
                </div>

                <div className="flex items-center">
                  <div className="flex items-center border border-gray-300 rounded p-4 bg-gray-50 max-w-xs">
                    <input 
                      type="checkbox" 
                      className="mr-3 w-5 h-5" 
                      checked={isRobotChecked}
                      onChange={(e) => setIsRobotChecked(e.target.checked)}
                      required 
                    />
                    <span className="text-sm text-gray-700 mr-4">I'm not a robot</span>
                    <div className="ml-auto">
                      <div className="text-xs text-gray-500">
                        <div className="font-bold">reCAPTCHA</div>
                        <div className="text-xs">Privacy - Terms</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setFormData({
                        emailAddress: '',
                        mobileNumber: '',
                        region: '',
                        messageType: '',
                        description: '',
                        attachment: null,
                      });
                      setAttachmentPreview('');
                      setIsRobotChecked(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isRobotChecked}
                    className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section - Company Information */}
      <div className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Saudi Safety</h3>
              <p><strong>P.O. Box:</strong> 3196, Riyadh 11471</p>
              <p><strong>Unified Number:</strong> 920000089</p>
            </div>
            <div>
              <p><strong>For after sales service requests follow up:</strong> 8003314444</p>
              <p><strong>Fax:</strong> 011-4656363</p>
              <p><strong>Email:</strong> <a href="mailto:support@saudisafety.com" className="text-purple-600 hover:underline">support@saudisafety.com</a></p>
            </div>
            <div>
              <p><strong>Call Center Working Hours:</strong> Friday – Thursday: 8:00 AM – 10:00 PM</p>
              <p><strong>Friday:</strong> 4:00 PM – 10:00 PM</p>
              <p>For showroom locations & Working hours Please click <a href="/store-locations" className="text-purple-600 hover:underline">Store locations</a></p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
