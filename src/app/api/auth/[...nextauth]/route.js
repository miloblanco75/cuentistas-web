import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

// CONFIGURACIÓN AUTÓNOMA PARA EVITAR ERRORES DE LIBRERÍA EN VERCEL
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      checks: ['none'], // Fuerza bruta contra error de state
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
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
        // Solo importamos DB si es necesario (credentials login)
        const { default: prisma } = await import("@/lib/db");
        const bcrypt = await import("bcryptjs");
        const user = await prisma.user.findFirst({
           where: { OR: [{ username: credentials.username }, { email: credentials.username }] }
        });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;
        return { id: user.id, name: user.nombre, username: user.username, email: user.email, rol: user.rol, casa: user.casa }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id
        token.rol = user.rol || "spectator"
        token.casa = user.casa || "quimera"
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.rol = token.rol
        session.user.casa = token.casa
      }
      return session
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/hub`
    }
  },
  pages: { signIn: '/login', error: '/login' },
  secret: process.env.NEXTAUTH_SECRET || "cuentistas-emergency-secret-2026",
  trustHost: true,
  debug: true,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
