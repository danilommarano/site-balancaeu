// ===========================================
// Pulso — Webhook do Stripe
// ===========================================
// TODO: Fase 10 — Receber eventos do Stripe
// Eventos: checkout.session.completed, invoice.paid,
//          customer.subscription.updated, customer.subscription.deleted

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	// TODO: Implementar verificação de assinatura e processamento
	return new Response('Webhook not implemented yet', { status: 501 });
};
