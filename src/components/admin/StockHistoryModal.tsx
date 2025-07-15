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
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold">Stock History for {productName}</h4>
          <button className="text-gray-500 hover:text-gray-800 text-2xl font-bold" onClick={onClose}>×</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-right">Quantity</th>
                <th className="px-3 py-2 text-left">Reason</th>
                <th className="px-3 py-2 text-left">Admin</th>
              </tr>
            </thead>
            <tbody>
              {stockHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-400 py-4">No history available.</td>
                </tr>
              ) : (
                stockHistory.slice().reverse().map(entry => (
                  <tr key={entry.id} className="border-b">
                    <td className="px-3 py-2">{new Date(entry.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2 capitalize">{entry.type}</td>
                    <td className="px-3 py-2 text-right font-mono">{entry.quantity}</td>
                    <td className="px-3 py-2">{entry.reason}</td>
                    <td className="px-3 py-2">{entry.adminName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockHistoryModal; 