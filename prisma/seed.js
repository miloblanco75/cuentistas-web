import { PrismaClient } from '@prisma/client'
import { usuarios, concursos, examenes } from '../src/app/_data.js'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

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
