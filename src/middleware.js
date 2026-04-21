import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;
      const publicPaths = [
        "/login",
        "/hub", 
        "/arena", 
        "/concursos",
        "/st", 
        "/ref", 
        "/api/guest/status",
        "/api/auth"
      ];
      
      const isPublic = publicPaths.some(path => pathname.startsWith(path));
      
      if (process.env.NEXT_PHASE === 'phase-production-build') return true;
      if (isPublic) return true;
      
      return !!token;
    },
  },
});


export const config = {
  matcher: [
    "/hub", 
    "/perfil", 
    "/tienda", 
    "/examenes", 
    "/concursos/:path*", 
    "/panel/:path*",
    "/st/:path*",
    "/ref/:path*"
  ]
};
