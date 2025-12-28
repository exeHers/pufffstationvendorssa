export type Product = {
  id: string
  name: string
  description: string | null
  image_url: string | null

  category: string | null

  price: number | string | null
  bulk_price: number | string | null
  bulk_min: number | string | null

  in_stock: boolean | null

  accent_hex: string | null

  is_deleted: boolean | null
  deleted_at: string | null

  created_at: string | null
  updated_at: string | null
}

export type Category = {
  id: string
  name: string
  created_at?: string | null
}