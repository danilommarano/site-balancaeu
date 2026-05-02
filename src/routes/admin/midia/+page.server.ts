import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { deleteFromS3 } from '$lib/server/s3';
import { env } from '$env/dynamic/private';

const MAX_TOTAL_BYTES = parseInt(env.MEDIA_MAX_TOTAL_BYTES || '5368709120');
const MAX_TOTAL_FILES = parseInt(env.MEDIA_MAX_TOTAL_FILES || '200');

export const load: PageServerLoad = async ({ locals, url }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) {
		return {
			assets: [],
			usage: { usedBytes: 0, usedFiles: 0, maxBytes: MAX_TOTAL_BYTES, maxFiles: MAX_TOTAL_FILES },
			category: null,
			search: ''
		};
	}

	const category = url.searchParams.get('category') || null;
	const search = url.searchParams.get('q')?.trim() ?? '';

	const [assets, agg] = await Promise.all([
		db.mediaAsset.findMany({
			where: {
				tenantId,
				...(category ? { category } : {}),
				...(search ? { filename: { contains: search, mode: 'insensitive' } } : {})
			},
			orderBy: { createdAt: 'desc' },
			take: 200,
			select: {
				id: true,
				filename: true,
				url: true,
				mimeType: true,
				sizeBytes: true,
				category: true,
				createdAt: true,
				uploadedBy: { select: { nome: true } }
			}
		}),
		db.mediaAsset.aggregate({
			where: { tenantId },
			_sum: { sizeBytes: true },
			_count: true
		})
	]);

	return {
		assets: assets.map((a) => ({
			...a,
			createdAt: a.createdAt.toISOString(),
			uploadedBy: a.uploadedBy?.nome ?? null
		})),
		usage: {
			usedBytes: agg._sum.sizeBytes ?? 0,
			usedFiles: agg._count,
			maxBytes: MAX_TOTAL_BYTES,
			maxFiles: MAX_TOTAL_FILES
		},
		category,
		search
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });
		if (locals.user?.role !== 'ADMIN') return fail(403, { error: 'Apenas admins podem excluir' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID obrigatório' });

		const asset = await db.mediaAsset.findFirst({ where: { id, tenantId } });
		if (!asset) return fail(404, { error: 'Imagem não encontrada' });

		await deleteFromS3(asset.s3Key).catch(() => {});
		await db.mediaAsset.delete({ where: { id } });

		return { success: true };
	}
};
