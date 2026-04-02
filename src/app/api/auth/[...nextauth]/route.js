import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions = {
  // SIN adaptador de Prisma — usamos JWT puro para mayor compatibilidad en Vercel
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Cuentistas",
      credentials: {
        username: { label: "Usuario o Correo", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Faltan credenciales')
        }

        // Mock Espectador
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
          throw new Error('Usuario no encontrado')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Contraseña incorrecta')
        }

        return {
          id: user.id,
          name: user.nombre,
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
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Login inicial con Credentials
      if (user && !account?.provider?.includes('google')) {
        token.id = user.id
        token.username = user.username
        token.rol = user.rol
        token.casa = user.casa
      }
      // Login con Google — buscamos o creamos el usuario en la DB
      if (account?.provider === 'google' && profile) {
        try {
          let dbUser = await prisma.user.findUnique({ where: { email: profile.email } })
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                nombre: profile.name,
                username: profile.name?.split(" ")[0] || "Espectador",
                email: profile.email,
                rol: "spectator",
                casa: "quimera",
                tinta: 0,
              }
            })
          }
          token.id = dbUser.id
          token.username = dbUser.username
          token.rol = dbUser.rol
          token.casa = dbUser.casa
        } catch (e) {
          // Si falla la DB, ponemos datos básicos del perfil de Google
          token.id = profile.sub
          token.username = profile.name?.split(" ")[0] || "Espectador"
          token.rol = "spectator"
          token.casa = "quimera"
        }
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
  secret: process.env.NEXTAUTH_SECRET || "cuentistas-super-secret-key-2026",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
