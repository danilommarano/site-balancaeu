import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { isValidPrice } from '$lib/server/validation';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) return { planos: [] };

	const planos = await db.plan.findMany({
		where: { tenantId },
		orderBy: { preco: 'asc' },
		include: {
			_count: { select: { subscriptions: true } }
		}
	});

	return {
		planos: planos.map(p => ({
			...p,
			preco: Number(p.preco),
			createdAt: p.createdAt.toISOString()
		}))
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const nome = fd.get('nome')?.toString().trim();
		const descricao = fd.get('descricao')?.toString().trim();
		const preco = parseFloat(fd.get('preco')?.toString() ?? '0');
		const maxAulasSemana = parseInt(fd.get('maxAulasSemana')?.toString() ?? '0');
		const permiteParticular = fd.get('permiteParticular') === 'on';

		if (!nome || !descricao || !maxAulasSemana) {
			return fail(400, { error: 'Todos os campos são obrigatórios' });
		}

		if (!isValidPrice(preco)) {
			return fail(400, { error: 'Preço inválido (deve ser entre R$0 e R$999.999)' });
		}

		if (maxAulasSemana < 1 || maxAulasSemana > 99) {
			return fail(400, { error: 'Máximo de aulas por semana deve ser entre 1 e 99' });
		}

		await db.plan.create({
			data: { tenantId, nome, descricao, preco, maxAulasSemana, permiteParticular }
		});

		return { success: true };
	},

	update: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		const nome = fd.get('nome')?.toString().trim();
		const descricao = fd.get('descricao')?.toString().trim();
		const preco = parseFloat(fd.get('preco')?.toString() ?? '0');
		const maxAulasSemana = parseInt(fd.get('maxAulasSemana')?.toString() ?? '0');
		const permiteParticular = fd.get('permiteParticular') === 'on';
		const ativo = fd.get('ativo') === 'true';

		if (!id || !nome || !descricao) {
			return fail(400, { error: 'Campos obrigatórios faltando' });
		}

		await db.plan.update({
			where: { id },
			data: { nome, descricao, preco, maxAulasSemana, permiteParticular, ativo }
		});

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID obrigatório' });

		const assinaturas = await db.subscription.count({ where: { planId: id, status: 'ATIVA' } });
		if (assinaturas > 0) {
			return fail(400, { error: `Não é possível excluir: ${assinaturas} assinatura(s) ativa(s) vinculada(s)` });
		}

		await db.plan.delete({ where: { id } });
		return { success: true };
	}
};
