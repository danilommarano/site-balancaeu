import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed produção...');

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'balancaeu' },
    update: {},
    create: {
      id: randomUUID(),
      nome: 'Balança Eu',
      slug: 'balancaeu',
      emailContato: 'contato@balancaeu.com.br',
      telefone: '(11) 99999-0000',
      endereco: 'Rua da Dança, 100 - São Paulo, SP',
      cores: { primary: '#9f3023', secondary: '#1a1a1a', accent: '#d4a574', background: '#fcf9f4' }
    }
  });
  console.log('✅ Tenant:', tenant.nome);

  const hash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@balancaeu.com.br' } },
    update: {},
    create: {
      tenantId: tenant.id,
      nome: 'Administrador',
      email: 'admin@balancaeu.com.br',
      senhaHash: hash,
      role: 'ADMIN',
      telefone: '(11) 99999-0001'
    }
  });
  console.log('✅ Admin:', admin.email);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
