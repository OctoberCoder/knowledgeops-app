import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(req: NextRequest) {
  const sessionToken = req.cookies.get('authjs.session-token')?.value
  const secureToken = req.cookies.get('__Secure-authjs.session-token')?.value

  if (!sessionToken && !secureToken) {
    const url = new URL('/auth/login', req.url)
    url.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = { matcher: ['/dashboard/:path*'] }