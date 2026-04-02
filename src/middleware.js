export { default } from "next-auth/middleware";

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
