import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) return { modalidades: [] };

	const modalidades = await db.modality.findMany({
		where: { tenantId },
		orderBy: { nome: 'asc' },
		include: {
			_count: { select: { classGroups: true } }
		}
	});

	return { modalidades };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const data = await request.formData();
		const nome = data.get('nome')?.toString().trim();
		const descricao = data.get('descricao')?.toString().trim();

		if (!nome || !descricao) {
			return fail(400, { error: 'Nome e descrição são obrigatórios', nome, descricao });
		}

		await db.modality.create({
			data: { tenantId, nome, descricao }
		});

		return { success: true };
	},

	update: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const data = await request.formData();
		const id = data.get('id')?.toString();
		const nome = data.get('nome')?.toString().trim();
		const descricao = data.get('descricao')?.toString().trim();
		const ativo = data.get('ativo') === 'true';

		if (!id || !nome || !descricao) {
			return fail(400, { error: 'Campos obrigatórios faltando' });
		}

		await db.modality.update({
			where: { id },
			data: { nome, descricao, ativo }
		});

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const data = await request.formData();
		const id = data.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID obrigatório' });

		const turmasVinculadas = await db.classGroup.count({ where: { modalityId: id } });
		if (turmasVinculadas > 0) {
			return fail(400, { error: `Não é possível excluir: ${turmasVinculadas} turma(s) vinculada(s)` });
		}

		await db.modality.delete({ where: { id } });
		return { success: true };
	}
};
