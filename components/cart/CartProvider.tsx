'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  addToCart: (item: { id: string; name: string; price: number | string }) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  totalQuantity: number
  totalPrice: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart: CartContextValue['addToCart'] = (item) => {
    const priceNumber = Number(item.price) || 0

    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id)
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p,
        )
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: priceNumber,
          quantity: 1,
        },
      ]
    })
  }

  const removeFromCart: CartContextValue['removeFromCart'] = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => setItems([])

  const { totalQuantity, totalPrice } = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.totalQuantity += item.quantity
        acc.totalPrice += item.price * item.quantity
        return acc
      },
      { totalQuantity: 0, totalPrice: 0 },
    )
  }, [items])

  const value: CartContextValue = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    totalQuantity,
    totalPrice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>')
  }
  return ctx
}