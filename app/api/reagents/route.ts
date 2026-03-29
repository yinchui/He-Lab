import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { ReagentInsert } from '@/lib/types'

export async function GET(req: NextRequest) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search') || ''

  let query = supabase.from('reagents').select('*').order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,catalog_number.ilike.%${search}%,brand.ilike.%${search}%,added_by.ilike.%${search}%`
    )
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient()
  const body: ReagentInsert = await req.json()

  if (!body.name || !body.category) {
    return NextResponse.json({ error: '试剂名称和分类为必填项' }, { status: 400 })
  }

  const { data, error } = await supabase.from('reagents').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
