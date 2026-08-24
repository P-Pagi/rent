import { NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

const authMiddleware = withAuth({
  pages: {
    signIn: "/login",
  },
});

export async function proxy(request: NextRequest, event: any) {
  return (authMiddleware as any)(request, event);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    "/customers/:path*",
    "/costumes/:path*",
    "/calendar/:path*",
    "/statistics/:path*",
    "/settings/:path*",
  ],
};
