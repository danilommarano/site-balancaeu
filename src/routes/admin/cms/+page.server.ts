import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';

// Seções conhecidas da landing page com suas chaves esperadas
const SECOES_CONFIG: Record<string, { label: string; chaves: { chave: string; label: string; tipo: 'texto' | 'imagem' | 'textarea' }[] }> = {
	hero: {
		label: 'Hero (Banner Principal)',
		chaves: [
			{ chave: 'titulo', label: 'Título principal', tipo: 'texto' },
			{ chave: 'subtitulo', label: 'Subtítulo', tipo: 'textarea' },
			{ chave: 'cta_texto', label: 'Texto do botão CTA', tipo: 'texto' },
			{ chave: 'cta_link', label: 'Link do botão CTA', tipo: 'texto' },
			{ chave: 'imagem', label: 'Imagem do hero', tipo: 'imagem' },
			{ chave: 'frase_destaque', label: 'Frase de destaque (overlay)', tipo: 'texto' }
		]
	},
	escola: {
		label: 'Sobre a Escola',
		chaves: [
			{ chave: 'label', label: 'Label da seção', tipo: 'texto' },
			{ chave: 'titulo', label: 'Título da seção', tipo: 'texto' },
			{ chave: 'paragrafo_1', label: 'Parágrafo 1 (esquerda)', tipo: 'textarea' },
			{ chave: 'paragrafo_2', label: 'Parágrafo 2 (direita)', tipo: 'textarea' }
		]
	},
	precos: {
		label: 'Preços',
		chaves: [
			{ chave: 'label', label: 'Label da seção', tipo: 'texto' },
			{ chave: 'titulo', label: 'Título da seção', tipo: 'texto' },
			{ chave: 'descricao', label: 'Descrição', tipo: 'textarea' }
		]
	},
	professores: {
		label: 'Professores',
		chaves: [
			{ chave: 'label', label: 'Label da seção', tipo: 'texto' },
			{ chave: 'titulo', label: 'Título da seção', tipo: 'texto' },
			{ chave: 'descricao', label: 'Descrição lateral', tipo: 'textarea' }
		]
	},
	horarios: {
		label: 'Horários / Grade de Aulas',
		chaves: [
			{ chave: 'label', label: 'Label da seção', tipo: 'texto' },
			{ chave: 'titulo', label: 'Título da seção', tipo: 'texto' }
		]
	},
	eventos: {
		label: 'Eventos',
		chaves: [
			{ chave: 'label', label: 'Label da seção', tipo: 'texto' },
			{ chave: 'titulo', label: 'Título da seção', tipo: 'texto' },
			{ chave: 'descricao', label: 'Descrição lateral', tipo: 'textarea' }
		]
	},
	cta_final: {
		label: 'CTA Final (Contato)',
		chaves: [
			{ chave: 'titulo', label: 'Título principal', tipo: 'textarea' },
			{ chave: 'titulo_destaque', label: 'Frase em destaque (colorida)', tipo: 'texto' },
			{ chave: 'cta_primario_texto', label: 'Texto do botão primário', tipo: 'texto' },
			{ chave: 'cta_primario_link', label: 'Link do botão primário', tipo: 'texto' },
			{ chave: 'cta_secundario_texto', label: 'Texto do botão secundário', tipo: 'texto' }
		]
	},
	contato: {
		label: 'Contato & Redes Sociais',
		chaves: [
			{ chave: 'whatsapp', label: 'WhatsApp (com DDI)', tipo: 'texto' },
			{ chave: 'instagram', label: 'Instagram (@handle)', tipo: 'texto' },
			{ chave: 'instagram_url', label: 'URL do Instagram', tipo: 'texto' },
			{ chave: 'whatsapp_url', label: 'URL do WhatsApp', tipo: 'texto' },
			{ chave: 'email', label: 'Email de contato', tipo: 'texto' }
		]
	},
	footer: {
		label: 'Rodapé',
		chaves: [
			{ chave: 'descricao', label: 'Descrição da escola', tipo: 'textarea' },
			{ chave: 'copyright', label: 'Texto de copyright', tipo: 'texto' }
		]
	}
};

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) return { conteudos: [], secoesConfig: SECOES_CONFIG };

	const conteudos = await db.cmsContent.findMany({
		where: { tenantId },
		orderBy: [{ secao: 'asc' }, { ordem: 'asc' }]
	});

	return {
		conteudos: conteudos.map(c => ({
			...c,
			updatedAt: c.updatedAt.toISOString()
		})),
		secoesConfig: SECOES_CONFIG
	};
};

export const actions: Actions = {
	upsert: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const secao = fd.get('secao')?.toString().trim();
		const chave = fd.get('chave')?.toString().trim();
		const valorTexto = fd.get('valorTexto')?.toString() ?? null;
		const valorImagemUrl = fd.get('valorImagemUrl')?.toString() ?? null;
		const ordem = parseInt(fd.get('ordem')?.toString() ?? '0');

		if (!secao || !chave) {
			return fail(400, { error: 'Seção e chave são obrigatórios' });
		}

		await db.cmsContent.upsert({
			where: { tenantId_secao_chave: { tenantId, secao, chave } },
			update: { valorTexto, valorImagemUrl, ordem },
			create: { tenantId, secao, chave, valorTexto, valorImagemUrl, ordem }
		});

		return { success: true, updatedKey: `${secao}.${chave}` };
	},

	upsertBatch: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const secao = fd.get('secao')?.toString().trim();
		if (!secao) return fail(400, { error: 'Seção é obrigatória' });

		const config = SECOES_CONFIG[secao];
		if (!config) return fail(400, { error: 'Seção inválida' });

		const operations = [];
		for (let i = 0; i < config.chaves.length; i++) {
			const { chave, tipo } = config.chaves[i];
			const valorTexto = tipo !== 'imagem' ? (fd.get(`${chave}_texto`)?.toString() ?? null) : null;
			const valorImagemUrl = tipo === 'imagem' ? (fd.get(`${chave}_imagem`)?.toString() ?? null) : null;

			operations.push(
				db.cmsContent.upsert({
					where: { tenantId_secao_chave: { tenantId, secao, chave } },
					update: { valorTexto, valorImagemUrl, ordem: i + 1 },
					create: { tenantId, secao, chave, valorTexto, valorImagemUrl, ordem: i + 1 }
				})
			);
		}

		await Promise.all(operations);
		return { success: true, updatedSection: secao };
	},

	toggleActive: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		const ativo = fd.get('ativo') === 'true';
		if (!id) return fail(400, { error: 'ID obrigatório' });

		await db.cmsContent.update({ where: { id }, data: { ativo } });
		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID obrigatório' });

		await db.cmsContent.delete({ where: { id } });
		return { success: true };
	},

	initSection: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const secao = fd.get('secao')?.toString().trim();
		if (!secao) return fail(400, { error: 'Seção é obrigatória' });

		const config = SECOES_CONFIG[secao];
		if (!config) return fail(400, { error: 'Seção inválida' });

		const operations = config.chaves.map((c, i) =>
			db.cmsContent.upsert({
				where: { tenantId_secao_chave: { tenantId, secao, chave: c.chave } },
				update: {},
				create: {
					tenantId,
					secao,
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
