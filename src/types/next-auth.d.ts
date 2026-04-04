import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extensión de la sesión para incluir los atributos del Maestro
   */
  interface Session {
    user: {
      id: string;
      rol: string;
      tinta: number;
      username?: string | null;
    } & DefaultSession["user"];
  }

  /**
   * Extensión del usuario para incluir los atributos de la base de datos
   */
  interface User {
    id: string;
    rol: string;
    tinta: number;
    username?: string | null;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extensión del token JWT
   */
  interface JWT {
    id: string;
    rol: string;
    tinta: number;
    username?: string | null;
  }
}
