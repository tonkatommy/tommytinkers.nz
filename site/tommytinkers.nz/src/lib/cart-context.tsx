'use client';

import { createContext, useContext, useEffect, useReducer } from "react";
import type { CartItem } from "./types";

const STORAGE_KEY = "tt-cart-v1";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD"; id: string; qty?: number }
  | { type: "SET_QTY"; id: string; qty: number }
  | { type: "REMOVE"; id: string }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.items };
    case "ADD": {
      const qty = action.qty ?? 1;
      const existing = state.items.find((i) => i.id === action.id);
      const items = existing
        ? state.items.map((i) => i.id === action.id ? { ...i, qty: i.qty + qty } : i)
        : [...state.items, { id: action.id, qty }];
      return { ...state, items, isOpen: true };
    }
    case "SET_QTY": {
      const items = action.qty <= 0
        ? state.items.filter((i) => i.id !== action.id)
        : state.items.map((i) => i.id === action.id ? { ...i, qty: action.qty } : i);
      return { ...state, items };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "OPEN":
      return { ...state, isOpen: true };
    case "CLOSE":
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  addItem: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(
    cartReducer,
    { items: [], isOpen: false },
    (init) => {
      if (typeof window === "undefined") return init;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...init, items: JSON.parse(raw) as CartItem[] };
      } catch {}
      return init;
    },
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {}
    window.dispatchEvent(new CustomEvent("tt-cart-change", { detail: state.items }));
  }, [state.items]);

  const count = state.items.reduce((n, i) => n + i.qty, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      count,
      isOpen: state.isOpen,
      addItem: (id, qty) => dispatch({ type: "ADD", id, qty }),
      setQty: (id, qty) => dispatch({ type: "SET_QTY", id, qty }),
      removeItem: (id) => dispatch({ type: "REMOVE", id }),
      openCart: () => dispatch({ type: "OPEN" }),
      closeCart: () => dispatch({ type: "CLOSE" }),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
