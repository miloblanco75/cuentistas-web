import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
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
        // MANTENEMOS LAS CREDENCIALES PARA EL AUTOR JKwon
        if (credentials.username === 'espectador' || credentials.username === 'invitado') {
          return {
            id: `guest-${Date.now()}`,
            name: "Vigilante Anónimo",
            username: "Espectador",
            email: "guest@cuentistas.com",
            rol: "spectator",
            casa: "lechuza"
          }
        }
        
        // En authorize si necesitamos Prisma, pero vamos a usar un import dinamico para evitar bloqueos
        const { default: prisma } = await import("@/lib/db");
        const bcrypt = await import("bcryptjs");
        
        try {
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
        } catch (dbErr) {
          console.error("Auth DB error:", dbErr);
          // Fallback para permitir entrada si la DB falla pero solo en modo espectador
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
    async jwt({ token, user, account, profile }) {
      // SI ES LOGIN INICIAL (Aquí está el truco: CERO BASE DE DATOS AQUÍ)
      if (user) {
        token.id = user.id
        token.username = user.username || (profile?.name?.split(" ")[0]) || "Escritor"
        token.rol = user.rol || "spectator"
        token.casa = user.casa || "quimera"
        token.google_email = profile?.email
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.rol = token.rol
        session.user.casa = token.casa
        session.user.email = token.google_email || session.user.email
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || "cuentistas-production-master-secret-2026-v2",
  trustHost: true,
  debug: true,
}
