'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Product } from '@/lib/types'

export type CartItem = Product & { quantity: number }

type CartContextValue = {
  items: CartItem[]
  addToCart: (product: Product, qty?: number) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalQuantity: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'pufff_cart_v1'

function safeNumber(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[]
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error)
    }
  }, [])

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore storage failures
    }
  }, [items])

  const addToCart = (product: Product, qty: number = 1) => {
    const addQty = Math.max(1, Math.floor(qty))

    setItems((prev) => {
      const existing = prev.find((x) => x.id === product.id)
      if (existing) {
        return prev.map((x) =>
          x.id === product.id ? { ...x, quantity: x.quantity + addQty } : x
        )
      }
      return [...prev, { ...product, quantity: addQty }]
    })
  }

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    const q = Math.max(1, Math.floor(quantity))
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, quantity: q } : x)))
  }

  const clearCart = () => setItems([])

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + safeNumber(item.quantity), 0),
    [items]
  )

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = safeNumber(item.price)
        const qty = safeNumber(item.quantity)
        return sum + price * qty
      }, 0),
    [items]
  )

  const value: CartContextValue = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalQuantity,
    subtotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}