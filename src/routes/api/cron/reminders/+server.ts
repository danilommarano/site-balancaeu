// ===========================================
// Pulso — Cron: Lembretes e Vencimentos
// ===========================================
// Endpoint para ser chamado por cron job (ex: daily)
// Envia lembretes de aulas particulares (24h) e avisos de vencimento de plano (7 dias)

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { sendEmail } from '$lib/server/email';
import { lessonReminderEmail, planExpiringEmail } from '$lib/server/email/templates';

export const GET: RequestHandler = async () => {
	const results = { reminders: 0, expirations: 0, errors: [] as string[] };

	try {
		// ─── Lembretes de particulares (24h antes) ────────
		const amanha = new Date();
		amanha.setDate(amanha.getDate() + 1);
		const amanhaInicio = new Date(amanha);
		amanhaInicio.setHours(0, 0, 0, 0);
		const amanhaFim = new Date(amanha);
		amanhaFim.setHours(23, 59, 59, 999);

		const aulas = await db.privateLesson.findMany({
			where: {
				status: 'CONFIRMADA',
				dataHora: { gte: amanhaInicio, lte: amanhaFim }
			},
			include: {
				user: { select: { nome: true, email: true } },
				professor: { select: { nome: true } },
				modality: { select: { nome: true } },
				tenant: { select: { nome: true } }
			}
		});

		for (const aula of aulas) {
			try {
				const dataFormatada = aula.dataHora.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
				const horario = aula.dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

				await sendEmail({
					to: aula.user.email,
					subject: `Lembrete: aula particular amanhã — ${aula.modality.nome}`,
					html: lessonReminderEmail(
						aula.user.nome,
						aula.professor.nome,
						dataFormatada,
						horario,
						aula.modality.nome,
						aula.tenant.nome
					)
				});
				results.reminders++;
			} catch (err) {
				results.errors.push(`Reminder ${aula.id}: ${String(err)}`);
			}
		}

		// ─── Avisos de vencimento de plano (7 dias antes) ──
		const seteDias = new Date();
		seteDias.setDate(seteDias.getDate() + 7);
		const seteDiasInicio = new Date(seteDias);
		seteDiasInicio.setHours(0, 0, 0, 0);
		const seteDiasFim = new Date(seteDias);
		seteDiasFim.setHours(23, 59, 59, 999);

		const subscriptions = await db.subscription.findMany({
			where: {
				status: 'ATIVA',
				fim: { gte: seteDiasInicio, lte: seteDiasFim }
			},
			include: {
				user: { select: { nome: true, email: true } },
				plan: { select: { nome: true } },
				tenant: { select: { nome: true } }
			}
		});

		for (const sub of subscriptions) {
			try {
				const dataVencimento = sub.fim!.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

				await sendEmail({
					to: sub.user.email,
					subject: `Seu plano ${sub.plan.nome} vence em 7 dias`,
					html: planExpiringEmail(
						sub.user.nome,
						sub.plan.nome,
						dataVencimento,
						sub.tenant.nome
					)
				});
				results.expirations++;
			} catch (err) {
				results.errors.push(`Expiration ${sub.id}: ${String(err)}`);
			}
		}
	} catch (err) {
		results.errors.push(`Global error: ${String(err)}`);
	}

	return json({
		ok: true,
		timestamp: new Date().toISOString(),
		...results
	});
};
