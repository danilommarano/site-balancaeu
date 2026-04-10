import { db } from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { DayOfWeek } from '@prisma/client';

const diasSemanaJs: Record<number, string> = {
	0: 'DOM', 1: 'SEG', 2: 'TER', 3: 'QUA', 4: 'QUI', 5: 'SEX', 6: 'SAB'
};

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user;
	if (!user || user.role !== 'PROFESSOR') throw redirect(302, '/login');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw redirect(302, '/login');

	// Get selected date from URL, default to today
	const dataParam = url.searchParams.get('data');
	const dataSelecionada = dataParam ? new Date(`${dataParam}T12:00:00`) : new Date();
	const diaStr = diasSemanaJs[dataSelecionada.getDay()] as DayOfWeek;

	// Normalize date for DB queries (start of day)
	const dataInicio = new Date(dataSelecionada);
	dataInicio.setHours(0, 0, 0, 0);
	const dataFim = new Date(dataSelecionada);
	dataFim.setHours(23, 59, 59, 999);

	// Selected classGroup from URL
	const turmaId = url.searchParams.get('turma') || '';

	// Get professor's classes for this day of week
	const turmasDoDia = await db.classGroup.findMany({
		where: { tenantId, professorId: user.id, ativo: true, diaSemana: diaStr },
		orderBy: { horarioInicio: 'asc' },
		include: {
			modality: { select: { nome: true } },
			_count: {
				select: { enrollments: { where: { status: { in: ['ATIVA', 'LISTA_ESPERA'] } } } }
			}
		}
	});

	// If a turma is selected, get enrolled students + existing attendance
	let alunos: {
		id: string;
		nome: string;
		email: string;
		presente: boolean | null;
		observacao: string | null;
	}[] = [];

	if (turmaId) {
		const inscricoes = await db.enrollment.findMany({
			where: { classGroupId: turmaId, status: { in: ['ATIVA', 'LISTA_ESPERA'] } },
			include: { user: { select: { id: true, nome: true, email: true } } },
			orderBy: { user: { nome: 'asc' } }
		});

		// Get existing attendance for this date + turma
		const presencas = await db.attendance.findMany({
			where: { classGroupId: turmaId, data: { gte: dataInicio, lte: dataFim } }
		});
		const presencaMap = new Map(presencas.map(p => [p.userId, p]));

		alunos = inscricoes.map(e => {
			const att = presencaMap.get(e.userId);
			return {
				id: e.userId,
				nome: e.user.nome,
				email: e.user.email,
				presente: att?.presente ?? null,
				observacao: att?.observacao ?? null
			};
		});
	}

	// Get attendance history for selected turma (last 10 dates)
	let historico: { data: string; presentes: number; ausentes: number; total: number }[] = [];
	if (turmaId) {
		const ultimasPresencas = await db.attendance.findMany({
			where: { classGroupId: turmaId, tenantId },
			orderBy: { data: 'desc' },
			take: 200
		});

		const porData = new Map<string, { presentes: number; ausentes: number }>();
		for (const a of ultimasPresencas) {
			const key = a.data.toISOString().split('T')[0];
			if (!porData.has(key)) porData.set(key, { presentes: 0, ausentes: 0 });
			const entry = porData.get(key)!;
			if (a.presente) entry.presentes++;
			else entry.ausentes++;
		}

		historico = Array.from(porData.entries())
			.sort((a, b) => b[0].localeCompare(a[0]))
			.slice(0, 10)
			.map(([data, v]) => ({
				data,
				presentes: v.presentes,
				ausentes: v.ausentes,
				total: v.presentes + v.ausentes
			}));
	}

	return {
		dataSelecionada: dataSelecionada.toISOString().split('T')[0],
		diaStr,
		turmasDoDia: turmasDoDia.map(t => ({
			id: t.id,
			modalidade: t.modality.nome,
			nivel: t.nivel,
			horarioInicio: t.horarioInicio,
			horarioFim: t.horarioFim,
			sala: t.sala,
			totalAlunos: t._count.enrollments
		})),
		turmaId,
		alunos,
		historico
	};
};

export const actions: Actions = {
	salvar: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'PROFESSOR') return fail(401, { error: 'Não autenticado' });

		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const turmaId = fd.get('turmaId')?.toString();
		const dataStr = fd.get('data')?.toString();

		if (!turmaId || !dataStr) {
			return fail(400, { error: 'Turma e data são obrigatórios.' });
		}

		// Verify the professor owns this class
		const turma = await db.classGroup.findFirst({
			where: { id: turmaId, professorId: user.id, tenantId }
		});
		if (!turma) return fail(400, { error: 'Turma não encontrada.' });

		const dataPresenca = new Date(`${dataStr}T12:00:00`);

		// Get all student IDs from form
		const alunoIds = fd.getAll('alunoId').map(v => v.toString());
		const presentes = new Set(fd.getAll('presente').map(v => v.toString()));
		const observacoes = new Map<string, string>();

		for (const alunoId of alunoIds) {
			const obs = fd.get(`obs_${alunoId}`)?.toString()?.trim() || null;
			if (obs) observacoes.set(alunoId, obs);
		}

		// Upsert attendance for each student
		let salvos = 0;
		for (const alunoId of alunoIds) {
			await db.attendance.upsert({
				where: {
					userId_classGroupId_data: {
						userId: alunoId,
						classGroupId: turmaId,
						data: dataPresenca
					}
				},
				create: {
					tenantId,
					userId: alunoId,
					classGroupId: turmaId,
					data: dataPresenca,
					presente: presentes.has(alunoId),
					observacao: observacoes.get(alunoId) ?? null
				},
				update: {
					presente: presentes.has(alunoId),
					observacao: observacoes.get(alunoId) ?? null
				}
			});
			salvos++;
		}

		return {
			success: true,
			message: `Chamada salva! ${presentes.size} presente(s), ${alunoIds.length - presentes.size} ausente(s).`
		};
	}
};
