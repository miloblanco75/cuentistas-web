import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
        username: { label: "Usuario o Correo", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
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
    },
    async redirect({ url, baseUrl }) {
      // Si la URL es la de Vercel qjd5, forzamos que se mantenga ahí para evitar OAuth Callback Error
      if (url.startsWith("/")) return `${baseUrl}${url}`
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  // MEJORAS DE PROTOCOLO VERCEL FINAL
  secret: process.env.NEXTAUTH_SECRET || "cuentistas-production-master-secret-final-2026",
  trustHost: true,
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  },
}
