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
      allowDangerousEmailAccountLinking: true,
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
          console.error("❌ Auth DB error:", dbErr);
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
        
        // REGLA SUPREMA: El correo del Maestro siempre recibe el rango Maestro
        if (user.email === "ermiloblanco75@gmail.com") {
          token.rol = "Maestro"
        } else {
          token.rol = user.rol || "Escritor"
        }
        
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
    },
    async signIn({ user, account, profile }) {
      console.log("🕯️ Veredicto de Entrada:", { email: user.email, provider: account.provider });
      return true;
    }
  },
  events: {
    async createUser({ user }) {
      console.log("🐣 Nuevo Ser Forjado en el Cónclave:", user.email);
      if (user.email === "ermiloblanco75@gmail.com") {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { rol: "Maestro" }
          });
          console.log("🔱 Ascensión completa en DB.");
        } catch (e) {
          console.error("❌ Error en Ascensión:", e);
        }
      }
    },
    async linkAccount({ user, account }) {
      console.log("🔗 Vínculo de Almas Detectado:", user.email);
      if (user.email === "ermiloblanco75@gmail.com") {
        try {
          await prisma.user.update({
            where: { email: user.email },
            data: { rol: "Maestro" }
          });
          console.log("🔱 Rango de Maestro Protegido tras vínculo.");
        } catch (e) {
          console.error("❌ Error al proteger rango:", e);
        }
      }
    }
  },
  debug: true, // Siempre encendido para el diagnóstico del Maestro
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
}
