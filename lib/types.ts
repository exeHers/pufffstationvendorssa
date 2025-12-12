// lib/types.ts

export type Product = {
  id: string
  name: string
  description: string | null
  price: number | string | null
  image_url: string | null
  in_stock: boolean | null
  created_at?: string
}