import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (password !== process.env.SITE_PASSWORD) {
    return NextResponse.json({ error: '密码错误' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('site-auth', process.env.AUTH_SECRET!, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 94608000, // 3 years (3 * 365 * 24 * 60 * 60)
    path: '/',
  })

  return response
}
