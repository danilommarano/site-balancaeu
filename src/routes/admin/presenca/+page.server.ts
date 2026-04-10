import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) return {
		turmas: [], alunosList: [], filtros: { turmaId: '', alunoId: '' },
		resumo: { totalPresencas: 0, totalFaltas: 0, taxaPresenca: 0 },
		alunosComFaltas: [] as { id: string; nome: string; email: string; faltas: number; total: number; taxa: number }[],
		registros: [] as { id: string; data: string; presente: boolean; observacao: string | null; aluno: string; alunoEmail: string; turma: string; dia: string; horario: string }[]
	};

	const turmaId = url.searchParams.get('turma') || '';
	const alunoId = url.searchParams.get('aluno') || '';

	// Get all classes for filter
	const turmas = await db.classGroup.findMany({
		where: { tenantId, ativo: true },
		orderBy: [{ diaSemana: 'asc' }, { horarioInicio: 'asc' }],
		include: {
			modality: { select: { nome: true } },
			professor: { select: { nome: true } }
		}
	});

	// Build attendance query
	const attendanceWhere: Record<string, unknown> = { tenantId };
	if (turmaId) attendanceWhere.classGroupId = turmaId;
	if (alunoId) attendanceWhere.userId = alunoId;

	// Get attendance records (last 30 days)
	const trintaDiasAtras = new Date();
	trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
	attendanceWhere.data = { gte: trintaDiasAtras };

	const registros = await db.attendance.findMany({
		where: attendanceWhere,
		include: {
			user: { select: { id: true, nome: true, email: true } },
			classGroup: {
				select: {
					id: true,
					nivel: true,
					diaSemana: true,
					horarioInicio: true,
					modality: { select: { nome: true } }
				}
			}
		},
		orderBy: { data: 'desc' },
		take: 300
	});

	// Calculate summary
	const totalPresencas = registros.filter(r => r.presente).length;
	const totalFaltas = registros.filter(r => !r.presente).length;
	const total = totalPresencas + totalFaltas;
	const taxaPresenca = total > 0 ? Math.round((totalPresencas / total) * 100) : 0;

	// Build per-student absence count
	const faltasPorAluno = new Map<string, { nome: string; email: string; faltas: number; total: number }>();
	for (const r of registros) {
		if (!faltasPorAluno.has(r.userId)) {
			faltasPorAluno.set(r.userId, { nome: r.user.nome, email: r.user.email, faltas: 0, total: 0 });
		}
		const entry = faltasPorAluno.get(r.userId)!;
		entry.total++;
		if (!r.presente) entry.faltas++;
	}

	// Sort by most absences
	const alunosComFaltas = Array.from(faltasPorAluno.entries())
		.map(([id, v]) => ({ id, ...v, taxa: v.total > 0 ? Math.round(((v.total - v.faltas) / v.total) * 100) : 0 }))
		.sort((a, b) => b.faltas - a.faltas);

	// Get students for filter
	const alunosList = await db.user.findMany({
		where: { tenantId, role: 'ALUNO', ativo: true },
		orderBy: { nome: 'asc' },
		select: { id: true, nome: true }
	});

	return {
		turmas: turmas.map(t => ({
			id: t.id,
			label: `${t.modality.nome} - ${t.nivel} (${t.diaSemana} ${t.horarioInicio})`,
			professor: t.professor.nome
		})),
		alunosList,
		filtros: { turmaId, alunoId },
		resumo: { totalPresencas, totalFaltas, taxaPresenca },
		alunosComFaltas,
		registros: registros.map(r => ({
			id: r.id,
			data: r.data.toISOString().split('T')[0],
			presente: r.presente,
			observacao: r.observacao,
			aluno: r.user.nome,
			alunoEmail: r.user.email,
			turma: `${r.classGroup.modality.nome} - ${r.classGroup.nivel}`,
			dia: r.classGroup.diaSemana,
			horario: r.classGroup.horarioInicio
		}))
	};
};
