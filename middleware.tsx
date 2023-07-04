import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  if (req.nextUrl.pathname.startsWith("/conversation")) {
    return res
  } else if (req.nextUrl.pathname.startsWith("/api/auth")) {
    return res
  } else if (req.nextUrl.pathname.startsWith("/api/stores")) {
    return res
  } 
  const supabase = createMiddlewareSupabaseClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/"
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  } else {
    return res
  }
}

export const config = {
  matcher: "/api/:path*",
}
