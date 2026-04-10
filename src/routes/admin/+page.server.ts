import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) return { stats: null, charts: null, alertas: [] };

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	// ─── Contagens básicas ────────────────────────────
	const [alunosAtivos, totalTurmas, totalProfessores, checkInsHoje, modalidades, ultimosAlunos] =
		await Promise.all([
			db.user.count({ where: { tenantId, role: 'ALUNO', ativo: true } }),
			db.classGroup.count({ where: { tenantId, ativo: true } }),
			db.user.count({ where: { tenantId, role: 'PROFESSOR', ativo: true } }),
			db.checkIn.count({ where: { tenantId, timestamp: { gte: today } } }),
			db.modality.count({ where: { tenantId, ativo: true } }),
			db.user.findMany({
				where: { tenantId, role: 'ALUNO' },
				orderBy: { createdAt: 'desc' },
				take: 5,
				select: { id: true, nome: true, email: true, createdAt: true }
			})
		]);

	// ─── Alunos ativos por mês (últimos 6 meses) ─────
	const alunosPorMes: { mes: string; total: number }[] = [];
	for (let i = 5; i >= 0; i--) {
		const d = new Date();
		d.setMonth(d.getMonth() - i);
		const inicioMes = new Date(d.getFullYear(), d.getMonth(), 1);
		const fimMes = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
		const count = await db.user.count({
			where: { tenantId, role: 'ALUNO', ativo: true, createdAt: { lte: fimMes } }
		});
		alunosPorMes.push({
			mes: inicioMes.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
			total: count
		});
	}

	// ─── Receita mensal (últimos 6 meses) ────────────
	const receitaPorMes: { mes: string; valor: number }[] = [];
	for (let i = 5; i >= 0; i--) {
		const d = new Date();
		d.setMonth(d.getMonth() - i);
		const inicioMes = new Date(d.getFullYear(), d.getMonth(), 1);
		const fimMes = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
		const result = await db.transaction.aggregate({
			where: { tenantId, status: 'PAGO', data: { gte: inicioMes, lte: fimMes } },
			_sum: { valor: true }
		});
		receitaPorMes.push({
			mes: inicioMes.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
			valor: Number(result._sum.valor ?? 0)
		});
	}

	// ─── Check-ins últimos 7 dias ────────────────────
	const checkInsPorDia: { dia: string; total: number }[] = [];
	for (let i = 6; i >= 0; i--) {
		const dInicio = new Date();
		dInicio.setDate(dInicio.getDate() - i);
		dInicio.setHours(0, 0, 0, 0);
		const dFim = new Date(dInicio);
		dFim.setHours(23, 59, 59, 999);
		const count = await db.checkIn.count({
			where: { tenantId, timestamp: { gte: dInicio, lte: dFim } }
		});
		checkInsPorDia.push({
			dia: dInicio.toLocaleDateString('pt-BR', { weekday: 'short' }),
			total: count
		});
	}

	// ─── Taxa de ocupação ────────────────────────────
	const turmas = await db.classGroup.findMany({
		where: { tenantId, ativo: true },
		select: { id: true, maxAlunos: true, _count: { select: { enrollments: { where: { status: 'ATIVA' } } } } }
	});
	const capacidadeTotal = turmas.reduce((acc, t) => acc + t.maxAlunos, 0);
	const inscricoesTotal = turmas.reduce((acc, t) => acc + t._count.enrollments, 0);
	const taxaOcupacao = capacidadeTotal > 0 ? Math.round((inscricoesTotal / capacidadeTotal) * 100) : 0;

	// ─── Assinaturas ativas vs canceladas ────────────
	const [assinaturasAtivas, assinaturasCanceladas] = await Promise.all([
		db.subscription.count({ where: { tenantId, status: 'ATIVA' } }),
		db.subscription.count({ where: { tenantId, status: 'CANCELADA' } })
	]);

	// ─── Receita total acumulada ─────────────────────
	const receitaTotal = await db.transaction.aggregate({
		where: { tenantId, status: 'PAGO' },
		_sum: { valor: true }
	});

	// ─── Alertas: alunos com >3 faltas consecutivas ──
	// Buscar alunos com mais faltas recentes
	const faltasRecentes = await db.attendance.findMany({
		where: { tenantId, presente: false },
		include: {
			user: { select: { id: true, nome: true, email: true } },
			classGroup: {
				select: { modality: { select: { nome: true } }, nivel: true }
			}
		},
		orderBy: { data: 'desc' },
		take: 500
	});

	// Contar faltas consecutivas por aluno
	const faltasPorAluno = new Map<string, { nome: string; email: string; faltasConsecutivas: number; turma: string }>();
	const alunoFaltas = new Map<string, number>();
	for (const f of faltasRecentes) {
		const key = `${f.userId}-${f.classGroupId}`;
		const current = alunoFaltas.get(key) ?? 0;
		alunoFaltas.set(key, current + 1);
		if (current + 1 > 3 && !faltasPorAluno.has(f.userId)) {
			faltasPorAluno.set(f.userId, {
				nome: f.user.nome,
				email: f.user.email,
				faltasConsecutivas: current + 1,
				turma: `${f.classGroup.modality.nome} - ${f.classGroup.nivel}`
			});
		}
	}

	const alertas = Array.from(faltasPorAluno.values()).slice(0, 10);

	// ─── Ocupação por sala ───────────────────────────
	const ocupacaoPorSala: { sala: string; ocupacao: number; capacidade: number }[] = [];
	const salasMap = new Map<string, { ocupacao: number; capacidade: number }>();
	for (const t of turmas) {
		const sala = (t as any).sala ?? 'N/A';
		if (!salasMap.has(sala)) salasMap.set(sala, { ocupacao: 0, capacidade: 0 });
		const entry = salasMap.get(sala)!;
		entry.ocupacao += t._count.enrollments;
		entry.capacidade += t.maxAlunos;
	}

	// Re-query rooms with sala field
	const turmasComSala = await db.classGroup.findMany({
		where: { tenantId, ativo: true },
		select: { sala: true, maxAlunos: true, _count: { select: { enrollments: { where: { status: 'ATIVA' } } } } }
	});
	const salasMap2 = new Map<string, { ocupacao: number; capacidade: number }>();
	for (const t of turmasComSala) {
		if (!salasMap2.has(t.sala)) salasMap2.set(t.sala, { ocupacao: 0, capacidade: 0 });
		const entry = salasMap2.get(t.sala)!;
		entry.ocupacao += t._count.enrollments;
		entry.capacidade += t.maxAlunos;
	}
	for (const [sala, v] of salasMap2) {
		ocupacaoPorSala.push({ sala, ...v });
	}

	return {
		stats: {
			alunosAtivos,
			totalTurmas,
			totalProfessores,
			checkInsHoje,
			modalidades,
			taxaOcupacao,
			assinaturasAtivas,
			assinaturasCanceladas,
			receitaTotal: Number(receitaTotal._sum.valor ?? 0)
		},
		charts: {
			alunosPorMes,
			receitaPorMes,
			checkInsPorDia,
			ocupacaoPorSala
		},
		alertas,
		ultimosAlunos: ultimosAlunos.map(a => ({
			...a,
			createdAt: a.createdAt.toISOString()
		}))
	};
};
