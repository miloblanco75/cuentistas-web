const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.user.update({
  where: { email: 'ermiloblanco75@gmail.com' },
  data: { rol: 'Maestro', tinta: 9999, nivel: 'Gran Maestro del Conclave' }
}).then(u => {
  console.log('========================================');
  console.log('MAESTRO ACTIVADO:', u.email);
  console.log('Nuevo Rol:', u.rol);
  console.log('========================================');
  p.$disconnect();
}).catch(e => {
  console.error('Error:', e.message);
  p.$disconnect();
});
