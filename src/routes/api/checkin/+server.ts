import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
	const admin = locals.user;
	if (!admin || admin.role !== 'ADMIN') throw error(401, 'Acesso negado');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw error(400, 'Tenant não encontrado');

	const body = await request.json();
	const { payload, metodo } = body as { payload: string; metodo?: string };

	if (!payload) throw error(400, 'Payload inválido');

	// Parse QR payload: pulso:tenantId:userId
	const parts = payload.split(':');
	if (parts.length !== 3 || parts[0] !== 'pulso') {
		return json({ success: false, error: 'QR Code inválido.' }, { status: 400 });
	}

	const [, qrTenantId, userId] = parts;

	// For manual check-ins, tenant field is '_'; for QR scans, verify tenant matches
	if (qrTenantId !== '_' && qrTenantId !== tenantId) {
		return json({ success: false, error: 'QR Code pertence a outra escola.' }, { status: 400 });
	}

	// Find the student
	const aluno = await db.user.findFirst({
		where: { id: userId, tenantId, role: 'ALUNO' },
		select: { id: true, nome: true, ativo: true }
	});

	if (!aluno) {
		return json({ success: false, error: 'Aluno não encontrado.' }, { status: 404 });
	}

	if (!aluno.ativo) {
		return json({
			success: false,
			error: `Aluno "${aluno.nome}" está bloqueado/inativo.`,
			aluno: { nome: aluno.nome, ativo: false }
		}, { status: 400 });
	}

	// Check active subscription
	const assinatura = await db.subscription.findFirst({
		where: { userId, tenantId, status: 'ATIVA' },
		include: { plan: { select: { nome: true } } }
	});

	if (!assinatura) {
		return json({
			success: false,
			error: `Aluno "${aluno.nome}" não possui assinatura ativa.`,
			aluno: { nome: aluno.nome, ativo: true, plano: null }
		}, { status: 400 });
	}

	// Check for duplicate check-in (within last 30 minutes)
	const trintaMinAtras = new Date(Date.now() - 30 * 60 * 1000);
	const checkinRecente = await db.checkIn.findFirst({
		where: { userId, tenantId, timestamp: { gte: trintaMinAtras } }
	});

	if (checkinRecente) {
		const horaCheckin = checkinRecente.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
		return json({
			success: false,
			error: `Check-in duplicado. "${aluno.nome}" já fez check-in às ${horaCheckin}.`,
			aluno: { nome: aluno.nome, ativo: true, plano: assinatura.plan.nome },
			duplicado: true
		}, { status: 409 });
	}

	// Register check-in
	const metodoCheckin = metodo === 'MANUAL' ? 'MANUAL' : metodo === 'FACIAL' ? 'FACIAL' : 'QR_CODE';
	const checkin = await db.checkIn.create({
		data: {
			tenantId,
			userId,
			metodo: metodoCheckin
		}
	});

	return json({
		success: true,
		message: `Check-in de "${aluno.nome}" registrado!`,
		aluno: { nome: aluno.nome, ativo: true, plano: assinatura.plan.nome },
		checkin: {
			id: checkin.id,
			timestamp: checkin.timestamp.toISOString(),
			metodo: checkin.metodo
		}
	});
};
