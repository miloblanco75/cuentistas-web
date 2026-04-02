import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          username: profile.name.split(" ")[0] || "Espectador",
          email: profile.email,
          image: profile.picture,
          rol: "spectator", // Los que entran con Google son espectadores por default
          casa: "quimera"
        }
      }
    }),
    CredentialsProvider({
      name: "Cuentistas",
      credentials: {
        username: { label: "Usuario o Correo", type: "text", placeholder: "jkwon" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Faltan credenciales')
        }

        // Mock Spectator Login (Option B)
        if (credentials.username === 'espectador') {
          return {
            id: `guest-${Date.now()}`,
            name: "Vigilante Anónimo",
            username: "Espectador",
            email: "guest@cuentistas.com",
            rol: "spectator",
            casa: "lechuza"
          }
        }
        
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: credentials.username },
              { email: credentials.username }
            ]
          }
        })

        if (!user || !user.password) {
          throw new Error('Usuario no encontrado o la contraseña es incorrecta')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Contraseña incorrecta')
        }

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          rol: user.rol,
          casa: user.casa
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.rol = user.rol
        token.casa = user.casa
      }
      if (trigger === "update" && session) {
        return { ...token, ...session.user }
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
    signIn: '/comunidad', // Por ahora lo redirige a comunidad si falla acceso protegido
  },
  secret: process.env.NEXTAUTH_SECRET || "cuentistas-super-secret-key-2026",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
