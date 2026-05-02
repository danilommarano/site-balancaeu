// ===========================================
// Balança Eu — Seed completa (idempotente)
// ===========================================
// Reseta TODO o banco para um estado consistente de testes.
// Roda múltiplas vezes sem duplicar nada — toda execução restaura
// o snapshot definido aqui.
//
// Cobre: tenant, admin, planos, modalidades, professores (com
// disponibilidades), turmas, alunos, assinaturas, inscrições,
// presenças/faltas, check-ins, aulas particulares (passadas e
// futuras), transações financeiras, eventos, nivelamentos, CMS.

import {
	PrismaClient,
	DayOfWeek,
	SubscriptionStatus,
	EnrollmentStatus,
	LessonStatus,
	CheckInMethod,
	TransactionType,
	TransactionStatus,
	PlacementStatus
} from '@prisma/client';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ─── PRNG determinístico ────────────────────────────
// Garante que rodar o seed 2x produz exatamente os mesmos dados
let seedNum = 1337;
function rng(): number {
	seedNum = (seedNum * 9301 + 49297) % 233280;
	return seedNum / 233280;
}
function pick<T>(arr: T[]): T {
	return arr[Math.floor(rng() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
	const copy = [...arr];
	const out: T[] = [];
	for (let i = 0; i < n && copy.length > 0; i++) {
		const idx = Math.floor(rng() * copy.length);
		out.push(copy[idx]);
		copy.splice(idx, 1);
	}
	return out;
}
function chance(p: number): boolean {
	return rng() < p;
}

const DOW: DayOfWeek[] = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
function dowOf(d: Date): DayOfWeek {
	return DOW[d.getDay()];
}

async function hashPassword(p: string): Promise<string> {
	return bcrypt.hash(p, 12);
}

// Combinar uma data com um horário "HH:MM"
function atTime(date: Date, hhmm: string): Date {
	const [h, m] = hhmm.split(':').map(Number);
	const out = new Date(date);
	out.setHours(h, m, 0, 0);
	return out;
}

async function main() {
	console.log('🌱 Iniciando seed...');

	// ─── Tenant (upsert, fixo) ──────────────────────────
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
	const tenantId = tenant.id;
	console.log(`✅ Tenant: ${tenant.nome}`);

	// ─── Admin (upsert) ─────────────────────────────────
	const admin = await prisma.user.upsert({
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

	// ─── WIPE: apaga tudo do tenant exceto admin e o próprio tenant ─
	console.log('🧹 Limpando dados antigos...');
	await prisma.transaction.deleteMany({ where: { tenantId } });
	await prisma.attendance.deleteMany({ where: { tenantId } });
	await prisma.checkIn.deleteMany({ where: { tenantId } });
	await prisma.placementBooking.deleteMany({ where: { tenantId } });
	await prisma.enrollment.deleteMany({ where: { tenantId } });
	await prisma.privateLesson.deleteMany({ where: { tenantId } });
	await prisma.classGroup.deleteMany({ where: { tenantId } });
	await prisma.teacherAvailability.deleteMany({ where: { teacher: { tenantId } } });
	await prisma.teacher.deleteMany({ where: { tenantId } });
	await prisma.modality.deleteMany({ where: { tenantId } });
	await prisma.subscription.deleteMany({ where: { tenantId } });
	await prisma.faceDescriptor.deleteMany({ where: { tenantId } });
	await prisma.event.deleteMany({ where: { tenantId } });
	await prisma.user.deleteMany({
		where: { tenantId, role: { in: ['PROFESSOR', 'ALUNO'] } }
	});
	// Plans + CMS são feitos por upsert mais à frente (mantêm IDs estáveis)
	console.log('✅ Base limpa');

	// ─── Modalidades ────────────────────────────────────
	const modalidades = await Promise.all(
		[
			{
				id: 'forro-roots',
				nome: 'Forró Roots',
				descricao:
					'Forró tradicional nordestino, com passo marcado, giros e caminhadas. A raiz que move o corpo.'
			},
			{
				id: 'forro-pe-descalco',
				nome: 'Forró Pé Descalço',
				descricao:
					'Método Pé Descalço de ensino de forró, com progressão por graduações (Azul, Branca, Transparente, Preta).'
			},
			{
				id: 'samba-de-gafieira',
				nome: 'Samba de Gafieira',
				descricao:
					'O samba elegante dos salões cariocas. Técnica, musicalidade e conexão em dupla.'
			}
		].map(m => prisma.modality.create({ data: { ...m, tenantId } }))
	);
	console.log(`✅ ${modalidades.length} modalidades`);

	// ─── Planos (upsert, IDs estáveis) ──────────────────
	const planos = await Promise.all([
		prisma.plan.upsert({
			where: { id: 'plano-basico-seed' },
			update: {
				nome: 'Básico',
				descricao: '2 aulas por semana em uma modalidade',
				preco: 120.0,
				maxAulasSemana: 2,
				permiteParticular: false
			},
			create: {
				id: 'plano-basico-seed',
				tenantId,
				nome: 'Básico',
				descricao: '2 aulas por semana em uma modalidade',
				preco: 120.0,
				maxAulasSemana: 2,
				permiteParticular: false
			}
		}),
		prisma.plan.upsert({
			where: { id: 'plano-intermediario-seed' },
			update: {
				nome: 'Intermediário',
				descricao: '4 aulas por semana em até 2 modalidades',
				preco: 200.0,
				maxAulasSemana: 4,
				permiteParticular: false
			},
			create: {
				id: 'plano-intermediario-seed',
				tenantId,
				nome: 'Intermediário',
				descricao: '4 aulas por semana em até 2 modalidades',
				preco: 200.0,
				maxAulasSemana: 4,
				permiteParticular: false
			}
		}),
		prisma.plan.upsert({
			where: { id: 'plano-full-seed' },
			update: {
				nome: 'Combo Full',
				descricao: 'Aulas ilimitadas + 1 aula particular/mês',
				preco: 350.0,
				maxAulasSemana: 99,
				permiteParticular: true
			},
			create: {
				id: 'plano-full-seed',
				tenantId,
				nome: 'Combo Full',
				descricao: 'Aulas ilimitadas + 1 aula particular/mês',
				preco: 350.0,
				maxAulasSemana: 99,
				permiteParticular: true
			}
		})
	]);
	const planoBasico = planos[0];
	const planoInter = planos[1];
	const planoFull = planos[2];
	console.log(`✅ ${planos.length} planos`);

	// ─── Professores ────────────────────────────────────
	type AvailDef = { dia: DayOfWeek; inicio: string; fim: string };
	type ProfDef = {
		nome: string;
		email: string;
		bio: string;
		modalityIds: string[];
		especialidades: string[];
		availabilities: AvailDef[];
	};

	const profDefs: ProfDef[] = [
		{
			nome: 'Danilo Marano',
			email: 'danilo@balancaeu.com.br',
			bio: 'Professor de Forró Roots, apaixonado pela tradição nordestina e pela dança enraizada na cultura popular.',
			modalityIds: ['forro-roots'],
			especialidades: ['Forró Roots', 'Forró Pé de Serra'],
			availabilities: [
				{ dia: 'TER', inicio: '14:00', fim: '18:00' },
				{ dia: 'QUI', inicio: '14:00', fim: '18:00' },
				{ dia: 'SAB', inicio: '09:00', fim: '13:00' }
			]
		},
		{
			nome: 'Mari Meireles',
			email: 'mari@balancaeu.com.br',
			bio: 'Dançarina de forró há mais de uma década. Especialista em footwork e técnica feminina.',
			modalityIds: ['forro-roots'],
			especialidades: ['Forró Roots', 'Footwork'],
			availabilities: [
				{ dia: 'SEG', inicio: '13:00', fim: '18:00' },
				{ dia: 'QUA', inicio: '13:00', fim: '18:00' },
				{ dia: 'SEX', inicio: '14:00', fim: '19:00' }
			]
		},
		{
			nome: 'Ani Gâlíoti',
			email: 'ani@balancaeu.com.br',
			bio: 'Profissional de samba de gafieira com forte formação em dança de salão brasileira.',
			modalityIds: ['samba-de-gafieira'],
			especialidades: ['Samba de Gafieira', 'Dança de Salão'],
			availabilities: [
				{ dia: 'SEG', inicio: '14:00', fim: '19:00' },
				{ dia: 'QUA', inicio: '14:00', fim: '19:00' },
				{ dia: 'SEX', inicio: '15:00', fim: '19:00' }
			]
		},
		{
			nome: 'Renato Almeida',
			email: 'renato@balancaeu.com.br',
			bio: 'Mestre de samba de gafieira, herdeiro da escola carioca tradicional dos salões.',
			modalityIds: ['samba-de-gafieira'],
			especialidades: ['Samba de Gafieira', 'Samba de Salão'],
			availabilities: [
				{ dia: 'TER', inicio: '13:00', fim: '19:00' },
				{ dia: 'QUI', inicio: '13:00', fim: '19:00' }
			]
		},
		{
			nome: 'Equipe Forró Pé Descalço',
			email: 'pedescalco@balancaeu.com.br',
			bio: 'Corpo docente do método Pé Descalço. Graduações progressivas do Azul Iniciante à Preta Avançada.',
			modalityIds: ['forro-pe-descalco'],
			especialidades: ['Forró Pé Descalço', 'Método Pé Descalço'],
			availabilities: [
				{ dia: 'SEG', inicio: '10:00', fim: '18:00' },
				{ dia: 'TER', inicio: '10:00', fim: '18:00' },
				{ dia: 'SEX', inicio: '13:00', fim: '18:00' }
			]
		}
	];

	const professores: { id: string; nome: string }[] = [];
	for (const def of profDefs) {
		const u = await prisma.user.create({
			data: {
				tenantId,
				nome: def.nome,
				email: def.email,
				senhaHash: await hashPassword('prof123'),
				role: 'PROFESSOR',
				telefone: `(11) 9${Math.floor(rng() * 90000000 + 10000000)}`
			}
		});
		const teacher = await prisma.teacher.create({
			data: {
				tenantId,
				userId: u.id,
				bio: def.bio,
				especialidades: def.especialidades,
				modalities: { connect: def.modalityIds.map(id => ({ id })) }
			}
		});
		await prisma.teacherAvailability.createMany({
			data: def.availabilities.map(a => ({
				teacherId: teacher.id,
				diaSemana: a.dia,
				horarioInicio: a.inicio,
				horarioFim: a.fim
			}))
		});
		professores.push({ id: u.id, nome: u.nome });
	}
	const danilo = professores.find(p => p.nome === 'Danilo Marano')!;
	const mari = professores.find(p => p.nome === 'Mari Meireles')!;
	const ani = professores.find(p => p.nome === 'Ani Gâlíoti')!;
	const renato = professores.find(p => p.nome === 'Renato Almeida')!;
	const peDescalco = professores.find(p => p.nome === 'Equipe Forró Pé Descalço')!;
	console.log(`✅ ${professores.length} professores (com disponibilidades)`);

	// ─── Turmas ─────────────────────────────────────────
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
		// SEGUNDA — Sala 3 — Samba
		{ modalityId: 'samba-de-gafieira', professorId: ani.id, nivel: 'Iniciante', diaSemana: 'SEG', horarioInicio: '19:30', horarioFim: '20:30', sala: 'Sala 3', maxAlunos: 18 },
		{ modalityId: 'samba-de-gafieira', professorId: renato.id, nivel: 'Intermediário', diaSemana: 'SEG', horarioInicio: '20:30', horarioFim: '21:40', sala: 'Sala 3', maxAlunos: 18 },
		// TERÇA — Sala 3 — Samba
		{ modalityId: 'samba-de-gafieira', professorId: ani.id, nivel: 'Iniciante', diaSemana: 'TER', horarioInicio: '19:30', horarioFim: '20:30', sala: 'Sala 3', maxAlunos: 18 },
		{ modalityId: 'samba-de-gafieira', professorId: renato.id, nivel: 'Avançado', diaSemana: 'TER', horarioInicio: '20:30', horarioFim: '21:40', sala: 'Sala 3', maxAlunos: 18 },
		// QUARTA — Sala 1 — Pé Descalço
		{ modalityId: 'forro-pe-descalco', professorId: peDescalco.id, nivel: 'Azul Iniciante', diaSemana: 'QUA', horarioInicio: '19:00', horarioFim: '20:00', sala: 'Sala 1', maxAlunos: 20 },
		{ modalityId: 'forro-pe-descalco', professorId: peDescalco.id, nivel: 'Branca e Transparente', diaSemana: 'QUA', horarioInicio: '20:00', horarioFim: '21:00', sala: 'Sala 1', maxAlunos: 20 },
		{ modalityId: 'forro-pe-descalco', professorId: peDescalco.id, nivel: 'Azul Avançado', diaSemana: 'QUA', horarioInicio: '21:00', horarioFim: '22:00', sala: 'Sala 1', maxAlunos: 20 },
		// QUARTA — Sala 2 — Pé Descalço
		{ modalityId: 'forro-pe-descalco', professorId: peDescalco.id, nivel: 'Azul Intermediário', diaSemana: 'QUA', horarioInicio: '19:00', horarioFim: '20:00', sala: 'Sala 2', maxAlunos: 20 },
		{ modalityId: 'forro-pe-descalco', professorId: peDescalco.id, nivel: 'Preta', diaSemana: 'QUA', horarioInicio: '20:00', horarioFim: '21:00', sala: 'Sala 2', maxAlunos: 20 },
		// QUARTA — Sala 3 — Roots
		{ modalityId: 'forro-roots', professorId: danilo.id, nivel: 'Introdução ao Roots', diaSemana: 'QUA', horarioInicio: '19:00', horarioFim: '20:00', sala: 'Sala 3', maxAlunos: 20 },
		{ modalityId: 'forro-roots', professorId: mari.id, nivel: 'Caminhadas e Giros', diaSemana: 'QUA', horarioInicio: '20:00', horarioFim: '21:00', sala: 'Sala 3', maxAlunos: 20 },
		// QUINTA — Sala 1 — Pé Descalço
		{ modalityId: 'forro-pe-descalco', professorId: peDescalco.id, nivel: 'Preta', diaSemana: 'QUI', horarioInicio: '19:30', horarioFim: '20:30', sala: 'Sala 1', maxAlunos: 20 },
		{ modalityId: 'forro-pe-descalco', professorId: peDescalco.id, nivel: 'Azul Iniciante', diaSemana: 'QUI', horarioInicio: '20:30', horarioFim: '21:30', sala: 'Sala 1', maxAlunos: 20 },
		{ modalityId: 'forro-pe-descalco', professorId: peDescalco.id, nivel: 'Branca', diaSemana: 'QUI', horarioInicio: '21:30', horarioFim: '22:30', sala: 'Sala 1', maxAlunos: 20 },
		// QUINTA — Sala 3 — Samba
		{ modalityId: 'samba-de-gafieira', professorId: ani.id, nivel: 'Iniciante', diaSemana: 'QUI', horarioInicio: '19:00', horarioFim: '20:10', sala: 'Sala 3', maxAlunos: 18 },
		{ modalityId: 'samba-de-gafieira', professorId: renato.id, nivel: 'Intermediário', diaSemana: 'QUI', horarioInicio: '20:10', horarioFim: '21:40', sala: 'Sala 3', maxAlunos: 18 },
		// SÁBADO — Sala 3 — Roots
		{ modalityId: 'forro-roots', professorId: danilo.id, nivel: 'Introdução ao Roots', diaSemana: 'SAB', horarioInicio: '14:00', horarioFim: '15:00', sala: 'Sala 3', maxAlunos: 20 },
		{ modalityId: 'forro-roots', professorId: mari.id, nivel: 'Caminhadas e Giros', diaSemana: 'SAB', horarioInicio: '15:00', horarioFim: '16:00', sala: 'Sala 3', maxAlunos: 20 }
	];

	const turmas = await Promise.all(
		classes.map(c => prisma.classGroup.create({ data: { tenantId, ...c } }))
	);
	console.log(`✅ ${turmas.length} turmas`);

	// ─── Alunos ─────────────────────────────────────────
	type AlunoSeed = { nome: string; email: string; planoId: string; status?: SubscriptionStatus };
	const ALUNOS: AlunoSeed[] = [
		{ nome: 'Ana Beatriz Silva', email: 'ana.silva@aluno.com', planoId: planoFull.id },
		{ nome: 'Pedro Henrique Santos', email: 'pedro.santos@aluno.com', planoId: planoInter.id },
		{ nome: 'Mariana Costa Lima', email: 'mariana.costa@aluno.com', planoId: planoBasico.id },
		{ nome: 'João Victor Oliveira', email: 'joao.oliveira@aluno.com', planoId: planoFull.id },
		{ nome: 'Camila Ribeiro Souza', email: 'camila.ribeiro@aluno.com', planoId: planoInter.id },
		{ nome: 'Rafael Mendes Carvalho', email: 'rafael.mendes@aluno.com', planoId: planoBasico.id },
		{ nome: 'Beatriz Almeida Rocha', email: 'beatriz.almeida@aluno.com', planoId: planoFull.id },
		{ nome: 'Lucas Fernandes Dias', email: 'lucas.fernandes@aluno.com', planoId: planoInter.id },
		{ nome: 'Juliana Pereira Gomes', email: 'juliana.pereira@aluno.com', planoId: planoBasico.id },
		{ nome: 'Gabriel Martins Souza', email: 'gabriel.martins@aluno.com', planoId: planoInter.id },
		{ nome: 'Larissa Cardoso Nunes', email: 'larissa.cardoso@aluno.com', planoId: planoFull.id },
		{ nome: 'Felipe Araújo Castro', email: 'felipe.araujo@aluno.com', planoId: planoBasico.id },
		{ nome: 'Isabela Moreira Lopes', email: 'isabela.moreira@aluno.com', planoId: planoInter.id },
		{ nome: 'Vinícius Cunha Ramos', email: 'vinicius.cunha@aluno.com', planoId: planoFull.id },
		{ nome: 'Letícia Barros Pinto', email: 'leticia.barros@aluno.com', planoId: planoBasico.id },
		{ nome: 'Thiago Borges Vieira', email: 'thiago.borges@aluno.com', planoId: planoInter.id },
		{ nome: 'Amanda Freitas Sales', email: 'amanda.freitas@aluno.com', planoId: planoBasico.id },
		{ nome: 'Bruno Tavares Reis', email: 'bruno.tavares@aluno.com', planoId: planoFull.id },
		{ nome: 'Carolina Duarte Nogueira', email: 'carolina.duarte@aluno.com', planoId: planoInter.id },
		{ nome: 'Diego Pacheco Andrade', email: 'diego.pacheco@aluno.com', planoId: planoBasico.id },
		{ nome: 'Fernanda Lima Teixeira', email: 'fernanda.lima@aluno.com', planoId: planoInter.id },
		{ nome: 'Henrique Sousa Caldeira', email: 'henrique.sousa@aluno.com', planoId: planoFull.id },
		{ nome: 'Renata Vasconcelos Brito', email: 'renata.vasconcelos@aluno.com', planoId: planoBasico.id },
		// Cancelado (para testar vista de admin)
		{ nome: 'Marcelo Antunes Coelho', email: 'marcelo.antunes@aluno.com', planoId: planoBasico.id, status: 'CANCELADA' },
		// Sem inscrição em turma (recém chegado, com nivelamento agendado)
		{ nome: 'Patrícia Rezende Maia', email: 'patricia.rezende@aluno.com', planoId: planoBasico.id }
	];

	const alunos: { id: string; nome: string; planoId: string; subStatus: SubscriptionStatus }[] = [];
	const senhaAluno = await hashPassword('aluno123');
	for (const a of ALUNOS) {
		const u = await prisma.user.create({
			data: {
				tenantId,
				nome: a.nome,
				email: a.email,
				senhaHash: senhaAluno,
				role: 'ALUNO',
				telefone: `(11) 9${Math.floor(rng() * 90000000 + 10000000)}`,
				dataNasc: new Date(1980 + Math.floor(rng() * 25), Math.floor(rng() * 12), Math.floor(rng() * 28) + 1)
			}
		});
		const status = a.status ?? 'ATIVA';
		const inicio = new Date();
		inicio.setMonth(inicio.getMonth() - Math.floor(rng() * 8) - 1);
		await prisma.subscription.create({
			data: {
				tenantId,
				userId: u.id,
				planId: a.planoId,
				status,
				inicio,
				fim: status === 'CANCELADA' ? new Date(inicio.getTime() + 60 * 24 * 3600 * 1000) : null
			}
		});
		alunos.push({ id: u.id, nome: u.nome, planoId: a.planoId, subStatus: status });
	}
	console.log(`✅ ${alunos.length} alunos (com assinaturas)`);

	// ─── Inscrições em turmas ───────────────────────────
	// Aluno cancelado e o último (nivelamento) ficam sem inscrição
	const alunosAtivos = alunos.filter(
		a => a.subStatus === 'ATIVA' && a.nome !== 'Patrícia Rezende Maia'
	);

	// Capacidade por plano
	function maxTurmasFor(planoId: string): number {
		if (planoId === planoBasico.id) return 1; // 2 aulas/sem → 1 turma
		if (planoId === planoInter.id) return 2; // até 4 aulas/sem
		return 3; // full
	}

	const enrollments: { userId: string; classGroupId: string }[] = [];
	for (const a of alunosAtivos) {
		const n = maxTurmasFor(a.planoId);
		const escolhidas = pickN(turmas, n);
		for (const t of escolhidas) {
			enrollments.push({ userId: a.id, classGroupId: t.id });
		}
	}
	await prisma.enrollment.createMany({
		data: enrollments.map(e => ({
			tenantId,
			userId: e.userId,
			classGroupId: e.classGroupId,
			status: 'ATIVA' as EnrollmentStatus,
			dataInscricao: new Date(Date.now() - Math.floor(rng() * 90) * 24 * 3600 * 1000)
		}))
	});
	console.log(`✅ ${enrollments.length} inscrições em turmas`);

	// ─── Presenças (chamadas) — últimas 4 semanas ───────
	// Para cada inscrição, gera presença/falta nas 4 últimas ocorrências semanais
	const turmasMap = new Map(turmas.map(t => [t.id, t]));
	const hoje = new Date();
	hoje.setHours(0, 0, 0, 0);
	const presencas: {
		userId: string;
		classGroupId: string;
		data: Date;
		presente: boolean;
		observacao: string | null;
	}[] = [];

	for (const e of enrollments) {
		const turma = turmasMap.get(e.classGroupId);
		if (!turma) continue;
		// Encontra as 4 últimas ocorrências do dia da semana da turma
		const targetDow = DOW.indexOf(turma.diaSemana);
		for (let semanasAtras = 1; semanasAtras <= 4; semanasAtras++) {
			const d = new Date(hoje);
			const diff = (d.getDay() - targetDow + 7) % 7;
			d.setDate(d.getDate() - diff - (semanasAtras - 1) * 7);
			// Taxa de presença: 80% para "ativos", varia
			const presente = chance(0.78);
			presencas.push({
				userId: e.userId,
				classGroupId: e.classGroupId,
				data: d,
				presente,
				observacao: !presente && chance(0.3) ? 'Avisou previamente' : null
			});
		}
	}
	// createMany com skipDuplicates pra evitar problemas com unique [userId, classGroupId, data]
	await prisma.attendance.createMany({
		data: presencas.map(p => ({ tenantId, ...p })),
		skipDuplicates: true
	});
	console.log(`✅ ${presencas.length} presenças/faltas (4 semanas)`);

	// ─── Check-ins na portaria ──────────────────────────
	// Últimos 30 dias, ~3 check-ins/semana por aluno ativo
	const checkIns: { userId: string; timestamp: Date; metodo: CheckInMethod }[] = [];
	for (const a of alunosAtivos) {
		const numCheckIns = Math.floor(rng() * 8) + 4; // 4-11 check-ins no mês
		for (let i = 0; i < numCheckIns; i++) {
			const d = new Date();
			d.setDate(d.getDate() - Math.floor(rng() * 30));
			d.setHours(18 + Math.floor(rng() * 5), Math.floor(rng() * 60), 0, 0);
			const metodos: CheckInMethod[] = ['QR_CODE', 'QR_CODE', 'QR_CODE', 'MANUAL', 'FACIAL'];
			checkIns.push({ userId: a.id, timestamp: d, metodo: pick(metodos) });
		}
	}
	await prisma.checkIn.createMany({
		data: checkIns.map(c => ({ tenantId, ...c }))
	});
	console.log(`✅ ${checkIns.length} check-ins`);

	// ─── Aulas particulares ─────────────────────────────
	// Cada aluno do plano Full tem ~2 particulares (1 passada concluída, 1 futura)
	// Plus algumas avulsas pendentes
	const alunosFull = alunosAtivos.filter(a => a.planoId === planoFull.id);
	const profsParticulares = [danilo, mari, ani, renato];
	const particulares: {
		userId: string;
		professorId: string;
		modalityId: string;
		dataHora: Date;
		duracao: number;
		status: LessonStatus;
		observacao: string | null;
	}[] = [];

	for (const a of alunosFull) {
		const prof = pick(profsParticulares);
		const modalityId =
			prof.id === danilo.id || prof.id === mari.id ? 'forro-roots' : 'samba-de-gafieira';

		// Aula passada (concluída)
		const passada = new Date();
		passada.setDate(passada.getDate() - Math.floor(rng() * 30 + 5));
		passada.setHours(15, 0, 0, 0);
		particulares.push({
			userId: a.id,
			professorId: prof.id,
			modalityId,
			dataHora: passada,
			duracao: 60,
			status: 'CONCLUIDA',
			observacao: chance(0.4) ? 'Foco em técnica de giro' : null
		});

		// Aula futura (confirmada ou agendada)
		const futura = new Date();
		futura.setDate(futura.getDate() + Math.floor(rng() * 21 + 2));
		futura.setHours(14 + Math.floor(rng() * 3), 0, 0, 0);
		particulares.push({
			userId: a.id,
			professorId: prof.id,
			modalityId,
			dataHora: futura,
			duracao: chance(0.5) ? 60 : 90,
			status: chance(0.6) ? 'CONFIRMADA' : 'AGENDADA',
			observacao: null
		});
	}

	// Algumas particulares canceladas para variedade
	for (let i = 0; i < 3; i++) {
		const a = pick(alunosFull);
		const prof = pick(profsParticulares);
		const d = new Date();
		d.setDate(d.getDate() - Math.floor(rng() * 14));
		particulares.push({
			userId: a.id,
			professorId: prof.id,
			modalityId: 'forro-roots',
			dataHora: d,
			duracao: 60,
			status: 'CANCELADA',
			observacao: 'Aluno desmarcou'
		});
	}

	await prisma.privateLesson.createMany({
		data: particulares.map(p => ({ tenantId, ...p }))
	});
	console.log(`✅ ${particulares.length} aulas particulares (passadas + futuras)`);

	// ─── Transações financeiras ─────────────────────────
	// Mensalidades dos últimos 3 meses para cada aluno ativo
	const transacoes: {
		userId: string;
		tipo: TransactionType;
		valor: number;
		descricao: string;
		data: Date;
		status: TransactionStatus;
	}[] = [];

	const planMap = new Map([
		[planoBasico.id, { nome: 'Básico', preco: 120.0 }],
		[planoInter.id, { nome: 'Intermediário', preco: 200.0 }],
		[planoFull.id, { nome: 'Combo Full', preco: 350.0 }]
	]);

	for (const a of alunosAtivos) {
		const plan = planMap.get(a.planoId);
		if (!plan) continue;
		// 3 mensalidades passadas (todas pagas), 1 do mês corrente (pendente para alguns)
		for (let m = 1; m <= 3; m++) {
			const d = new Date();
			d.setMonth(d.getMonth() - m);
			d.setDate(5);
			transacoes.push({
				userId: a.id,
				tipo: 'MENSALIDADE',
				valor: plan.preco,
				descricao: `Mensalidade ${plan.nome} — ${d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
				data: d,
				status: 'PAGO'
			});
		}
		// Mensalidade do mês corrente
		const dAtual = new Date();
		dAtual.setDate(5);
		transacoes.push({
			userId: a.id,
			tipo: 'MENSALIDADE',
			valor: plan.preco,
			descricao: `Mensalidade ${plan.nome} — ${dAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
			data: dAtual,
			status: chance(0.85) ? 'PAGO' : 'PENDENTE'
		});
	}

	// Algumas transações de particular
	for (const p of particulares.filter(x => x.status === 'CONCLUIDA')) {
		transacoes.push({
			userId: p.userId,
			tipo: 'PARTICULAR',
			valor: p.duracao === 60 ? 120.0 : 180.0,
			descricao: `Aula particular (${p.duracao} min)`,
			data: p.dataHora,
			status: 'PAGO'
		});
	}

	await prisma.transaction.createMany({
		data: transacoes.map(t => ({ tenantId, ...t }))
	});
	console.log(`✅ ${transacoes.length} transações financeiras`);

	// ─── Eventos ────────────────────────────────────────
	const eventos = [
		{
			titulo: 'Baile de Aniversário Balança Eu — 5 anos',
			descricao: 'Noite especial com banda ao vivo, comida e dança até de madrugada.',
			data: new Date(Date.now() + 18 * 24 * 3600 * 1000),
			horario: '21:00',
			local: 'Salão principal',
			preco: 60.0
		},
		{
			titulo: 'Workshop de Forró Roots com Danilo Marano',
			descricao: 'Imersão de fim de semana em técnicas tradicionais nordestinas.',
			data: new Date(Date.now() + 32 * 24 * 3600 * 1000),
			horario: '14:00',
			local: 'Sala 3',
			preco: 180.0
		},
		{
			titulo: 'Roda de Samba de Gafieira',
			descricao: 'Roda aberta gratuita aos alunos. Convide um amigo!',
			data: new Date(Date.now() + 45 * 24 * 3600 * 1000),
			horario: '20:00',
			local: 'Salão principal',
			preco: null
		},
		{
			titulo: 'Festival de Inverno (encerramento)',
			descricao: 'Mostra de alunos com apresentações de todas as modalidades.',
			data: new Date(Date.now() - 25 * 24 * 3600 * 1000),
			horario: '19:30',
			local: 'Salão principal',
			preco: 40.0
		}
	];
	await prisma.event.createMany({
		data: eventos.map(e => ({
			tenantId,
			titulo: e.titulo,
			descricao: e.descricao,
			data: e.data,
			horario: e.horario,
			local: e.local,
			preco: e.preco
		}))
	});
	console.log(`✅ ${eventos.length} eventos (passados + futuros)`);

	// ─── Nivelamentos agendados ─────────────────────────
	// Patrícia (sem inscrição) tem 2 nivelamentos agendados
	const patricia = alunos.find(a => a.nome === 'Patrícia Rezende Maia');
	if (patricia) {
		const turmaIniciante = turmas.find(t => t.nivel === 'Iniciante' && t.diaSemana === 'TER');
		const turmaPeDescalco = turmas.find(t => t.nivel === 'Azul Iniciante' && t.diaSemana === 'QUA');
		const placements = [turmaIniciante, turmaPeDescalco].filter(Boolean) as typeof turmas;
		for (const t of placements) {
			const d = new Date();
			d.setDate(d.getDate() + Math.floor(rng() * 7) + 1);
			const [h, m] = t.horarioInicio.split(':').map(Number);
			d.setHours(h, m, 0, 0);
			await prisma.placementBooking.create({
				data: {
					tenantId,
					userId: patricia.id,
					classGroupId: t.id,
					dataHora: d,
					status: 'AGENDADO' as PlacementStatus
				}
			});
		}
		console.log(`✅ ${placements.length} nivelamentos agendados (Patrícia)`);
	}

	// ─── CMS ────────────────────────────────────────────
	const cmsData = [
		{ secao: 'hero', chave: 'titulo', valorTexto: 'Balança Eu: Muito mais que uma escola de dança.', ordem: 1 },
		{ secao: 'hero', chave: 'subtitulo', valorTexto: 'Um movimento que começa no corpo e transforma quem você é.', ordem: 2 },
		{ secao: 'hero', chave: 'cta_texto', valorTexto: 'Começar Jornada', ordem: 3 },
		{ secao: 'hero', chave: 'cta_link', valorTexto: '/comecar', ordem: 4 },
		{ secao: 'hero', chave: 'frase_destaque', valorTexto: 'Movimento é cura.', ordem: 6 },
		{ secao: 'escola', chave: 'label', valorTexto: 'Balança Eu', ordem: 1 },
		{ secao: 'escola', chave: 'titulo', valorTexto: 'Um espaço de encontro, arte e identidade.', ordem: 2 },
		{ secao: 'escola', chave: 'paragrafo_1', valorTexto: 'No Balança Eu, acreditamos que o corpo é o nosso primeiro território. Não ensinamos apenas passos; cultivamos a percepção de si através do ritmo e da expressão artística.', ordem: 3 },
		{ secao: 'escola', chave: 'paragrafo_2', valorTexto: 'Nossa casa é um refúgio contemporâneo onde a tradição e a inovação se abraçam para criar novas linguagens corporais e conexões humanas profundas.', ordem: 4 },
		{ secao: 'modulos', chave: 'titulo', valorTexto: 'Nossos <em>módulos.</em>', ordem: 2 },
		{ secao: 'modulos', chave: 'descricao', valorTexto: 'Quatro linguagens corporais, uma só escola.', ordem: 3 },
		{ secao: 'professores', chave: 'label', valorTexto: 'Mestres do movimento', ordem: 1 },
		{ secao: 'professores', chave: 'titulo', valorTexto: 'Quem <em>conduz</em> sua evolução.', ordem: 2 },
		{ secao: 'professores', chave: 'descricao', valorTexto: 'Nossa equipe é formada por artistas apaixonados.', ordem: 3 },
		{ secao: 'cta_final', chave: 'titulo', valorTexto: 'Seja parte do movimento.', ordem: 1 },
		{ secao: 'cta_final', chave: 'titulo_destaque', valorTexto: 'Venha viver a experiência Balança Eu.', ordem: 2 },
		{ secao: 'cta_final', chave: 'cta_primario_texto', valorTexto: 'Agendar Aula Experimental', ordem: 3 },
		{ secao: 'cta_final', chave: 'cta_primario_link', valorTexto: '/comecar', ordem: 4 },
		{ secao: 'cta_final', chave: 'cta_secundario_texto', valorTexto: 'Falar no WhatsApp', ordem: 5 },
		{ secao: 'contato', chave: 'instagram_url', valorTexto: 'https://instagram.com/balancaeu', ordem: 3 },
		{ secao: 'contato', chave: 'whatsapp_url', valorTexto: 'https://wa.me/5511999990000', ordem: 4 },
		{ secao: 'contato', chave: 'email', valorTexto: 'contato@balancaeu.com.br', ordem: 5 },
		{ secao: 'footer', chave: 'descricao', valorTexto: 'Movimento é cura. Dança é encontro.', ordem: 1 },
		{ secao: 'footer', chave: 'copyright', valorTexto: '© 2026 Balança Eu · Todos os direitos reservados', ordem: 2 }
	];
	for (const item of cmsData) {
		await prisma.cmsContent.upsert({
			where: { tenantId_secao_chave: { tenantId, secao: item.secao, chave: item.chave } },
			update: { valorTexto: item.valorTexto, ordem: item.ordem },
			create: {
				tenantId,
				secao: item.secao,
				chave: item.chave,
				valorTexto: item.valorTexto,
				ordem: item.ordem
			}
		});
	}
	console.log('✅ CMS pronto');

	// ─── Resumo final ───────────────────────────────────
	console.log('\n🎉 Seed concluído!\n');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('📊 Snapshot do banco:');
	console.log(`   • 1 tenant (Balança Eu)`);
	console.log(`   • 1 admin + ${professores.length} professores + ${alunos.length} alunos`);
	console.log(`   • ${modalidades.length} modalidades, ${turmas.length} turmas, ${planos.length} planos`);
	console.log(`   • ${enrollments.length} inscrições, ${presencas.length} presenças (4 sem.)`);
	console.log(`   • ${checkIns.length} check-ins, ${particulares.length} aulas particulares`);
	console.log(`   • ${transacoes.length} transações, ${eventos.length} eventos`);
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('🔑 Credenciais (senha entre parênteses):');
	console.log('   • Admin:      admin@balancaeu.com.br (admin123)');
	console.log('   • Professor:  danilo@ / mari@ / ani@ / renato@ / pedescalco@balancaeu.com.br (prof123)');
	console.log('   • Aluno:      ana.silva@aluno.com (aluno123) — qualquer um da lista');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async e => {
		console.error('❌ Erro no seed:', e);
		await prisma.$disconnect();
		process.exit(1);
	});
