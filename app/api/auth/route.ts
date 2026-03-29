import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let password: string
  try {
    const body = await request.json()
    password = body?.password
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 })
  }

  if (!process.env.AUTH_SECRET) {
    console.error('AUTH_SECRET environment variable is not set')
    return NextResponse.json({ error: '服务器配置错误' }, { status: 500 })
  }

  if (!password || password !== process.env.SITE_PASSWORD) {
    return NextResponse.json({ error: '密码错误' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('site-auth', process.env.AUTH_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 94608000, // 3 years — intentional per user requirement
    path: '/',
  })

  return response
}
