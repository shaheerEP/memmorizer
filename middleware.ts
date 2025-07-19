import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // You can add custom logic here, like role-based access, logging, etc.
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Only allow users with a session token
    },
  }
)

export const config = {
  matcher: [
    "/api/subjects",
    "/((?!_next/static|_next/image|favicon.ico|login|auth).*)",
  ],
}
