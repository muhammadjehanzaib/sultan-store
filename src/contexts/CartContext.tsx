'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; selectedAttributes?: { [attributeId: string]: string }; variantPrice?: number; variantImage?: string } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; variantId?: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; variantId?: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  isOpen: false,
  total: 0,
  itemCount: 0,
};

// Helper function to generate variant ID from selected attributes
function generateVariantId(productId: string, selectedAttributes?: { [attributeId: string]: string }): string {
  if (!selectedAttributes || Object.keys(selectedAttributes).length === 0) {
    return `${productId}-default`;
  }

  const attributeString = Object.entries(selectedAttributes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');

  return `${productId}-${attributeString}`;
}

// Helper function to find cart item by product ID and variant ID
function findCartItem(items: CartItem[], productId: string, variantId: string): CartItem | undefined {
  return items.find(item =>
    item.product.id === productId &&
    (item.variantId || generateVariantId(item.product.id, item.selectedAttributes)) === variantId
  );
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, selectedAttributes, variantPrice, variantImage } = action.payload;
      const productId = product.id;
      const variantId = generateVariantId(productId, selectedAttributes);
      const existingItem = findCartItem(state.items, productId, variantId);

      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map(item =>
          (item.variantId || generateVariantId(item.product.id, item.selectedAttributes)) === variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, {
          product,
          quantity: 1,
          selectedAttributes,
          variantId,
          variantPrice: variantPrice || product.price,
          variantImage: variantImage || product.image
        }];
      }

      const newTotal = newItems.reduce((sum, item) => sum + ((item.variantPrice || item.product.price) * item.quantity), 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
        isOpen: true, // Auto-open cart when item is added
      };
    }

    case 'REMOVE_ITEM': {
      const { productId, variantId } = action.payload;
      const targetVariantId = variantId || generateVariantId(productId);

      const newItems = state.items.filter(item => {
        const itemVariantId = item.variantId || generateVariantId(item.product.id.toString(), item.selectedAttributes);
        const shouldRemove = item.product.id.toString() === productId && itemVariantId === targetVariantId;
        return !shouldRemove;
      });

      const newTotal = newItems.reduce((sum, item) => sum + ((item.variantPrice || item.product.price) * item.quantity), 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, variantId, quantity } = action.payload;
      const targetVariantId = variantId || generateVariantId(productId);

      const newItems = state.items.map(item => {
        const itemVariantId = item.variantId || generateVariantId(item.product.id.toString(), item.selectedAttributes);
        const matches = item.product.id.toString() === productId && itemVariantId === targetVariantId;

        return matches
          ? { ...item, quantity: Math.max(0, quantity) }
          : item;
      }).filter(item => item.quantity > 0);

      const newTotal = newItems.reduce((sum, item) => sum + ((item.variantPrice || item.product.price) * item.quantity), 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount,
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
      };

    case 'TOGGLE_CART':
      const newState = {
        ...state,
        isOpen: !state.isOpen,
      };
      return newState;

    case 'LOAD_CART': {
      const newTotal = action.payload.reduce((sum, item) => sum + ((item.variantPrice || item.product.price) * item.quantity), 0);
      const newItemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0);

      return {
        ...state,
        items: action.payload,
        total: newTotal,
        itemCount: newItemCount,
      };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('ecommerce-cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ecommerce-cart', JSON.stringify(state.items));
  }, [state.items]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
