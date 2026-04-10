import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) return { checkinsHoje: [], alunos: [] };

	const hoje = new Date();
	hoje.setHours(0, 0, 0, 0);

	const [checkinsHoje, alunos] = await Promise.all([
		db.checkIn.findMany({
			where: { tenantId, timestamp: { gte: hoje } },
			include: {
				user: { select: { nome: true, email: true } }
			},
			orderBy: { timestamp: 'desc' }
		}),
		db.user.findMany({
			where: { tenantId, role: 'ALUNO', ativo: true },
			orderBy: { nome: 'asc' },
			select: { id: true, nome: true, email: true }
		})
	]);

	return {
		checkinsHoje: checkinsHoje.map(c => ({
			id: c.id,
			aluno: c.user.nome,
			email: c.user.email,
			timestamp: c.timestamp.toISOString(),
			metodo: c.metodo
		})),
		alunos
	};
};
