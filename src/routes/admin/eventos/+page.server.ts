import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { isValidPrice } from '$lib/server/validation';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) return { eventos: [] };

	const eventos = await db.event.findMany({
		where: { tenantId },
		orderBy: { data: 'desc' }
	});

	return {
		eventos: eventos.map(e => ({
			...e,
			preco: e.preco ? Number(e.preco) : null,
			data: e.data.toISOString(),
			createdAt: e.createdAt.toISOString()
		}))
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const titulo = fd.get('titulo')?.toString().trim();
		const descricao = fd.get('descricao')?.toString().trim();
		const dataStr = fd.get('data')?.toString();
		const horario = fd.get('horario')?.toString().trim();
		const local = fd.get('local')?.toString().trim();
		const precoStr = fd.get('preco')?.toString();
		const preco = precoStr ? parseFloat(precoStr) : null;

		if (!titulo || !descricao || !dataStr || !horario || !local) {
			return fail(400, { error: 'Todos os campos obrigatórios devem ser preenchidos' });
		}

		const eventDate = new Date(dataStr);
		if (isNaN(eventDate.getTime())) {
			return fail(400, { error: 'Data inválida' });
		}

		if (preco !== null && !isValidPrice(preco)) {
			return fail(400, { error: 'Preço inválido' });
		}

		await db.event.create({
			data: { tenantId, titulo, descricao, data: eventDate, horario, local, preco }
		});

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID obrigatório' });

		await db.event.delete({ where: { id } });
		return { success: true };
	},

	update: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		const titulo = fd.get('titulo')?.toString().trim();
		const descricao = fd.get('descricao')?.toString().trim();
		const dataStr = fd.get('data')?.toString();
		const horario = fd.get('horario')?.toString().trim();
		const local = fd.get('local')?.toString().trim();
		const precoStr = fd.get('preco')?.toString();
		const preco = precoStr ? parseFloat(precoStr) : null;

		if (!id || !titulo || !descricao || !dataStr || !horario || !local) {
			return fail(400, { error: 'Todos os campos obrigatórios devem ser preenchidos' });
		}

		const eventDate = new Date(dataStr);
		if (isNaN(eventDate.getTime())) {
			return fail(400, { error: 'Data inválida' });
		}

		if (preco !== null && !isValidPrice(preco)) {
			return fail(400, { error: 'Preço inválido' });
		}

		await db.event.update({
			where: { id },
			data: { titulo, descricao, data: eventDate, horario, local, preco }
		});

		return { success: true };
	},

	toggleActive: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		const ativo = fd.get('ativo') === 'true';
		if (!id) return fail(400, { error: 'ID obrigatório' });

		await db.event.update({ where: { id }, data: { ativo } });
		return { success: true };
	}
};
