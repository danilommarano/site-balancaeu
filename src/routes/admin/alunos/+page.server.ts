import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) return { alunos: [] };

	const alunos = await db.user.findMany({
		where: { tenantId, role: 'ALUNO' },
		orderBy: { nome: 'asc' },
		select: {
			id: true,
			nome: true,
			email: true,
			telefone: true,
			ativo: true,
			createdAt: true,
			subscriptions: {
				where: { status: 'ATIVA' },
				take: 1,
				select: {
					plan: { select: { nome: true } },
					status: true
				}
			},
			_count: {
				select: { enrollments: { where: { status: { in: ['ATIVA', 'LISTA_ESPERA'] } } } }
			}
		}
	});

	return {
		alunos: alunos.map(a => ({
			...a,
			createdAt: a.createdAt.toISOString()
		}))
	};
};

export const actions: Actions = {
	toggleActive: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		const ativo = fd.get('ativo') === 'true';
		if (!id) return fail(400, { error: 'ID obrigatório' });

		await db.user.update({ where: { id }, data: { ativo } });
		return { success: true };
	}
};
