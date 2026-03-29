import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()
  const body = await req.json()
  const { data, error } = await supabase
    .from('reagents')
    .update({ is_depleted: body.is_depleted })
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()
  const { data: reagent } = await supabase
    .from('reagents').select('cloudinary_public_id').eq('id', params.id).single()

  const { error } = await supabase.from('reagents').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (reagent?.cloudinary_public_id) {
    void cloudinary.uploader.destroy(reagent.cloudinary_public_id).catch((e) =>
      console.error('Cloudinary delete failed:', e)
    )
  }
  return NextResponse.json({ success: true })
}
