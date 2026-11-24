import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { useToast } from './ToastContext';
import {
  getServerCart,
  addServerCartItem,
  updateServerCartItem,
  removeServerCartItem,
  clearServerCart,
} from '../services/customerApi';

interface CartContextValue {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  estimatedTax: number;
  estimatedShipping: number;
  grandTotal: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('voltedge_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [serverCartIdMap, setServerCartIdMap] = useState<Record<string, string>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const syncWithServer = async () => {
    try {
      const serverData = await getServerCart();
      if (serverData && serverData.items && serverData.items.length > 0) {
        const idMap: Record<string, string> = {};
        const formattedCart: CartItem[] = serverData.items.map((item) => {
          idMap[item.productId] = item.id;
          return {
            product: {
              id: item.productId,
              name: item.name,
              slug: item.slug,
              sku: item.sku,
              primaryImage: item.primaryImage,
              images: [item.primaryImage],
              sellingPrice: item.unitPrice,
              originalPrice: item.originalPrice || undefined,
              stockQuantity: item.stockQuantity,
              stockStatus: item.stockStatus as any,
              rating: 4.8,
              reviewCount: 12,
              description: '',
              brandId: '',
              brand: { id: '', name: '', slug: '' },
              categoryId: '',
              category: { id: '', name: '', slug: '' },
              isFeatured: false,
              isBestSeller: false,
              isLatestArrival: false,
              isSpecialOffer: false,
              createdAt: '',
              updatedAt: '',
            },
            quantity: item.quantity,
          };
        });
        setCart(formattedCart);
        setServerCartIdMap(idMap);
        localStorage.setItem('voltedge_cart', JSON.stringify(formattedCart));
      }
    } catch (err) {
      console.warn('Server cart sync unavailable, retaining local cart.');
    }
  };

  useEffect(() => {
    syncWithServer();
  }, []);

  const addToCart = async (product: Product, quantity = 1) => {
    // 1. Instantly update local state and localStorage
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [...prev, { product, quantity }];
      }
      localStorage.setItem('voltedge_cart', JSON.stringify(updated));
      return updated;
    });

    showToast(`Added "${product.name}" to your cart`);
    setIsCartOpen(true);

    // 2. Synchronize with server in the background
    try {
      await addServerCartItem(product.id, quantity);
      const serverData = await getServerCart();
      if (serverData?.items?.length) {
        const idMap: Record<string, string> = {};
        serverData.items.forEach((it) => {
          idMap[it.productId] = it.id;
        });
        setServerCartIdMap(idMap);
      }
    } catch (err) {
      // Background sync warning
    }
  };

  const removeFromCart = async (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      localStorage.setItem('voltedge_cart', JSON.stringify(updated));
      return updated;
    });
    showToast('Item removed from cart', 'info');

    try {
      const serverItemId = serverCartIdMap[productId];
      if (serverItemId) {
        await removeServerCartItem(serverItemId);
      }
    } catch {
      // Background sync warning
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    setCart((prev) => {
      const updated = prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('voltedge_cart', JSON.stringify(updated));
      return updated;
    });

    try {
      const serverItemId = serverCartIdMap[productId];
      if (serverItemId) {
        await updateServerCartItem(serverItemId, quantity);
      }
    } catch {
      // Background sync warning
    }
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem('voltedge_cart');
    showToast('Cart cleared', 'info');

    try {
      await clearServerCart();
    } catch {
      // Background sync warning
    }
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce(
    (acc, item) => acc + (item.product?.sellingPrice || 0) * item.quantity,
    0
  );
  const estimatedTax = Math.round(subtotal * 0.18);
  const estimatedShipping = subtotal >= 50000 || subtotal === 0 ? 0 : 499;
  const grandTotal = subtotal + estimatedTax + estimatedShipping;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: syncWithServer,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        estimatedTax,
        estimatedShipping,
        grandTotal,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
