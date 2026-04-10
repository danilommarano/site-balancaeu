// ===========================================
// Pulso — Serviço de Email (Resend)
// ===========================================
// Fase 16 — Envio de emails transacionais

import { env } from '$env/dynamic/private';

interface SendEmailOptions {
	to: string | string[];
	subject: string;
	html: string;
}

interface EmailResult {
	success: boolean;
	id?: string;
	error?: string;
}

/**
 * Envia um email usando o Resend.
 * Se RESEND_API_KEY não estiver configurada, loga no console (dev mode).
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
	const { to, subject, html } = options;
	const from = env.EMAIL_FROM || 'Pulso <noreply@pulso.app>';

	// Fallback: sem API key, apenas logar no console
	if (!env.RESEND_API_KEY || env.RESEND_API_KEY === 're_...') {
		console.log('─── Email (dev mode - sem Resend) ───');
		console.log(`  Para: ${Array.isArray(to) ? to.join(', ') : to}`);
		console.log(`  Assunto: ${subject}`);
		console.log(`  De: ${from}`);
		console.log('──────────────────────────────────────');
		return { success: true, id: 'dev-mode' };
	}

	try {
		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${env.RESEND_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from,
				to: Array.isArray(to) ? to : [to],
				subject,
				html
			})
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error('Erro ao enviar email:', errorData);
			return { success: false, error: JSON.stringify(errorData) };
		}

		const data = await response.json();
		return { success: true, id: data.id };
	} catch (error) {
		console.error('Erro ao enviar email:', error);
		return { success: false, error: String(error) };
	}
}
