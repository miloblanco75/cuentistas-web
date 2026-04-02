import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      // Si estamos en construcción (build), dejamos pasar todo para no romper el empaquetado
      if (process.env.NEXT_PHASE === 'phase-production-build') return true;
      return !!token;
    },
  },
});


export const config = {
  matcher: [
    "/hub", 
    "/comunidad", 
    "/perfil", 
    "/tienda", 
    "/examenes", 
    "/concursos/:path*", 
    "/panel/:path*"
  ]
};
