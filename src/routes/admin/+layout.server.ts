import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ locals }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) return { modalidadesNav: [] };

	const modalidadesNav = await db.modality.findMany({
		where: { tenantId, ativo: true },
		orderBy: { nome: 'asc' },
		select: { id: true, nome: true }
	});

	return { modalidadesNav };
};
