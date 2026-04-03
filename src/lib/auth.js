import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "./db"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Mantenemos checks: ['none'] para evitar bloqueos por cookies en Vercel
      checks: ['none'],
    }),
    CredentialsProvider({
      name: "Cuentistas",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.username === 'espectador') {
          return { id: "guest", name: "Espectador", rol: "spectator", casa: "lechuza" }
        }
        
        try {
          const bcrypt = await import("bcryptjs");
          
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { username: credentials.username },
                { email: credentials.username }
              ]
            }
          })

          if (!user || !user.password) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) return null;

          return {
            id: user.id,
            name: user.nombre || user.name,
            username: user.username,
            email: user.email,
            rol: user.rol,
            casa: user.casa
          }
        } catch (dbErr) {
          console.error("Auth DB error:", dbErr);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id
        token.username = user.username || (profile?.name?.split(" ")[0]) || (user?.name?.split(" ")[0]) || "Escritor"
        token.rol = user.rol || "spectator"
        token.casa = user.casa || "quimera"
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.rol = token.rol
        session.user.casa = token.casa
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
}
