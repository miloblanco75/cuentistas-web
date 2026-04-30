import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default async function middleware(req, ev) {
  // 1. TRAMPA DE REFERRALS (FASE 7)
  const ref = req.nextUrl.searchParams.get("ref");
  let res = NextResponse.next();

  // 2. ENVOLTURA NEXT-AUTH
  const authMiddleware = withAuth({
    callbacks: {
      authorized: ({ token, req: authReq }) => {
        const { pathname } = authReq.nextUrl;
        const publicPaths = [
          "/",
          "/login",
          "/hub", 
          "/arena", 
          "/concursos",
          "/st", 
          "/ref", 
          "/api/guest/status",
          "/api/auth",
          "/ranking",
          "/rankings"
        ];
        
        const isPublic = publicPaths.some(path => pathname.startsWith(path));
        
        if (process.env.NEXT_PHASE === 'phase-production-build') return true;
        if (isPublic) return true;
        
        return !!token;
      },
    },
  });

  // Ejecutamos auth middleware para obtener la respuesta base de redirección si aplica
  const authRes = await authMiddleware(req, ev);
  if (authRes) res = authRes;

  // Si atrapamos un referido, lo guardamos en una cookie con caducidad larga (30 días)
  if (ref) {
    res.cookies.set("referrer", ref, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 días
      httpOnly: false, // Permitimos lectura en cliente si hiciera falta
      sameSite: 'lax'
    });
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
