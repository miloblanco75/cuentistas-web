import { PrismaClient } from '@prisma/client'
import { usuarios, concursos, examenes } from '../src/app/_data.js'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // BLOQUEO DE SEGURIDAD PARA PRODUCCIÓN
  // Evitamos purgar la base de datos si estamos en entorno real.
  if (process.env.NODE_ENV !== 'production') {
    console.log('Ambiente no-producción detectado. Ejecutando limpieza y volcado dummy...')
    
    // Clean db
    await prisma.entrada.deleteMany()
    await prisma.mensaje.deleteMany()
    await prisma.concurso.deleteMany()
    await prisma.user.deleteMany()

    // Seed Users
    for (const u of usuarios) {
      const defaultPassword = await bcrypt.hash('password123', 10)
      await prisma.user.create({
        data: {
          id: u.id,
          username: u.username,
          name: u.nombre,
          email: `${u.username}@ejemplo.com`,
          password: defaultPassword,
          rol: u.rol || 'Escritor',
          tinta: u.tinta || 60,
          puntos: u.puntos || 0,
          nivel: u.nivel || 'Principiante',
          casa: u.casa || null,
          generoFavorito: u.generoFavorito || null,
          escritorFavorito: u.escritorFavorito || null,
          victorias: u.victorias || 0,
          bio: u.bio || null,
        }
      })
    }

    // Seed Concursos
    for (const c of concursos) {
      await prisma.concurso.create({
        data: {
          id: c.id,
          titulo: c.titulo,
          descripcion: c.descripcion,
          status: c.status,
          duration: c.duration,
          temaGeneral: c.temaGeneral,
          temaExacto: c.temaExacto,
          categoria: c.categoria,
          costoTinta: c.costoTinta,
          isExamen: false,
        }
      })
    }

    // Seed Examenes
    for (const e of examenes) {
      await prisma.concurso.create({
        data: {
          id: e.id,
          titulo: e.titulo,
          descripcion: e.descripcion,
          status: e.status,
          duration: e.duration,
          temaGeneral: e.temaGeneral,
          temaExacto: e.temaExacto,
          categoria: "Examen",
          costoTinta: 0,
          isExamen: true,
        }
      })
    }
  } else {
    console.log('🛡️ Ambiente de PRODUCCIÓN protegido. Saltando purga y volcado de legacy data.')
  }

  // =========================================================
  // INFRAESTRUCTURA OBLIGATORIA: SEMILLA DE EL RETIRO
  // =========================================================
  // Este bloque es idempotente y se ejecutará en TODOS los entornos.
  // Asegura que el concurso 'retiro-eterno' siempre exista, evitando
  // fallos de Integridad Referencial en las inserciones de Entradas.
  console.log('Asegurando infraestructura permanente de El Retiro...')
  
  await prisma.concurso.upsert({
    where: { id: "retiro-eterno" },
    update: { 
      status: "active",
      tipo: "entrenamiento"
    },
    create: {
      id: "retiro-eterno",
      titulo: "El Retiro",
      descripcion: "El Santuario donde se forjan los peligrosos.",
      status: "active",
      tipo: "entrenamiento",
      temaGeneral: "Escritura Libre",
      temaExacto: "Santuario de Práctica",
      costoTinta: 0,
      duration: 999999999, // Larga duración segura (< MAX_INT Postgres)
      minElo: 0,
      maxElo: 9999,
      esParaNovatos: false
    }
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
