export type Category = '抑制剂' | '抗体' | 'siRNA' | '质粒'

export interface Reagent {
  id: string
  category: Category
  name: string
  catalog_number: string | null
  brand: string | null
  concentration_volume: string | null
  storage_location: string | null
  added_by: string | null
  added_date: string
  image_url: string | null
  cloudinary_public_id: string | null
  is_depleted: boolean
  created_at: string
  updated_at: string
}

export type ReagentInsert = Omit<Reagent, 'id' | 'created_at' | 'updated_at'>

export const CATEGORIES: Category[] = ['抑制剂', '抗体', 'siRNA', '质粒']
