import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

// POST: Register face descriptors for authenticated student
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user || user.role !== 'ALUNO') throw error(401, 'Não autenticado');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw error(400, 'Tenant não encontrado');

	const body = await request.json();
	const { descriptors } = body as { descriptors: number[][] };

	if (!descriptors || !Array.isArray(descriptors) || descriptors.length === 0) {
		return json({ success: false, error: 'Nenhum descritor facial enviado.' }, { status: 400 });
	}

	if (descriptors.length > 5) {
		return json({ success: false, error: 'Máximo de 5 descritores permitidos.' }, { status: 400 });
	}

	// Validate each descriptor is a valid array of 128 floats
	for (const d of descriptors) {
		if (!Array.isArray(d) || d.length !== 128) {
			return json({ success: false, error: 'Descritor facial inválido (esperado 128 valores).' }, { status: 400 });
		}
	}

	// Delete old descriptors for this user
	await db.faceDescriptor.deleteMany({
		where: { userId: user.id, tenantId }
	});

	// Store new descriptors
	await db.faceDescriptor.createMany({
		data: descriptors.map(d => ({
			tenantId,
			userId: user.id,
			descriptor: JSON.stringify(d)
		}))
	});

	return json({
		success: true,
		message: `${descriptors.length} descritor(es) facial(is) registrado(s).`,
		count: descriptors.length
	});
};

// DELETE: Remove face descriptors for authenticated student
export const DELETE: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user || user.role !== 'ALUNO') throw error(401, 'Não autenticado');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw error(400, 'Tenant não encontrado');

	await db.faceDescriptor.deleteMany({
		where: { userId: user.id, tenantId }
	});

	return json({ success: true, message: 'Dados faciais removidos.' });
};

// GET: Get all face descriptors for the tenant (admin only, for matching)
export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user || user.role !== 'ADMIN') throw error(401, 'Acesso negado');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw error(400, 'Tenant não encontrado');

	const descriptors = await db.faceDescriptor.findMany({
		where: { tenantId },
		include: {
			user: { select: { id: true, nome: true } }
		}
	});

	// Group by user
	const byUser = new Map<string, { userId: string; nome: string; descriptors: number[][] }>();
	for (const fd of descriptors) {
		if (!byUser.has(fd.userId)) {
			byUser.set(fd.userId, { userId: fd.userId, nome: fd.user.nome, descriptors: [] });
		}
		byUser.get(fd.userId)!.descriptors.push(JSON.parse(fd.descriptor));
	}

	return json({
		faces: Array.from(byUser.values())
	});
};
