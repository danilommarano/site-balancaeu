import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user || user.role !== 'ALUNO') throw redirect(302, '/login');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw redirect(302, '/login');

	const [assinatura, checkins, faceCount] = await Promise.all([
		db.subscription.findFirst({
			where: { userId: user.id, tenantId, status: 'ATIVA' },
			include: { plan: { select: { nome: true } } }
		}),
		db.checkIn.findMany({
			where: { userId: user.id, tenantId },
			orderBy: { timestamp: 'desc' },
			take: 20
		}),
		db.faceDescriptor.count({
			where: { userId: user.id, tenantId }
		})
	]);

	return {
		temPlano: !!assinatura,
		planoNome: assinatura?.plan.nome ?? null,
		temRostoCadastrado: faceCount > 0,
		totalDescritores: faceCount,
		checkins: checkins.map(c => ({
			id: c.id,
			timestamp: c.timestamp.toISOString(),
			metodo: c.metodo
		}))
	};
};
