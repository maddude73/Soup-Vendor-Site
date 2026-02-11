import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@shared/schema';

export interface CartItem {
  product: Product;
  quantity: number;
  specialRequests?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number, specialRequests?: string) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity, specialRequests) => set((state) => {
        const existingItem = state.items.find(item => item.product.id === product.id);
        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity, specialRequests }
                : item
            ),
          };
        }
        return { items: [...state.items, { product, quantity, specialRequests }] };
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.product.id !== productId),
      })),
      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      })),
      clearCart: () => set({ items: [] }),
      itemCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      subtotal: () => get().items.reduce((acc, item) => {
        let itemTotal = item.product.price * item.quantity;
        if (item.specialRequests) {
          itemTotal += 200 * item.quantity;
        }
        return acc + itemTotal;
      }, 0),
    }),
    {
      name: 'soulful-soups-cart',
    }
  )
);
