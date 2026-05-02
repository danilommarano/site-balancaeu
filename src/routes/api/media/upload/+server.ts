import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { uploadToS3 } from '$lib/server/s3';
import { env } from '$env/dynamic/private';

const MAX_TOTAL_BYTES = parseInt(env.MEDIA_MAX_TOTAL_BYTES || '5368709120'); // 5 GB
const MAX_TOTAL_FILES = parseInt(env.MEDIA_MAX_TOTAL_FILES || '200');
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB per file
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || (locals.user.role !== 'ADMIN' && locals.user.role !== 'PROFESSOR')) {
		throw error(403, 'Não autorizado');
	}
	const tenantId = locals.tenant?.id;
	if (!tenantId) throw error(400, 'Tenant não encontrado');

	const fd = await request.formData();
	const file = fd.get('file');
	const category = (fd.get('category')?.toString() || 'general').slice(0, 32);

	if (!(file instanceof File)) throw error(400, 'Arquivo inválido');
	if (file.size === 0) throw error(400, 'Arquivo vazio');
	if (file.size > MAX_FILE_BYTES) throw error(400, `Arquivo maior que ${MAX_FILE_BYTES / 1024 / 1024} MB`);
	if (!ALLOWED_TYPES.includes(file.type)) throw error(400, `Tipo não suportado: ${file.type}`);

	// Verificar limite global do tenant
	const agg = await db.mediaAsset.aggregate({
		where: { tenantId },
		_sum: { sizeBytes: true },
		_count: true
	});
	const usedBytes = agg._sum.sizeBytes ?? 0;
	const usedFiles = agg._count;

	if (usedFiles >= MAX_TOTAL_FILES) {
		throw error(413, `Limite de ${MAX_TOTAL_FILES} arquivos atingido. Remova alguns para fazer novos uploads.`);
	}
	if (usedBytes + file.size > MAX_TOTAL_BYTES) {
		throw error(413, `Limite de ${(MAX_TOTAL_BYTES / 1024 / 1024 / 1024).toFixed(1)} GB atingido.`);
	}

	const arrayBuffer = await file.arrayBuffer();
	const body = new Uint8Array(arrayBuffer);

	const { s3Key, url } = await uploadToS3({
		tenantId,
		category,
		filename: file.name,
		contentType: file.type,
		body,
		visibility: 'public'
	});

	const asset = await db.mediaAsset.create({
		data: {
			tenantId,
			uploadedById: locals.user.id,
			filename: file.name,
			s3Key,
			url,
			mimeType: file.type,
			sizeBytes: file.size,
			category
		}
	});

	return json({
		id: asset.id,
		url: asset.url,
		filename: asset.filename,
		sizeBytes: asset.sizeBytes,
		mimeType: asset.mimeType,
		createdAt: asset.createdAt.toISOString()
	});
};
