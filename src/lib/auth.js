import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./db";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Cuentista",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Clave", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { username: credentials.username } });
        if (!user || !user.password) return null;
        
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        
        return user;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Prioridad: Variable de entorno ADMIN_EMAIL
      const adminEmail = process.env.ADMIN_EMAIL || "ermiloblanco75@gmail.com";
      const currentEmail = user?.email || token?.email;

      if (currentEmail && currentEmail.toLowerCase().trim() === adminEmail.toLowerCase().trim()) {
        token.rol = "ARCHITECT";
        token.nivel = "Soberano Arquitecto";
        // V13: Asegurar que el ID se mantenga incluso para el admin hardcoded
        if (user?.id) token.id = user.id;
      } else if (user) {
        token.id = user.id;
        token.email = user.email;
        token.rol = user.rol || "CUENTISTA";
        token.nivel = user.nivel || "Principiante";
      }
      
      // Soporte para actualizaciones manuales de sesión si es necesario
      if (trigger === "update" && session) {
         return { ...token, ...session.user };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.rol = token.rol;
        session.user.nivel = token.nivel;
      }
      return session;
    }
  },
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
