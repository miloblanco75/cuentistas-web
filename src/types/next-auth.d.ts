import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    rol: string;
    tinta: number;
    username?: string | null;
    nombre?: string | null;
    nivel?: string | null;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: string;
    tinta: number;
    username?: string | null;
  }
}
