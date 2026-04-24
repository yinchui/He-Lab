import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const STATIC_EXTENSIONS = /\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|otf|map)$/

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 放行登录页、认证 API、健康检查和静态资源，避免死循环和资源加载失败
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/health') ||
    STATIC_EXTENSIONS.test(pathname)
  ) {
    return NextResponse.next()
  }

  const authCookie = request.cookies.get('site-auth')

  if (!authCookie || authCookie.value !== process.env.AUTH_SECRET) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
