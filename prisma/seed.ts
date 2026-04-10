import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

async function main() {
	console.log('🌱 Iniciando seed...');

	// ─── Tenant: Balança Eu ──────────────────────────

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
			cores: {
				primary: '#9f3023',
				secondary: '#1a1a1a',
				accent: '#d4a574',
				background: '#fcf9f4'
			}
		}
	});

	console.log(`✅ Tenant criado: ${tenant.nome} (${tenant.slug})`);

	// ─── Admin ───────────────────────────────────────

	const admin = await prisma.user.upsert({
		where: { tenantId_email: { tenantId: tenant.id, email: 'admin@balancaeu.com.br' } },
		update: {},
		create: {
			tenantId: tenant.id,
			nome: 'Administrador',
			email: 'admin@balancaeu.com.br',
			senhaHash: await hashPassword('admin123'),
			role: 'ADMIN',
			telefone: '(11) 99999-0001'
		}
	});

	console.log(`✅ Admin criado: ${admin.email}`);

	// ─── Professores ─────────────────────────────────

	const prof1 = await prisma.user.upsert({
		where: { tenantId_email: { tenantId: tenant.id, email: 'carlos@balancaeu.com.br' } },
		update: {},
		create: {
			tenantId: tenant.id,
			nome: 'Carlos Silva',
			email: 'carlos@balancaeu.com.br',
			senhaHash: await hashPassword('prof123'),
			role: 'PROFESSOR',
			telefone: '(11) 98888-0001'
		}
	});

	const prof2 = await prisma.user.upsert({
		where: { tenantId_email: { tenantId: tenant.id, email: 'ana@balancaeu.com.br' } },
		update: {},
		create: {
			tenantId: tenant.id,
			nome: 'Ana Santos',
			email: 'ana@balancaeu.com.br',
			senhaHash: await hashPassword('prof123'),
			role: 'PROFESSOR',
			telefone: '(11) 98888-0002'
		}
	});

	console.log(`✅ Professores criados: ${prof1.nome}, ${prof2.nome}`);

	// ─── Teacher profiles ────────────────────────────

	await prisma.teacher.upsert({
		where: { userId: prof1.id },
		update: {},
		create: {
			tenantId: tenant.id,
			userId: prof1.id,
			bio: 'Dançarino profissional com 15 anos de experiência em forró e samba.',
			especialidades: ['Forró Roots', 'Forró Universitário', 'Samba de Gafieira']
		}
	});

	await prisma.teacher.upsert({
		where: { userId: prof2.id },
		update: {},
		create: {
			tenantId: tenant.id,
			userId: prof2.id,
			bio: 'Formada em dança contemporânea, especialista em zouk e bachata.',
			especialidades: ['Zouk', 'Bachata', 'Dança Contemporânea']
		}
	});

	console.log('✅ Perfis de professores criados');

	// ─── Alunos ──────────────────────────────────────

	const aluno1 = await prisma.user.upsert({
		where: { tenantId_email: { tenantId: tenant.id, email: 'joao@email.com' } },
		update: {},
		create: {
			tenantId: tenant.id,
			nome: 'João Oliveira',
			email: 'joao@email.com',
			senhaHash: await hashPassword('aluno123'),
			role: 'ALUNO',
			telefone: '(11) 97777-0001'
		}
	});

	const aluno2 = await prisma.user.upsert({
		where: { tenantId_email: { tenantId: tenant.id, email: 'maria@email.com' } },
		update: {},
		create: {
			tenantId: tenant.id,
			nome: 'Maria Fernandes',
			email: 'maria@email.com',
			senhaHash: await hashPassword('aluno123'),
			role: 'ALUNO',
			telefone: '(11) 97777-0002'
		}
	});

	const aluno3 = await prisma.user.upsert({
		where: { tenantId_email: { tenantId: tenant.id, email: 'pedro@email.com' } },
		update: {},
		create: {
			tenantId: tenant.id,
			nome: 'Pedro Costa',
			email: 'pedro@email.com',
			senhaHash: await hashPassword('aluno123'),
			role: 'ALUNO',
			telefone: '(11) 97777-0003'
		}
	});

	console.log(`✅ Alunos criados: ${aluno1.nome}, ${aluno2.nome}, ${aluno3.nome}`);

	// ─── Modalidades ─────────────────────────────────

	const forro = await prisma.modality.upsert({
		where: { id: 'forro-seed' },
		update: {},
		create: {
			id: 'forro-seed',
			tenantId: tenant.id,
			nome: 'Forró',
			descricao: 'Forró raiz, universitário e pé de serra. Aprenda a dançar com alegria e tradição nordestina.'
		}
	});

	const samba = await prisma.modality.upsert({
		where: { id: 'samba-seed' },
		update: {},
		create: {
			id: 'samba-seed',
			tenantId: tenant.id,
			nome: 'Samba de Gafieira',
			descricao: 'O samba elegante dos salões cariocas. Técnica, musicalidade e conexão.'
		}
	});

	const zouk = await prisma.modality.upsert({
		where: { id: 'zouk-seed' },
		update: {},
		create: {
			id: 'zouk-seed',
			tenantId: tenant.id,
			nome: 'Zouk',
			descricao: 'Dança sensual e fluida com movimentos corporais ondulantes.'
		}
	});

	console.log(`✅ Modalidades criadas: ${forro.nome}, ${samba.nome}, ${zouk.nome}`);

	// ─── Planos ──────────────────────────────────────

	const planoBasico = await prisma.plan.upsert({
		where: { id: 'plano-basico-seed' },
		update: {},
		create: {
			id: 'plano-basico-seed',
			tenantId: tenant.id,
			nome: 'Básico',
			descricao: '2 aulas por semana em uma modalidade',
			preco: 120.0,
			maxAulasSemana: 2,
			permiteParticular: false
		}
	});

	const planoIntermediario = await prisma.plan.upsert({
		where: { id: 'plano-intermediario-seed' },
		update: {},
		create: {
			id: 'plano-intermediario-seed',
			tenantId: tenant.id,
			nome: 'Intermediário',
			descricao: '4 aulas por semana em até 2 modalidades',
			preco: 200.0,
			maxAulasSemana: 4,
			permiteParticular: false
		}
	});

	const planoFull = await prisma.plan.upsert({
		where: { id: 'plano-full-seed' },
		update: {},
		create: {
			id: 'plano-full-seed',
			tenantId: tenant.id,
			nome: 'Combo Full',
			descricao: 'Aulas ilimitadas em todas as modalidades + 1 aula particular/mês',
			preco: 350.0,
			maxAulasSemana: 99,
			permiteParticular: true
		}
	});

	console.log(`✅ Planos criados: ${planoBasico.nome}, ${planoIntermediario.nome}, ${planoFull.nome}`);

	// ─── Turmas ──────────────────────────────────────

	const turmaForroIni = await prisma.classGroup.create({
		data: {
			tenantId: tenant.id,
			modalityId: forro.id,
			professorId: prof1.id,
			nivel: 'Iniciante',
			diaSemana: 'TER',
			horarioInicio: '19:00',
			horarioFim: '20:00',
			sala: 'Sala 1',
			maxAlunos: 20
		}
	});

	const turmaForroInter = await prisma.classGroup.create({
		data: {
			tenantId: tenant.id,
			modalityId: forro.id,
			professorId: prof1.id,
			nivel: 'Intermediário',
			diaSemana: 'QUI',
			horarioInicio: '19:00',
			horarioFim: '20:00',
			sala: 'Sala 1',
			maxAlunos: 15
		}
	});

	const turmaZouk = await prisma.classGroup.create({
		data: {
			tenantId: tenant.id,
			modalityId: zouk.id,
			professorId: prof2.id,
			nivel: 'Iniciante',
			diaSemana: 'QUA',
			horarioInicio: '20:00',
			horarioFim: '21:00',
			sala: 'Sala 2',
			maxAlunos: 16
		}
	});

	const turmaSamba = await prisma.classGroup.create({
		data: {
			tenantId: tenant.id,
			modalityId: samba.id,
			professorId: prof1.id,
			nivel: 'Iniciante',
			diaSemana: 'SEX',
			horarioInicio: '20:00',
			horarioFim: '21:00',
			sala: 'Sala 1',
			maxAlunos: 18
		}
	});

	console.log('✅ Turmas criadas: 4 turmas');

	// ─── Assinaturas ─────────────────────────────────

	const now = new Date();

	await prisma.subscription.createMany({
		data: [
			{
				tenantId: tenant.id,
				userId: aluno1.id,
				planId: planoFull.id,
				status: 'ATIVA',
				inicio: now
			},
			{
				tenantId: tenant.id,
				userId: aluno2.id,
				planId: planoIntermediario.id,
				status: 'ATIVA',
				inicio: now
			},
			{
				tenantId: tenant.id,
				userId: aluno3.id,
				planId: planoBasico.id,
				status: 'ATIVA',
				inicio: now
			}
		]
	});

	console.log('✅ Assinaturas criadas para 3 alunos');

	// ─── Inscrições em turmas ────────────────────────

	await prisma.enrollment.createMany({
		data: [
			{ tenantId: tenant.id, userId: aluno1.id, classGroupId: turmaForroIni.id },
			{ tenantId: tenant.id, userId: aluno1.id, classGroupId: turmaZouk.id },
			{ tenantId: tenant.id, userId: aluno1.id, classGroupId: turmaSamba.id },
			{ tenantId: tenant.id, userId: aluno2.id, classGroupId: turmaForroIni.id },
			{ tenantId: tenant.id, userId: aluno2.id, classGroupId: turmaForroInter.id },
			{ tenantId: tenant.id, userId: aluno3.id, classGroupId: turmaForroIni.id }
		]
	});

	console.log('✅ Inscrições em turmas criadas');

	// ─── CMS Content (landing page) ──────────────────

	const cmsData = [
		// Hero
		{ secao: 'hero', chave: 'titulo', valorTexto: 'Balança Eu: Muito mais que uma escola de dança.', ordem: 1 },
		{ secao: 'hero', chave: 'subtitulo', valorTexto: 'Um movimento que começa no corpo e transforma quem você é.', ordem: 2 },
		{ secao: 'hero', chave: 'cta_texto', valorTexto: 'Começar Jornada', ordem: 3 },
		{ secao: 'hero', chave: 'cta_link', valorTexto: '/cadastro', ordem: 4 },
		{ secao: 'hero', chave: 'imagem', valorImagemUrl: '/assets/hero-dance.png', ordem: 5 },
		{ secao: 'hero', chave: 'frase_destaque', valorTexto: 'Movimento é cura.', ordem: 6 },

		// Escola
		{ secao: 'escola', chave: 'label', valorTexto: 'Balança Eu', ordem: 1 },
		{ secao: 'escola', chave: 'titulo', valorTexto: 'Um espaço de encontro, arte e identidade.', ordem: 2 },
		{ secao: 'escola', chave: 'paragrafo_1', valorTexto: 'No Balança Eu, acreditamos que o corpo é o nosso primeiro território. Não ensinamos apenas passos; cultivamos a percepção de si através do ritmo e da expressão artística.', ordem: 3 },
		{ secao: 'escola', chave: 'paragrafo_2', valorTexto: 'Nossa casa é um refúgio contemporâneo onde a tradição e a inovação se abraçam para criar novas linguagens corporais e conexões humanas profundas.', ordem: 4 },

		// Preços
		{ secao: 'precos', chave: 'label', valorTexto: 'Investimento', ordem: 1 },
		{ secao: 'precos', chave: 'titulo', valorTexto: 'Nossos Preços', ordem: 2 },
		{ secao: 'precos', chave: 'descricao', valorTexto: 'Escolha o ritmo que combina com seu estilo de vida. Valores mensais por modalidade.', ordem: 3 },

		// Professores
		{ secao: 'professores', chave: 'label', valorTexto: 'Mestres do Movimento', ordem: 1 },
		{ secao: 'professores', chave: 'titulo', valorTexto: 'Quem conduz sua evolução', ordem: 2 },
		{ secao: 'professores', chave: 'descricao', valorTexto: 'Nossa equipe é formada por artistas apaixonados e profissionais sensíveis ao seu tempo e ritmo.', ordem: 3 },

		// Horários
		{ secao: 'horarios', chave: 'label', valorTexto: 'Nossa Agenda', ordem: 1 },
		{ secao: 'horarios', chave: 'titulo', valorTexto: 'Grade de Aulas', ordem: 2 },

		// Eventos
		{ secao: 'eventos', chave: 'label', valorTexto: 'Agenda Cultural', ordem: 1 },
		{ secao: 'eventos', chave: 'titulo', valorTexto: 'Próximos Eventos', ordem: 2 },
		{ secao: 'eventos', chave: 'descricao', valorTexto: 'Vibrações que transcendem as aulas regulares. Conheça nossa programação especial.', ordem: 3 },

		// CTA Final
		{ secao: 'cta_final', chave: 'titulo', valorTexto: 'Seja parte do movimento.', ordem: 1 },
		{ secao: 'cta_final', chave: 'titulo_destaque', valorTexto: 'Venha viver a experiência Balança Eu.', ordem: 2 },
		{ secao: 'cta_final', chave: 'cta_primario_texto', valorTexto: 'Agendar Aula Experimental', ordem: 3 },
		{ secao: 'cta_final', chave: 'cta_primario_link', valorTexto: '/cadastro', ordem: 4 },
		{ secao: 'cta_final', chave: 'cta_secundario_texto', valorTexto: 'Falar com Consultor', ordem: 5 },

		// Contato
		{ secao: 'contato', chave: 'whatsapp', valorTexto: '5511999990000', ordem: 1 },
		{ secao: 'contato', chave: 'instagram', valorTexto: '@balancaeu', ordem: 2 },
		{ secao: 'contato', chave: 'instagram_url', valorTexto: 'https://instagram.com/balancaeu', ordem: 3 },
		{ secao: 'contato', chave: 'whatsapp_url', valorTexto: 'https://wa.me/5511999990000', ordem: 4 },
		{ secao: 'contato', chave: 'email', valorTexto: 'contato@balancaeu.com.br', ordem: 5 },

		// Footer
		{ secao: 'footer', chave: 'descricao', valorTexto: 'Um centro cultural dedicado ao movimento consciente, à arte performática e ao florescimento humano através do corpo.', ordem: 1 },
		{ secao: 'footer', chave: 'copyright', valorTexto: '© 2024 Balança Eu. Onde o movimento encontra a alma.', ordem: 2 }
	];

	for (const item of cmsData) {
		await prisma.cmsContent.upsert({
			where: {
				tenantId_secao_chave: {
					tenantId: tenant.id,
					secao: item.secao,
					chave: item.chave
				}
			},
			update: {},
			create: {
				tenantId: tenant.id,
				secao: item.secao,
				chave: item.chave,
				valorTexto: item.valorTexto ?? null,
				valorImagemUrl: (item as { valorImagemUrl?: string }).valorImagemUrl ?? null,
				ordem: item.ordem
			}
		});
	}

	console.log('✅ Conteúdo CMS criado para landing page (todas as seções)');

	// ─── Evento ──────────────────────────────────────

	const eventDate = new Date();
	eventDate.setDate(eventDate.getDate() + 30);

	await prisma.event.create({
		data: {
			tenantId: tenant.id,
			titulo: 'Forró na Praça',
			descricao:
				'Venha dançar forró ao ar livre! Aula aberta para iniciantes + baile com banda ao vivo.',
			data: eventDate,
			horario: '16:00 - 22:00',
			local: 'Praça da República, São Paulo',
			preco: 25.0
		}
	});

	console.log('✅ Evento criado');

	console.log('\n🎉 Seed concluído com sucesso!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error('❌ Erro no seed:', e);
		await prisma.$disconnect();
		process.exit(1);
	});
