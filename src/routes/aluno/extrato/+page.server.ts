import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user;
	if (!user || user.role !== 'ALUNO') throw redirect(302, '/login');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw redirect(302, '/login');

	// Filters from URL params
	const tipo = url.searchParams.get('tipo') || '';
	const status = url.searchParams.get('status') || '';
	const de = url.searchParams.get('de') || '';
	const ate = url.searchParams.get('ate') || '';

	// Build where clause
	const where: Record<string, unknown> = { userId: user.id, tenantId };

	if (tipo) where.tipo = tipo;
	if (status) where.status = status;
	if (de || ate) {
		where.data = {};
		if (de) (where.data as Record<string, unknown>).gte = new Date(`${de}T00:00:00`);
		if (ate) (where.data as Record<string, unknown>).lte = new Date(`${ate}T23:59:59`);
	}

	const transacoes = await db.transaction.findMany({
		where,
		orderBy: { data: 'desc' },
		take: 200
	});

	// Calculate summary
	const resumo = {
		totalPago: 0,
		totalPendente: 0,
		totalCancelado: 0,
		count: transacoes.length
	};

	for (const t of transacoes) {
		const val = Number(t.valor);
		if (t.status === 'PAGO') resumo.totalPago += val;
		else if (t.status === 'PENDENTE') resumo.totalPendente += val;
		else if (t.status === 'CANCELADO') resumo.totalCancelado += val;
	}

	// Get tenant info for PDF
	const tenant = await db.tenant.findUnique({
		where: { id: tenantId },
		select: { nome: true, logoUrl: true, emailContato: true, telefone: true, endereco: true }
	});

	return {
		transacoes: transacoes.map(t => ({
			id: t.id,
			tipo: t.tipo,
			valor: Number(t.valor),
			descricao: t.descricao,
			data: t.data.toISOString(),
			status: t.status
		})),
		resumo,
		filtros: { tipo, status, de, ate },
		escola: tenant
	};
};
