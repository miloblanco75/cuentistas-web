const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔱 Invocando el Catálogo de Prestigio...');

  const items = [
    // BADGES (Emblemas)
    {
      name: "🔱 Juicio Perfecto",
      description: "Otorgado a quienes han coincidido plenamente con el Tribunal en duelos legendarios.",
      type: "badge",
      priceTinta: 1200,
      rarity: "legendary",
      isActive: true
    },
    {
      name: "🩸 Voz Controvertida",
      description: "Para el juez que no teme desafiar la opinión popular con criterios sangrientos.",
      type: "badge",
      priceTinta: 500,
      rarity: "epic",
      isActive: true
    },
    {
      name: "👁️ Ojo del Tribunal",
      description: "Visión aguda para detectar la chispa literaria entre el caos.",
      type: "badge",
      priceTinta: 250,
      rarity: "rare",
      isActive: true
    },
    {
      name: "⚖️ Veredicto Implacable",
      description: "Criterio sólido como el acero, sin espacio para la duda.",
      type: "badge",
      priceTinta: 600,
      rarity: "epic",
      isActive: true
    },
    {
      name: "🔥 Criterio Ardiente",
      description: "Pasión desbordada en cada palabra sellada.",
      type: "badge",
      priceTinta: 150,
      rarity: "rare",
      isActive: true
    },
    {
      name: "🌑 Narrador Oscuro",
      description: "Maestría en las sombras de la narrativa.",
      type: "badge",
      priceTinta: 450,
      rarity: "epic",
      isActive: true
    },

    // FRAMES (Marcos)
    {
      name: "✨ Aura Dorada del Tribunal",
      description: "El resplandor de la máxima autoridad.",
      type: "frame",
      priceTinta: 1000,
      rarity: "legendary",
      isActive: true
    },
    {
      name: "🔥 Fuego del Juicio",
      description: "Tu perfil envuelto en las llamas de la Arena.",
      type: "frame",
      priceTinta: 550,
      rarity: "epic",
      isActive: true
    },
    {
      name: "🌌 Vacío Narrativo",
      description: "La profundidad del espacio entre historias.",
      type: "frame",
      priceTinta: 400,
      rarity: "epic",
      isActive: true
    },
    {
      name: "⚡ Energía del Veredicto",
      description: "Electricidad estática cargada de decisiones.",
      type: "frame",
      priceTinta: 200,
      rarity: "rare",
      isActive: true
    },
    {
      name: "🕯️ Sombra del Escritor",
      description: "La tenue luz que acompaña la creación.",
      type: "frame",
      priceTinta: 80,
      rarity: "common",
      isActive: true
    },

    // TITLES (Títulos)
    {
      name: "Aspirante del Tribunal",
      type: "title",
      priceTinta: 50,
      rarity: "common",
      isActive: true
    },
    {
      name: "Juez en Formación",
      type: "title",
      priceTinta: 150,
      rarity: "rare",
      isActive: true
    },
    {
      name: "Cronista del Juicio",
      type: "title",
      priceTinta: 300,
      rarity: "epic",
      isActive: true
    },
    {
      name: "Oráculo del Tribunal",
      type: "title",
      priceTinta: 600,
      rarity: "epic",
      isActive: true
    },
    {
      name: "Voz Suprema",
      type: "title",
      priceTinta: 1100,
      rarity: "legendary",
      isActive: true
    },
    
    // BOOSTS
    {
      name: "Sello del Tribunal",
      description: "+25% Visibilidad en el Feed durante 24h",
      type: "boost",
      priceTinta: 300,
      rarity: "rare",
      isActive: true
    },
    {
      name: "Impulso de Veredicto",
      description: "Ranking Boost temporal para escalar posiciones.",
      type: "boost",
      priceTinta: 600,
      rarity: "epic",
      isActive: true
    }
  ];

  for (const item of items) {
    await prisma.storeItem.upsert({
      where: { id: item.name.toLowerCase().replace(/ /g, '_') }, // ID determinístico temporal
      update: item,
      create: {
        id: item.name.toLowerCase().replace(/ /g, '_'),
        ...item
      }
    });
  }

  console.log('✅ Catálogo de Prestigio Sincronizado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
