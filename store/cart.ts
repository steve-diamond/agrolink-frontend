import { create } from 'zustand';

export interface InputProduct {
  id: string;
  name: string;
  brand?: string;
  price_per_unit: number;
  unit: string;
  image_url?: string;
  seller_name: string;
  state: string;
  is_nafdac_approved?: boolean;
  quantity: number;
}

interface CartState {
  cartItems: InputProduct[];
  addItem: (item: InputProduct) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  addItem: (item) => {
    set((state) => {
      const exists = state.cartItems.find((i) => i.id === item.id);
      if (exists) {
        return {
          cartItems: state.cartItems.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          ),
        };
      }
      return { cartItems: [...state.cartItems, item] };
    });
  },
  removeItem: (id) => set((state) => ({ cartItems: state.cartItems.filter((i) => i.id !== id) })),
  updateQty: (id, quantity) => set((state) => ({
    cartItems: state.cartItems.map((i) => (i.id === id ? { ...i, quantity } : i)),
  })),
  clearCart: () => set({ cartItems: [] }),
  total: () => get().cartItems.reduce((sum, i) => sum + i.price_per_unit * i.quantity, 0),
}));
