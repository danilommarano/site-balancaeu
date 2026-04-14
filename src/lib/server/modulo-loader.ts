// ===========================================
// BalancaEu — Loader compartilhado para páginas de módulo
// ===========================================

import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export async function loadModulo(tenantId: string | undefined, modalityId: string) {
	if (!tenantId) throw error(404, 'Não encontrado');

	const [modality, cmsContents] = await Promise.all([
		db.modality.findFirst({
			where: { id: modalityId, tenantId, ativo: true }
		}),
		db.cmsContent.findMany({
			where: { tenantId, ativo: true },
			orderBy: [{ secao: 'asc' }, { ordem: 'asc' }]
		})
	]);

	if (!modality) throw error(404, 'Modalidade não encontrada');

	const [professores, turmas] = await Promise.all([
		db.user.findMany({
			where: {
				tenantId,
				role: 'PROFESSOR',
				ativo: true,
				teacher: {
					modalities: { some: { id: modalityId } }
				}
			},
			orderBy: { nome: 'asc' },
			select: {
				id: true,
				nome: true,
				teacher: { select: { bio: true, especialidades: true, imagemUrl: true } }
			}
		}),
		db.classGroup.findMany({
			where: { tenantId, modalityId, ativo: true },
			orderBy: [{ diaSemana: 'asc' }, { horarioInicio: 'asc' }],
			include: {
				professor: { select: { nome: true } },
				_count: { select: { enrollments: { where: { status: { in: ['ATIVA', 'LISTA_ESPERA'] } } } } }
			}
		})
	]);

	const cms: Record<string, Record<string, string>> = {};
	const moduloCms: Record<string, Record<string, string>> = {};
	const prefix = `modulo.${modalityId}.`;

	for (const item of cmsContents) {
		if (item.secao.startsWith(prefix)) {
			const secao = item.secao.slice(prefix.length);
			if (!moduloCms[secao]) moduloCms[secao] = {};
			moduloCms[secao][item.chave] = item.valorTexto ?? item.valorImagemUrl ?? '';
		} else {
			if (!cms[item.secao]) cms[item.secao] = {};
			cms[item.secao][item.chave] = item.valorTexto ?? item.valorImagemUrl ?? '';
		}
	}

	return { modality, professores, turmas, cms, moduloCms };
}
