// ===========================================
// Pulso — Seed do banco de dados (idempotente)
// ===========================================
// Cria tenant, admin, planos, CMS e popula modalidades/professores/turmas.
// Roda também como reset: apaga dados de modalidades/turmas/alunos não-admin.

import { PrismaClient, DayOfWeek } from '@prisma/client';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

async function main() {
	console.log('🌱 Iniciando seed...');

	// ─── Tenant ──────────────────────────────────────
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
	console.log(`✅ Tenant: ${tenant.nome}`);

	const tenantId = tenant.id;

	// ─── Admin (upsert) ──────────────────────────────
	await prisma.user.upsert({
		where: { tenantId_email: { tenantId, email: 'admin@balancaeu.com.br' } },
		update: {},
		create: {
			tenantId,
			nome: 'Administrador',
			email: 'admin@balancaeu.com.br',
			senhaHash: await hashPassword('admin123'),
			role: 'ADMIN',
			telefone: '(11) 99999-0001'
		}
	});
	console.log('✅ Admin pronto');

	// ─── Reset: apaga modalidades, turmas, alunos não-admin, professores ─
	console.log('🧹 Limpando dados antigos...');
	await prisma.placementBooking.deleteMany({ where: { tenantId } });
	await prisma.attendance.deleteMany({ where: { tenantId } });
	await prisma.checkIn.deleteMany({ where: { tenantId } });
	await prisma.enrollment.deleteMany({ where: { tenantId } });
	await prisma.privateLesson.deleteMany({ where: { tenantId } });
	await prisma.classGroup.deleteMany({ where: { tenantId } });
	await prisma.teacherAvailability.deleteMany({ where: { teacher: { tenantId } } });
	await prisma.teacher.deleteMany({ where: { tenantId } });
	await prisma.modality.deleteMany({ where: { tenantId } });
	await prisma.subscription.deleteMany({ where: { tenantId } });
	await prisma.faceDescriptor.deleteMany({ where: { tenantId } });
	await prisma.user.deleteMany({
		where: { tenantId, role: { in: ['PROFESSOR', 'ALUNO'] } }
	});
	console.log('✅ Base limpa');

	// ─── Modalidades ─────────────────────────────────
	const modalityData = [
		{
			id: 'forro-roots',
			nome: 'Forró Roots',
			descricao: 'Forró tradicional nordestino, com passo marcado, giros e caminhadas. A raiz que move o corpo.'
		},
		{
			id: 'samba-de-gafieira',
			nome: 'Samba de Gafieira',
			descricao: 'O samba elegante dos salões cariocas. Técnica, musicalidade e conexão em dupla.'
		},
		{
			id: 'yoga',
			nome: 'Yoga',
			descricao: 'Prática milenar que une corpo, respiração e mente. Força, flexibilidade e presença.'
		},
		{
			id: 'zumba',
			nome: 'Zumba',
			descricao: 'Dança-fitness com ritmos latinos. Queima calorias enquanto você se diverte.'
		}
	];

	const modalidades = await Promise.all(
		modalityData.map(m =>
			prisma.modality.create({ data: { ...m, tenantId } })
		)
	);
	console.log(`✅ Modalidades: ${modalidades.map(m => m.nome).join(', ')}`);

	// ─── Professores ─────────────────────────────────
	async function createProfessor(
		nome: string,
		email: string,
		bio: string,
		modalityIds: string[],
		especialidades: string[]
	) {
		const user = await prisma.user.create({
			data: {
				tenantId,
				nome,
				email,
				senhaHash: await hashPassword('prof123'),
				role: 'PROFESSOR'
			}
		});
		await prisma.teacher.create({
			data: {
				tenantId,
				userId: user.id,
				bio,
				especialidades,
				modalities: { connect: modalityIds.map(id => ({ id })) }
			}
		});
		return user;
	}

	const danilo = await createProfessor(
		'Danilo Marano',
		'danilo@balancaeu.com.br',
		'Professor de Forró Roots, apaixonado pela tradição nordestina e pela dança enraizada na cultura popular.',
		['forro-roots'],
		['Forró Roots', 'Forró Pé de Serra']
	);
	const mari = await createProfessor(
		'Mari Meireles',
		'mari@balancaeu.com.br',
		'Dançarina de forró há mais de uma década. Especialista em footwork e técnica feminina.',
		['forro-roots'],
		['Forró Roots', 'Footwork']
	);
	const ani = await createProfessor(
		'Ani Gâlíoti',
		'ani@balancaeu.com.br',
		'Profissional de samba de gafieira com forte formação em dança de salão brasileira.',
		['samba-de-gafieira'],
		['Samba de Gafieira', 'Dança de Salão']
	);
	const renato = await createProfessor(
		'Renato Almeida (Renatinho)',
		'renato@balancaeu.com.br',
		'Mestre de samba de gafieira, herdeiro da escola carioca tradicional dos salões.',
		['samba-de-gafieira'],
		['Samba de Gafieira', 'Samba de Salão']
	);
	const maria = await createProfessor(
		'Maria Eduarda Balestro',
		'maria@balancaeu.com.br',
		'Professora de yoga certificada em Hatha e Vinyasa. Conduz práticas suaves e transformadoras.',
		['yoga'],
		['Hatha Yoga', 'Vinyasa Flow', 'Yin Yoga']
	);
	const caio = await createProfessor(
		'Caio Amorim (Supimpa)',
		'caio@balancaeu.com.br',
		'Instrutor oficial de Zumba. Energia total, ritmos latinos e muita diversão.',
		['zumba'],
		['Zumba Fitness', 'Ritmos Latinos']
	);

	console.log('✅ Professores criados');

	const professorMap = {
		danilo: danilo.id,
		mari: mari.id,
		ani: ani.id,
		renato: renato.id,
		maria: maria.id,
		caio: caio.id
	};

	// ─── Turmas ──────────────────────────────────────
	type ClassDef = {
		modalityId: string;
		professorId: string;
		nivel: string;
		diaSemana: DayOfWeek;
		horarioInicio: string;
		horarioFim: string;
		sala: string;
		maxAlunos: number;
	};

	const classes: ClassDef[] = [
		// ─── Forró Roots — cronograma oficial ──────────
		// Quarta → Sala 3
		{ modalityId: 'forro-roots', professorId: professorMap.danilo, nivel: 'Introdução ao Roots', diaSemana: 'QUA', horarioInicio: '19:00', horarioFim: '20:00', sala: 'Sala 3', maxAlunos: 20 },
		{ modalityId: 'forro-roots', professorId: professorMap.mari, nivel: 'Caminhadas e Giros', diaSemana: 'QUA', horarioInicio: '20:00', horarioFim: '21:00', sala: 'Sala 3', maxAlunos: 20 },
		{ modalityId: 'forro-roots', professorId: professorMap.danilo, nivel: 'Footwork', diaSemana: 'QUA', horarioInicio: '21:00', horarioFim: '22:00', sala: 'Sala 3', maxAlunos: 20 },
		// Sexta → Sala 1
		{ modalityId: 'forro-roots', professorId: professorMap.mari, nivel: 'Footwork', diaSemana: 'SEX', horarioInicio: '19:00', horarioFim: '20:00', sala: 'Sala 1', maxAlunos: 20 },
		{ modalityId: 'forro-roots', professorId: professorMap.danilo, nivel: 'Introdução ao Roots', diaSemana: 'SEX', horarioInicio: '20:00', horarioFim: '21:00', sala: 'Sala 1', maxAlunos: 20 },
		{ modalityId: 'forro-roots', professorId: professorMap.mari, nivel: 'Caminhadas e Giros', diaSemana: 'SEX', horarioInicio: '21:00', horarioFim: '22:00', sala: 'Sala 1', maxAlunos: 20 },
		// Sábado → Sala 1
		{ modalityId: 'forro-roots', professorId: professorMap.danilo, nivel: 'Introdução ao Roots', diaSemana: 'SAB', horarioInicio: '14:00', horarioFim: '15:00', sala: 'Sala 1', maxAlunos: 20 },
		{ modalityId: 'forro-roots', professorId: professorMap.mari, nivel: 'Caminhadas e Giros', diaSemana: 'SAB', horarioInicio: '15:00', horarioFim: '16:00', sala: 'Sala 1', maxAlunos: 20 },
		{ modalityId: 'forro-roots', professorId: professorMap.danilo, nivel: 'Footwork', diaSemana: 'SAB', horarioInicio: '16:00', horarioFim: '17:00', sala: 'Sala 1', maxAlunos: 20 },

		// ─── Samba de Gafieira — provisório ────────────
		{ modalityId: 'samba-de-gafieira', professorId: professorMap.ani, nivel: 'Iniciante', diaSemana: 'TER', horarioInicio: '19:00', horarioFim: '20:00', sala: 'Sala 2', maxAlunos: 18 },
		{ modalityId: 'samba-de-gafieira', professorId: professorMap.renato, nivel: 'Intermediário', diaSemana: 'TER', horarioInicio: '20:00', horarioFim: '21:00', sala: 'Sala 2', maxAlunos: 18 },
		{ modalityId: 'samba-de-gafieira', professorId: professorMap.renato, nivel: 'Iniciante', diaSemana: 'QUI', horarioInicio: '19:00', horarioFim: '20:00', sala: 'Sala 2', maxAlunos: 18 },
		{ modalityId: 'samba-de-gafieira', professorId: professorMap.ani, nivel: 'Intermediário', diaSemana: 'QUI', horarioInicio: '20:00', horarioFim: '21:00', sala: 'Sala 2', maxAlunos: 18 },
		{ modalityId: 'samba-de-gafieira', professorId: professorMap.ani, nivel: 'Iniciante', diaSemana: 'SAB', horarioInicio: '10:00', horarioFim: '11:00', sala: 'Sala 2', maxAlunos: 18 },
		{ modalityId: 'samba-de-gafieira', professorId: professorMap.renato, nivel: 'Avançado', diaSemana: 'SAB', horarioInicio: '11:00', horarioFim: '12:00', sala: 'Sala 2', maxAlunos: 18 },

		// ─── Yoga — provisório ─────────────────────────
		{ modalityId: 'yoga', professorId: professorMap.maria, nivel: 'Hatha Yoga', diaSemana: 'SEG', horarioInicio: '07:00', horarioFim: '08:00', sala: 'Sala 2', maxAlunos: 15 },
		{ modalityId: 'yoga', professorId: professorMap.maria, nivel: 'Vinyasa Flow', diaSemana: 'QUA', horarioInicio: '07:00', horarioFim: '08:00', sala: 'Sala 2', maxAlunos: 15 },
		{ modalityId: 'yoga', professorId: professorMap.maria, nivel: 'Yin Yoga', diaSemana: 'SEX', horarioInicio: '07:00', horarioFim: '08:00', sala: 'Sala 2', maxAlunos: 15 },
		{ modalityId: 'yoga', professorId: professorMap.maria, nivel: 'Hatha Yoga', diaSemana: 'SAB', horarioInicio: '09:00', horarioFim: '10:00', sala: 'Sala 3', maxAlunos: 15 },

		// ─── Zumba — provisório ────────────────────────
		{ modalityId: 'zumba', professorId: professorMap.caio, nivel: 'Zumba Fitness', diaSemana: 'SEG', horarioInicio: '18:00', horarioFim: '19:00', sala: 'Sala 1', maxAlunos: 25 },
		{ modalityId: 'zumba', professorId: professorMap.caio, nivel: 'Zumba Fitness', diaSemana: 'QUA', horarioInicio: '18:00', horarioFim: '19:00', sala: 'Sala 1', maxAlunos: 25 },
		{ modalityId: 'zumba', professorId: professorMap.caio, nivel: 'Zumba Toning', diaSemana: 'SEX', horarioInicio: '18:00', horarioFim: '19:00', sala: 'Sala 3', maxAlunos: 25 },
		{ modalityId: 'zumba', professorId: professorMap.caio, nivel: 'Zumba Party', diaSemana: 'SAB', horarioInicio: '12:00', horarioFim: '13:00', sala: 'Sala 3', maxAlunos: 25 }
	];

	for (const c of classes) {
		await prisma.classGroup.create({ data: { tenantId, ...c } });
	}
	console.log(`✅ ${classes.length} turmas criadas`);

	// ─── Planos (upsert) ─────────────────────────────
	await prisma.plan.upsert({
		where: { id: 'plano-basico-seed' },
		update: {},
		create: {
			id: 'plano-basico-seed',
			tenantId,
			nome: 'Básico',
			descricao: '2 aulas por semana em uma modalidade',
			preco: 120.0,
			maxAulasSemana: 2,
			permiteParticular: false
		}
	});
	await prisma.plan.upsert({
		where: { id: 'plano-intermediario-seed' },
		update: {},
		create: {
			id: 'plano-intermediario-seed',
			tenantId,
			nome: 'Intermediário',
			descricao: '4 aulas por semana em até 2 modalidades',
			preco: 200.0,
			maxAulasSemana: 4,
			permiteParticular: false
		}
	});
	await prisma.plan.upsert({
		where: { id: 'plano-full-seed' },
		update: {},
		create: {
			id: 'plano-full-seed',
			tenantId,
			nome: 'Combo Full',
			descricao: 'Aulas ilimitadas em todas as modalidades + 1 aula particular/mês',
			preco: 350.0,
			maxAulasSemana: 99,
			permiteParticular: true
		}
	});
	console.log('✅ Planos prontos');

	// ─── CMS (upsert) ────────────────────────────────
	const cmsData = [
		{ secao: 'hero', chave: 'titulo', valorTexto: 'Balança Eu: Muito mais que uma escola de dança.', ordem: 1 },
		{ secao: 'hero', chave: 'subtitulo', valorTexto: 'Um movimento que começa no corpo e transforma quem você é.', ordem: 2 },
		{ secao: 'hero', chave: 'cta_texto', valorTexto: 'Começar Jornada', ordem: 3 },
		{ secao: 'hero', chave: 'cta_link', valorTexto: '/comecar', ordem: 4 },
		{ secao: 'hero', chave: 'imagem', valorImagemUrl: '/assets/hero-dance.png', ordem: 5 },
		{ secao: 'hero', chave: 'frase_destaque', valorTexto: 'Movimento é cura.', ordem: 6 },

		{ secao: 'escola', chave: 'label', valorTexto: 'Balança Eu', ordem: 1 },
		{ secao: 'escola', chave: 'titulo', valorTexto: 'Um espaço de encontro, arte e identidade.', ordem: 2 },
		{ secao: 'escola', chave: 'paragrafo_1', valorTexto: 'No Balança Eu, acreditamos que o corpo é o nosso primeiro território. Não ensinamos apenas passos; cultivamos a percepção de si através do ritmo e da expressão artística.', ordem: 3 },
		{ secao: 'escola', chave: 'paragrafo_2', valorTexto: 'Nossa casa é um refúgio contemporâneo onde a tradição e a inovação se abraçam para criar novas linguagens corporais e conexões humanas profundas.', ordem: 4 },

		{ secao: 'modulos', chave: 'label', valorTexto: 'Nossas Práticas', ordem: 1 },
		{ secao: 'modulos', chave: 'titulo', valorTexto: 'Nossos Módulos', ordem: 2 },
		{ secao: 'modulos', chave: 'descricao', valorTexto: 'Explore cada modalidade e encontre o ritmo que transforma.', ordem: 3 },

		{ secao: 'professores', chave: 'label', valorTexto: 'Mestres do Movimento', ordem: 1 },
		{ secao: 'professores', chave: 'titulo', valorTexto: 'Quem conduz sua evolução', ordem: 2 },
		{ secao: 'professores', chave: 'descricao', valorTexto: 'Nossa equipe é formada por artistas apaixonados e profissionais sensíveis ao seu tempo e ritmo.', ordem: 3 },

		{ secao: 'horarios', chave: 'label', valorTexto: 'Nossa Agenda', ordem: 1 },
		{ secao: 'horarios', chave: 'titulo', valorTexto: 'Grade de Aulas', ordem: 2 },

		{ secao: 'eventos', chave: 'label', valorTexto: 'Agenda Cultural', ordem: 1 },
		{ secao: 'eventos', chave: 'titulo', valorTexto: 'Próximos Eventos', ordem: 2 },
		{ secao: 'eventos', chave: 'descricao', valorTexto: 'Vibrações que transcendem as aulas regulares. Conheça nossa programação especial.', ordem: 3 },

		{ secao: 'cta_final', chave: 'titulo', valorTexto: 'Seja parte do movimento.', ordem: 1 },
		{ secao: 'cta_final', chave: 'titulo_destaque', valorTexto: 'Venha viver a experiência Balança Eu.', ordem: 2 },
		{ secao: 'cta_final', chave: 'cta_primario_texto', valorTexto: 'Agendar Aula Experimental', ordem: 3 },
		{ secao: 'cta_final', chave: 'cta_primario_link', valorTexto: '/comecar', ordem: 4 },
		{ secao: 'cta_final', chave: 'cta_secundario_texto', valorTexto: 'Falar com Consultor', ordem: 5 },

		{ secao: 'contato', chave: 'whatsapp', valorTexto: '5511999990000', ordem: 1 },
		{ secao: 'contato', chave: 'instagram', valorTexto: '@balancaeu', ordem: 2 },
		{ secao: 'contato', chave: 'instagram_url', valorTexto: 'https://instagram.com/balancaeu', ordem: 3 },
		{ secao: 'contato', chave: 'whatsapp_url', valorTexto: 'https://wa.me/5511999990000', ordem: 4 },
		{ secao: 'contato', chave: 'email', valorTexto: 'contato@balancaeu.com.br', ordem: 5 },

		{ secao: 'footer', chave: 'descricao', valorTexto: 'Um centro cultural dedicado ao movimento consciente, à arte performática e ao florescimento humano através do corpo.', ordem: 1 },
		{ secao: 'footer', chave: 'copyright', valorTexto: '© 2024 Balança Eu. Onde o movimento encontra a alma.', ordem: 2 }
	];

	for (const item of cmsData) {
		await prisma.cmsContent.upsert({
			where: { tenantId_secao_chave: { tenantId, secao: item.secao, chave: item.chave } },
			update: {},
			create: {
				tenantId,
				secao: item.secao,
				chave: item.chave,
				valorTexto: item.valorTexto ?? null,
				valorImagemUrl: (item as { valorImagemUrl?: string }).valorImagemUrl ?? null,
				ordem: item.ordem
			}
		});
	}
	console.log('✅ CMS pronto');

	console.log('\n🎉 Seed concluído com sucesso!');
	console.log('   → Login admin: admin@balancaeu.com.br / admin123');
	console.log('   → Login professor: <nome>@balancaeu.com.br / prof123');
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
