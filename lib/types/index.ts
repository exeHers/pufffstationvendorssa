export type Product = {
  id: string
  created_at?: string | null
  updated_at?: string | null

  name: string
  category: string
  description?: string | null

  price: number
  bulk_price?: number | null
  bulk_min?: number | null

  image_url?: string | null
  in_stock?: boolean | null

  accent_hex?: string | null

  // ✅ Smoke colours chosen by admin
  smoke_hex_scroll?: string | null
  smoke_hex_preview?: string | null

  is_deleted?: boolean | null
  deleted_at?: string | null
  is_featured?: boolean | null
}