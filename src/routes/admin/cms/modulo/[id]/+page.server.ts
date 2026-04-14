import { fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { SECOES_MODULO, secaoKey, stripPrefix } from '$lib/server/cms-modulo';

export const load: PageServerLoad = async ({ locals, params }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) throw error(404, 'Tenant não encontrado');

	const modality = await db.modality.findFirst({
		where: { id: params.id, tenantId }
	});
	if (!modality) throw error(404, 'Modalidade não encontrada');

	const prefix = `modulo.${params.id}.`;
	const rawContents = await db.cmsContent.findMany({
		where: { tenantId, secao: { startsWith: prefix } },
		orderBy: [{ secao: 'asc' }, { ordem: 'asc' }]
	});

	// Remapear para o nome da secao sem o prefixo (hero, sobre, ...)
	const conteudos = rawContents.map(c => ({
		...c,
		secao: stripPrefix(c.secao, params.id) ?? c.secao,
		updatedAt: c.updatedAt.toISOString()
	}));

	return {
		modality,
		conteudos,
		secoesConfig: SECOES_MODULO
	};
};

export const actions: Actions = {
	upsertBatch: async ({ request, locals, params }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const secao = fd.get('secao')?.toString().trim();
		if (!secao) return fail(400, { error: 'Seção é obrigatória' });

		const config = SECOES_MODULO[secao];
		if (!config) return fail(400, { error: 'Seção inválida' });

		const fullSecao = secaoKey(params.id, secao);

		const operations = [];
		for (let i = 0; i < config.chaves.length; i++) {
			const { chave, tipo } = config.chaves[i];
			const valorTexto = tipo !== 'imagem' ? (fd.get(`${chave}_texto`)?.toString() ?? null) : null;
			const valorImagemUrl = tipo === 'imagem' ? (fd.get(`${chave}_imagem`)?.toString() ?? null) : null;

			operations.push(
				db.cmsContent.upsert({
					where: { tenantId_secao_chave: { tenantId, secao: fullSecao, chave } },
					update: { valorTexto, valorImagemUrl, ordem: i + 1 },
					create: { tenantId, secao: fullSecao, chave, valorTexto, valorImagemUrl, ordem: i + 1 }
				})
			);
		}

		await Promise.all(operations);
		return { success: true, updatedSection: secao };
	},

	initSection: async ({ request, locals, params }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const secao = fd.get('secao')?.toString().trim();
		if (!secao) return fail(400, { error: 'Seção é obrigatória' });

		const config = SECOES_MODULO[secao];
		if (!config) return fail(400, { error: 'Seção inválida' });

		const fullSecao = secaoKey(params.id, secao);

		const operations = config.chaves.map((c, i) =>
			db.cmsContent.upsert({
				where: { tenantId_secao_chave: { tenantId, secao: fullSecao, chave: c.chave } },
				update: {},
				create: {
					tenantId,
					secao: fullSecao,
					chave: c.chave,
					valorTexto: c.tipo !== 'imagem' ? '' : null,
					valorImagemUrl: c.tipo === 'imagem' ? '' : null,
					ordem: i + 1
				}
			})
		);

		await Promise.all(operations);
		return { success: true, initializedSection: secao };
	}
};
