import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, url }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) return {
		transacoes: [],
		resumo: { totalPago: 0, totalPendente: 0, porTipo: {} as Record<string, number> },
		filtros: { periodo: '', tipo: '', status: '' },
		receitaPorMes: [] as { mes: string; valor: number }[]
	};

	// ─── Filtros ──────────────────────────────────────
	const periodo = url.searchParams.get('periodo') || '';
	const tipo = url.searchParams.get('tipo') || '';
	const status = url.searchParams.get('status') || '';
	const exportCsv = url.searchParams.get('export') === 'csv';

	const where: Record<string, unknown> = { tenantId };
	if (tipo) where.tipo = tipo;
	if (status) where.status = status;

	// Período
	if (periodo) {
		const hoje = new Date();
		let dataInicio: Date;
		switch (periodo) {
			case '7d':
				dataInicio = new Date(hoje);
				dataInicio.setDate(dataInicio.getDate() - 7);
				break;
			case '30d':
				dataInicio = new Date(hoje);
				dataInicio.setDate(dataInicio.getDate() - 30);
				break;
			case '90d':
				dataInicio = new Date(hoje);
				dataInicio.setDate(dataInicio.getDate() - 90);
				break;
			case '12m':
				dataInicio = new Date(hoje);
				dataInicio.setFullYear(dataInicio.getFullYear() - 1);
				break;
			default:
				dataInicio = new Date(0);
		}
		where.data = { gte: dataInicio };
	}

	// ─── Buscar transações ───────────────────────────
	const transacoes = await db.transaction.findMany({
		where,
		include: {
			user: { select: { nome: true, email: true } }
		},
		orderBy: { data: 'desc' },
		take: 200
	});

	// ─── CSV Export ───────────────────────────────────
	if (exportCsv) {
		const csvLines = [
			'Data,Aluno,Email,Tipo,Valor,Status,Descrição',
			...transacoes.map(t =>
				`${t.data.toISOString().split('T')[0]},${t.user.nome},${t.user.email},${t.tipo},${Number(t.valor).toFixed(2)},${t.status},"${t.descricao}"`
			)
		];
		// Return CSV data as a string for client-side download
		return {
			csvData: csvLines.join('\n'),
			transacoes: [],
			resumo: { totalPago: 0, totalPendente: 0, porTipo: {} },
			filtros: { periodo, tipo, status },
			receitaPorMes: []
		};
	}

	// ─── Resumo ──────────────────────────────────────
	const totalPago = transacoes
		.filter(t => t.status === 'PAGO')
		.reduce((acc, t) => acc + Number(t.valor), 0);

	const totalPendente = transacoes
		.filter(t => t.status === 'PENDENTE')
		.reduce((acc, t) => acc + Number(t.valor), 0);

	const porTipo: Record<string, number> = {};
	for (const t of transacoes.filter(t => t.status === 'PAGO')) {
		porTipo[t.tipo] = (porTipo[t.tipo] ?? 0) + Number(t.valor);
	}

	// ─── Receita por mês (últimos 6 meses) ──────────
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

	return {
		transacoes: transacoes.map(t => ({
			id: t.id,
			aluno: t.user.nome,
			email: t.user.email,
			tipo: t.tipo,
			valor: Number(t.valor),
			descricao: t.descricao,
			data: t.data.toISOString().split('T')[0],
			status: t.status
		})),
		resumo: { totalPago, totalPendente, porTipo },
		filtros: { periodo, tipo, status },
		receitaPorMes
	};
};
