const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🔱 Iniciando Siembra de Cuentistas...");

  // 1. FORZAR ADMIN
  console.log("--- Escalando privilegios de Arquitecto ---");
  const adminEmail = "ermiloblanco75@gmail.com";
  const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (adminUser) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { rol: "ARCHITECT" }
    });
    console.log(`✅ ${adminEmail} ahora es ARCHITECT.`);
  } else {
    console.warn(`⚠️ Usuario ${adminEmail} no encontrado. Regístrate primero.`);
  }

  // 2. SEED TIENDA (Comercial / Stripe)
  console.log("--- Forjando Packs de Tinta (Stripe) ---");
  const packs = [
    {
      nombre: "100 Gotas de Tinta",
      descripcion: "Esencia pura para participar en 10 concursos estándar.",
      precio: 45,
      cantidad: 100,
      tipo: "tinta",
      categoria: "Tinta",
      disponible: true
    },
    {
      nombre: "500 Gotas de Tinta",
      descripcion: "El pack del Cuentista Recurrente. Ideal para temporadas largas.",
      precio: 180,
      cantidad: 500,
      tipo: "tinta",
      categoria: "Tinta",
      disponible: true
    },
    {
      nombre: "1000 Gotas de Tinta",
      descripcion: "Poder ilimitado. Reserva del Arquitecto.",
      precio: 350,
      cantidad: 1000,
      tipo: "tinta",
      categoria: "Tinta",
      disponible: true
    }
  ];

  for (const pack of packs) {
    await prisma.tiendaItem.upsert({
      where: { nombre: pack.nombre },
      update: pack,
      create: pack
    });
  }
  console.log("✅ Packs de Tinta creados.");

  // 3. SEED PRESTIGE (StoreItem / Tinta Economy)
  console.log("--- Forjando Ítems de Prestigio (Economía Interna) ---");
  const prestigeItems = [
    {
      name: "Marco de Acero (Lobo)",
      description: "Identidad para los habitantes de la Casa del Lobo.",
      type: "frame",
      priceTinta: 150,
      rarity: "common",
      isActive: true,
      metadata: { borderStyle: "solid", borderColor: "#cccccc" }
    },
    {
      name: "Marco de Sabiduría (Lechuza)",
      description: "Identidad para los habitantes de la Casa de la Lechuza.",
      type: "frame",
      priceTinta: 150,
      rarity: "common",
      isActive: true,
      metadata: { borderStyle: "double", borderColor: "#f59e0b" }
    },
    {
      name: "Título: 'Primer Cuentista'",
      description: "Título honorífico para los pioneros de la v1.0.",
      type: "title",
      priceTinta: 50,
      rarity: "rare",
      isActive: true
    }
  ];

  for (const item of prestigeItems) {
    await prisma.storeItem.upsert({
      where: { name: item.name },
      update: item,
      create: item
    });
  }
  console.log("✅ Ítems de prestigio creados.");

  console.log("\n🔱 SIEMBRA COMPLETADA. El mundo tiene vida.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
