import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: '未选择文件' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ error: '仅支持 JPG/PNG/WEBP 格式' }, { status: 400 })
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: '文件大小不能超过 10MB' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  try {
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'helab-reagents' }, (err, result) => {
            if (err || !result) return reject(err ?? new Error('Upload failed'))
            resolve({ secure_url: result.secure_url, public_id: result.public_id })
          })
          .end(buffer)
      }
    )
    return NextResponse.json(result)
  } catch (e) {
    console.error('Cloudinary upload error:', e)
    return NextResponse.json({ error: '图片上传失败，请稍后重试' }, { status: 500 })
  }
}
