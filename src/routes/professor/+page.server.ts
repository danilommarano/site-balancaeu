import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { DayOfWeek } from '@prisma/client';

const diasSemanaJs: Record<number, string> = {
	0: 'DOM', 1: 'SEG', 2: 'TER', 3: 'QUA', 4: 'QUI', 5: 'SEX', 6: 'SAB'
};

const diasLabels: Record<string, string> = {
	SEG: 'Segunda', TER: 'Terça', QUA: 'Quarta', QUI: 'Quinta',
	SEX: 'Sexta', SAB: 'Sábado', DOM: 'Domingo'
};

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user || user.role !== 'PROFESSOR') throw redirect(302, '/login');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw redirect(302, '/login');

	const hoje = new Date();
	const diaStr = diasSemanaJs[hoje.getDay()] as DayOfWeek;

	// ─── Turmas de hoje ──────────────────────────────
	const turmasHoje = await db.classGroup.findMany({
		where: { tenantId, professorId: user.id, ativo: true, diaSemana: diaStr },
		orderBy: { horarioInicio: 'asc' },
		include: {
			modality: { select: { nome: true } },
			_count: {
				select: { enrollments: { where: { status: 'ATIVA' } } }
			}
		}
	});

	// Check if attendance was already done for each class today
	const hojeInicio = new Date(hoje);
	hojeInicio.setHours(0, 0, 0, 0);
	const hojeFim = new Date(hoje);
	hojeFim.setHours(23, 59, 59, 999);

	const attendanceToday = await db.attendance.findMany({
		where: {
			tenantId,
			classGroup: { professorId: user.id },
			data: { gte: hojeInicio, lte: hojeFim }
		},
		select: { classGroupId: true }
	});
	const chamadaFeitaSet = new Set(attendanceToday.map(a => a.classGroupId));

	// ─── Contagens ───────────────────────────────────
	const [totalTurmas, particularesPendentes, particularesConfirmadas] = await Promise.all([
		db.classGroup.count({ where: { tenantId, professorId: user.id, ativo: true } }),
		db.privateLesson.count({ where: { tenantId, professorId: user.id, status: 'AGENDADA' } }),
		db.privateLesson.count({ where: { tenantId, professorId: user.id, status: 'CONFIRMADA' } })
	]);

	// ─── Próximas aulas particulares ─────────────────
	const proximasParticulares = await db.privateLesson.findMany({
		where: {
			tenantId,
			professorId: user.id,
			status: { in: ['AGENDADA', 'CONFIRMADA'] },
			dataHora: { gte: hoje }
		},
		include: {
			user: { select: { nome: true } },
			modality: { select: { nome: true } }
		},
		orderBy: { dataHora: 'asc' },
		take: 5
	});

	// ─── Últimas chamadas feitas ─────────────────────
	const ultimasChamadas = await db.attendance.findMany({
		where: { tenantId, classGroup: { professorId: user.id } },
		include: {
			classGroup: {
				select: { modality: { select: { nome: true } }, nivel: true, diaSemana: true }
			}
		},
		orderBy: { data: 'desc' },
		take: 50
	});

	// Group by date + classGroup
	const chamadasMap = new Map<string, { data: string; turma: string; presentes: number; ausentes: number }>();
	for (const a of ultimasChamadas) {
		const key = `${a.data.toISOString().split('T')[0]}-${a.classGroupId}`;
		if (!chamadasMap.has(key)) {
			chamadasMap.set(key, {
				data: a.data.toISOString().split('T')[0],
				turma: `${a.classGroup.modality.nome} - ${a.classGroup.nivel}`,
				presentes: 0,
				ausentes: 0
			});
		}
		const entry = chamadasMap.get(key)!;
		if (a.presente) entry.presentes++;
		else entry.ausentes++;
	}
	const ultimasChamadasList = Array.from(chamadasMap.values()).slice(0, 5);

	return {
		diaLabel: diasLabels[diaStr] ?? diaStr,
		turmasHoje: turmasHoje.map(t => ({
			id: t.id,
			modalidade: t.modality.nome,
			nivel: t.nivel,
			horarioInicio: t.horarioInicio,
			horarioFim: t.horarioFim,
			sala: t.sala,
			totalAlunos: t._count.enrollments,
			chamadaFeita: chamadaFeitaSet.has(t.id)
		})),
		stats: {
			totalTurmas,
			aulasHoje: turmasHoje.length,
			particularesPendentes,
			particularesConfirmadas
		},
		proximasParticulares: proximasParticulares.map(p => ({
			id: p.id,
			aluno: p.user.nome,
			modalidade: p.modality.nome,
			dataHora: p.dataHora.toISOString(),
			duracao: p.duracao,
			status: p.status
		})),
		ultimasChamadas: ultimasChamadasList
	};
};
