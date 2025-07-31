import { CartItem, OrderItem } from '@/types';

/**
 * Converts cart items to order items with proper variant structure
 * This ensures that the selectedAttributes from cart are properly formatted
 * for display in the admin panel
 */
export function convertCartItemsToOrderItems(cartItems: CartItem[]): OrderItem[] {
  return cartItems.map(cartItem => {
    // Create the order item with the product and basic info
    const orderItem: OrderItem = {
      product: {
        ...cartItem.product,
        // Add selectedVariant structure for admin panel display
        ...(cartItem.selectedAttributes && {
          selectedVariant: {
            id: cartItem.variantId || `variant_${cartItem.product.id}`,
            name: generateVariantName(cartItem.product, cartItem.selectedAttributes),
            price: cartItem.product.price,
            inStock: cartItem.product.inStock || true,
            selectedAttributes: cartItem.selectedAttributes
          }
        })
      } as any, // Use any to bypass type checking for the selectedVariant property
      quantity: cartItem.quantity,
      price: cartItem.product.price,
      total: cartItem.product.price * cartItem.quantity
    };

    return orderItem;
  });
}

/**
 * Generates a human-readable variant name based on selected attributes
 */
function generateVariantName(product: any, selectedAttributes: { [key: string]: string }): string {
  if (!selectedAttributes || Object.keys(selectedAttributes).length === 0) {
    return product.name || 'Default Variant';
  }

  const attributeNames = Object.entries(selectedAttributes).map(([attrId, valueId]) => {
    const attribute = product.attributes?.find((attr: any) => attr.id === attrId);
    const value = attribute?.values?.find((val: any) => val.id === valueId);
    
    if (attribute && value) {
      return value.label || value.value;
    }
    return valueId;
  });

  return attributeNames.join(' ');
} 