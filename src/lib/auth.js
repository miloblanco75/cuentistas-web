import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"

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
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Faltan credenciales')
        }

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
          console.error("Critical DB error in authorize:", dbErr);
          throw new Error("No hay conexión con la base de datos");
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
        token.username = user.username || "Usuario"
        token.rol = user.rol || "spectator"
        token.casa = user.casa || "quimera"
      }
      
      if (account?.provider === 'google' && profile) {
        // PERMITIMOS EL LOGIN DE GOOGLE SIEMPRE (No bloqueante)
        token.id = profile.sub
        token.username = profile.name?.split(" ")[0] || "Espectador"
        token.rol = "spectator"
        token.casa = "quimera"

        // Registro asíncrono
        prisma.user.findUnique({ where: { email: profile.email } })
          .then(dbUser => {
            if (!dbUser) {
              return prisma.user.create({
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
          })
          .catch(e => console.error("Google sync error:", e));
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
  debug: true,
}
