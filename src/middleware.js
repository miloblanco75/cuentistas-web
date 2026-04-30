import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const res = NextResponse.next();
    const ref = req.nextUrl.searchParams.get("ref");
    if (ref) {
      res.cookies.set("referrer", ref, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: false,
        sameSite: 'lax'
      });
    }
    return res;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Rutas públicas
        if (pathname === "/") return true;
        
        const publicPaths = [
          "/login",
          "/hub",
          "/arena",
          "/concursos",
          "/st",
          "/ref",
          "/api/guest/status",
          "/ranking",
          "/rankings"
        ];
        
        const isPublic = publicPaths.some(p => pathname.startsWith(p));
        return isPublic || !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
