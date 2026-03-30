export type Category = '抑制剂' | '抗体' | 'siRNA' | '质粒' | '试剂盒' | '探针'

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
  // siRNA 专属
  sirna_sense_seq: string | null
  sirna_antisense_seq: string | null
  sirna_tube_count: string | null
  // 质粒专属
  plasmid_vector_info: string | null
  plasmid_resistance: string | null
  plasmid_is_mutant: string | null
  plasmid_mutation_info: string | null
  created_at: string
  updated_at: string
}

export type ReagentInsert = Omit<Reagent, 'id' | 'created_at' | 'updated_at'>

export const CATEGORIES = ['抑制剂', '抗体', 'siRNA', '质粒', '试剂盒', '探针'] as const satisfies readonly Category[]
