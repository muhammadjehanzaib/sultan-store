import React from 'react';
import { StockHistory } from '@/types';

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockHistory: StockHistory[];
  productName: string;
}

const StockHistoryModal: React.FC<StockHistoryModalProps> = ({ isOpen, onClose, stockHistory, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product Stock History</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Product Info Card */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-1">
                  {productName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Complete stock movement history for this product
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stockHistory.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Total Entries
                </div>
              </div>
            </div>
          </div>
          
          {/* History List */}
          <div className="">
            {stockHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg font-medium mb-2">No stock history available</p>
                <p className="text-sm">History will appear here after stock adjustments or sales.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Stock Movement History</h3>
                <div className="space-y-4">
                  {stockHistory.slice().reverse().map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          entry.type === 'in' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                            : entry.type === 'out'
                            ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                        }`}>
                          {entry.type === 'in' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          ) : entry.type === 'out' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {entry.type === 'in' ? '+' : entry.type === 'out' ? '-' : ''}{entry.quantity} units
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                              entry.type === 'in' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : entry.type === 'out'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {entry.type === 'in' ? 'Stock In' : entry.type === 'out' ? 'Stock Out' : 'Adjustment'}
                            </span>
                            {entry.reason || 'No reason provided'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <div className="font-medium">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </div>
                          <div className="mt-1">
                            {new Date(entry.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                        {entry.adminName && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            by {entry.adminName}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end">
            <button 
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm" 
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockHistoryModal; 