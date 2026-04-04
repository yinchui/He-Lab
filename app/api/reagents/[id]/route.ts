import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import cloudinary from '@/lib/cloudinary'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()
  const body = await req.json()

  if (typeof body.is_depleted !== 'boolean') {
    return NextResponse.json({ error: 'is_depleted 必须为布尔值' }, { status: 400 })
  }

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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()
  const body = await req.json()

  // 验证必填字段
  if (!body.name?.trim()) {
    return NextResponse.json({ error: '试剂名称为必填项' }, { status: 400 })
  }

  // 查询当前记录获取旧图片信息
  const { data: current } = await supabase
    .from('reagents')
    .select('cloudinary_public_id')
    .eq('id', params.id)
    .single()

  if (!current) {
    return NextResponse.json({ error: '试剂不存在' }, { status: 404 })
  }

  // 处理图片操作
  let imageUpdate: { image_url: string | null; cloudinary_public_id: string | null } | null = null

  if (body.image_action === 'delete') {
    // 删除图片
    imageUpdate = { image_url: null, cloudinary_public_id: null }
    if (current.cloudinary_public_id) {
      void cloudinary.uploader.destroy(current.cloudinary_public_id).catch((e) =>
        console.error('Cloudinary delete failed:', e)
      )
    }
  } else if (body.image_action === 'replace') {
    // 验证新图片信息
    if (!body.image_url || !body.cloudinary_public_id) {
      return NextResponse.json({ error: '替换图片时必须提供新图片信息' }, { status: 400 })
    }
    // 替换图片
    imageUpdate = {
      image_url: body.image_url,
      cloudinary_public_id: body.cloudinary_public_id,
    }
    // 删除旧图
    if (current.cloudinary_public_id) {
      void cloudinary.uploader.destroy(current.cloudinary_public_id).catch((e) =>
        console.error('Cloudinary delete old image failed:', e)
      )
    }
  }
  // image_action === 'keep' 时 imageUpdate 保持 null，不更新图片字段

  // 构造更新数据
  const updateData: Record<string, string | number | boolean | null> = {
    name: body.name.trim(),
    catalog_number: body.catalog_number || null,
    brand: body.brand || null,
    concentration_volume: body.concentration_volume || null,
    storage_location: body.storage_location || null,
    added_by: body.added_by || null,
    added_date: body.added_date,
    sirna_sense_seq: body.sirna_sense_seq || null,
    sirna_antisense_seq: body.sirna_antisense_seq || null,
    sirna_tube_count: body.sirna_tube_count || null,
    plasmid_vector_info: body.plasmid_vector_info || null,
    plasmid_resistance: body.plasmid_resistance || null,
    plasmid_is_mutant: body.plasmid_is_mutant || null,
    plasmid_mutation_info: body.plasmid_mutation_info || null,
  }

  if (imageUpdate) {
    updateData.image_url = imageUpdate.image_url
    updateData.cloudinary_public_id = imageUpdate.cloudinary_public_id
  }

  // 更新数据库
  const { data, error } = await supabase
    .from('reagents')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
