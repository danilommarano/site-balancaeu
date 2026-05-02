import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { deleteFromS3 } from '$lib/server/s3';
import { env } from '$env/dynamic/private';

const MAX_TOTAL_BYTES = parseInt(env.MEDIA_MAX_TOTAL_BYTES || '5368709120');
const MAX_TOTAL_FILES = parseInt(env.MEDIA_MAX_TOTAL_FILES || '200');

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user || (locals.user.role !== 'ADMIN' && locals.user.role !== 'PROFESSOR')) {
		throw error(403, 'Não autorizado');
	}
	const tenantId = locals.tenant?.id;
	if (!tenantId) throw error(400, 'Tenant não encontrado');

	const category = url.searchParams.get('category') ?? undefined;
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

	return json({
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
		}
	});
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
	if (!locals.user || locals.user.role !== 'ADMIN') {
		throw error(403, 'Apenas admins podem excluir');
	}
	const tenantId = locals.tenant?.id;
	if (!tenantId) throw error(400, 'Tenant não encontrado');

	const id = url.searchParams.get('id');
	if (!id) throw error(400, 'ID obrigatório');

	const asset = await db.mediaAsset.findFirst({ where: { id, tenantId } });
	if (!asset) throw error(404, 'Imagem não encontrada');

	await deleteFromS3(asset.s3Key).catch(() => {
		// Continua mesmo se S3 falhar (ex: já deletado)
	});
	await db.mediaAsset.delete({ where: { id } });

	return json({ success: true });
};
