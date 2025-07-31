import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Check if user is accessing admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const token = req.nextauth.token
      
      // Allow access to admin login page
      if (req.nextUrl.pathname === '/admin/login') {
        return NextResponse.next()
      }
      
      // Check if user has admin privileges
      const adminRoles = ['admin', 'manager', 'support']
      if (!token || !adminRoles.includes(token.role as string)) {
        // Redirect non-admin users to homepage
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to admin login page without authentication
        if (req.nextUrl.pathname === '/admin/login') {
          return true
        }
        
        // For admin routes, require authentication
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return !!token
        }
        
        // Allow all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}
