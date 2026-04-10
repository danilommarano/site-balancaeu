import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) {
		return { cms: {}, planos: [], professores: [], turmas: [], eventos: [] };
	}

	const [cmsContents, planos, professores, turmas, eventos] = await Promise.all([
		db.cmsContent.findMany({
			where: { tenantId, ativo: true },
			orderBy: [{ secao: 'asc' }, { ordem: 'asc' }]
		}),
		db.plan.findMany({
			where: { tenantId, ativo: true },
			orderBy: { preco: 'asc' }
		}),
		db.user.findMany({
			where: { tenantId, role: 'PROFESSOR', ativo: true },
			orderBy: { nome: 'asc' },
			select: {
				id: true,
				nome: true,
				teacher: {
					select: { bio: true, especialidades: true, imagemUrl: true }
				}
			}
		}),
		db.classGroup.findMany({
			where: { tenantId, ativo: true },
			orderBy: [{ diaSemana: 'asc' }, { horarioInicio: 'asc' }],
			include: {
				modality: { select: { nome: true } },
				professor: { select: { nome: true } },
				_count: { select: { enrollments: { where: { status: { in: ['ATIVA', 'LISTA_ESPERA'] } } } } }
			}
		}),
		db.event.findMany({
			where: { tenantId, ativo: true, data: { gte: new Date() } },
			orderBy: { data: 'asc' },
			take: 6
		})
	]);

	// Organizar CMS por seção → { secao: { chave: valor } }
	const cms: Record<string, Record<string, string>> = {};
	for (const item of cmsContents) {
		if (!cms[item.secao]) cms[item.secao] = {};
		cms[item.secao][item.chave] = item.valorTexto ?? item.valorImagemUrl ?? '';
	}

	return {
		cms,
		planos: planos.map(p => ({
			...p,
			preco: Number(p.preco),
			createdAt: p.createdAt.toISOString()
		})),
		professores,
		turmas,
		eventos: eventos.map(e => ({
			...e,
			preco: e.preco ? Number(e.preco) : null,
			data: e.data.toISOString(),
			createdAt: e.createdAt.toISOString()
		}))
	};
};
