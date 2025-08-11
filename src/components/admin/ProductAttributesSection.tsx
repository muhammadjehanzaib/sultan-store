import React, { useState, useEffect } from 'react';
import { ProductAttribute, ProductAttributeValue, LocalizedContent } from '@/types';

interface ProductAttributesSectionProps {
  attributes: ProductAttribute[];
  setAttributes: (attributes: ProductAttribute[]) => void;
  selectedLanguage: 'en' | 'ar';
}

const ATTRIBUTE_TYPES = [
  { value: 'color', label: 'Color' },
  { value: 'size', label: 'Size' },
  { value: 'material', label: 'Material' },
  { value: 'style', label: 'Style' },
];

const ProductAttributesSection: React.FC<ProductAttributesSectionProps> = ({ attributes, setAttributes, selectedLanguage }) => {
  const [editingAttr, setEditingAttr] = useState<ProductAttribute | null>(null);
  const [showAttrModal, setShowAttrModal] = useState(false);

  const handleAddAttribute = () => {
    // Generate a proper unique ID for new attributes
    const newId = `attr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setEditingAttr({
      id: newId,
      name: '',
      type: 'size',
      values: [],
      required: false,
    });
    setShowAttrModal(true);
  };

  const handleEditAttribute = (attr: ProductAttribute) => {
    setEditingAttr(attr);
    setShowAttrModal(true);
  };

  const handleDeleteAttribute = (id: string) => {
    setAttributes(attributes.filter(attr => attr.id !== id));
  };

  const handleSaveAttribute = (attr: ProductAttribute) => {
    if (attributes.some(a => a.id === attr.id)) {
      setAttributes(attributes.map(a => (a.id === attr.id ? attr : a)));
    } else {
      setAttributes([...attributes, attr]);
    }
    setShowAttrModal(false);
    setEditingAttr(null);
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="font-medium">Attributes</span>
        <button type="button" className="text-blue-600" onClick={handleAddAttribute}>+ Add Attribute</button>
      </div>
      {attributes.length === 0 && <div className="text-gray-500 text-sm">No attributes added.</div>}
      <ul className="space-y-2">
        {attributes.map(attr => (
          <li key={attr.id} className="bg-white dark:bg-gray-800 rounded p-2 flex items-center justify-between">
            <div>
              <span className="font-semibold">{attr.name}</span> <span className="text-xs text-gray-500">({attr.type})</span>
              <div className="text-xs text-gray-400">{attr.values.map(v => v.label || v.value).join(', ')}</div>
            </div>
            <div className="flex gap-2">
              <button type="button" className="text-blue-500" onClick={() => handleEditAttribute(attr)}>Edit</button>
              <button type="button" className="text-red-500" onClick={() => handleDeleteAttribute(attr.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {showAttrModal && editingAttr && (
        <AttributeModal
          attribute={editingAttr}
          onSave={handleSaveAttribute}
          onClose={() => setShowAttrModal(false)}
          selectedLanguage={selectedLanguage}
        />
      )}
    </div>
  );
};

// AttributeModal implementation (inline for brevity)
interface AttributeModalProps {
  attribute: ProductAttribute;
  onSave: (attr: ProductAttribute) => void;
  onClose: () => void;
  selectedLanguage: 'en' | 'ar';
}

const AttributeModal: React.FC<AttributeModalProps> = ({ attribute, onSave, onClose, selectedLanguage }) => {
  const [attr, setAttr] = useState<ProductAttribute>({ ...attribute });
  const [valueInput, setValueInput] = useState('');
  const [colorInput, setColorInput] = useState('#000000');
  
  // Reset form when attribute changes
  useEffect(() => {
    setAttr({ ...attribute });
  }, [attribute]);

  const handleAddValue = () => {
    if (!valueInput) return;
    // Generate a proper unique ID for new attribute values
    const newValueId = `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newValue: ProductAttributeValue = {
      id: newValueId,
      value: valueInput,
      label: valueInput,
      hexColor: attr.type === 'color' ? colorInput : undefined,
      inStock: true, // Default to in stock
      priceModifier: 0, // Default price modifier
    };
    setAttr({ ...attr, values: [...attr.values, newValue] });
    setValueInput('');
  };

  const handleDeleteValue = (id: string) => {
    setAttr({ ...attr, values: attr.values.filter(v => v.id !== id) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white   dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
        <h4 className="font-semibold mb-4">Edit Attribute</h4>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={attr.name}
            onChange={e => setAttr({ ...attr, name: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2 ">
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={attr.type}
            onChange={e => setAttr({ ...attr, type: e.target.value as any })}
            className="w-full p-2 border text-gray-500 rounded"
          >
            {ATTRIBUTE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Values</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={valueInput}
              onChange={e => setValueInput(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Value label"
            />
            {attr.type === 'color' && (
              <input
                type="color"
                value={colorInput}
                onChange={e => setColorInput(e.target.value)}
                className="w-10 h-10 p-0 border-none"
              />
            )}
            <button type="button" className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleAddValue}>Add</button>
          </div>
          <ul className="space-y-1">
            {attr.values.map(v => (
              <li key={v.id} className="flex items-center gap-2">
                {attr.type === 'color' && v.hexColor && (
                  <span className="inline-block w-4 h-4 rounded-full" style={{ background: v.hexColor }} />
                )}
                <span>{v.label || v.value}</span>
                <button type="button" className="text-xs text-red-500 ml-2" onClick={() => handleDeleteValue(v.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 text-gray-700 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
          <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => onSave(attr)}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ProductAttributesSection; 