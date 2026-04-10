import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { hashPassword, createSession, setSessionCookie } from '$lib/server/auth';
import { sendEmail } from '$lib/server/email';
import { welcomeEmail } from '$lib/server/email/templates';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		const role = locals.user.role;
		if (role === 'ADMIN') throw redirect(303, '/admin');
		if (role === 'PROFESSOR') throw redirect(303, '/professor');
		throw redirect(303, '/aluno');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies, locals }) => {
		const data = await request.formData();
		const nome = data.get('nome')?.toString().trim();
		const email = data.get('email')?.toString().trim().toLowerCase();
		const password = data.get('password')?.toString();
		const passwordConfirm = data.get('passwordConfirm')?.toString();

		if (!nome || !email || !password || !passwordConfirm) {
			return fail(400, { error: 'Todos os campos são obrigatórios', nome, email });
		}

		if (password.length < 6) {
			return fail(400, { error: 'A senha deve ter no mínimo 6 caracteres', nome, email });
		}

		if (password !== passwordConfirm) {
			return fail(400, { error: 'As senhas não coincidem', nome, email });
		}

		const tenantId = locals.tenant?.id;
		if (!tenantId) {
			return fail(400, { error: 'Escola não encontrada', nome, email });
		}

		const existing = await db.user.findUnique({
			where: { tenantId_email: { tenantId, email } }
		});

		if (existing) {
			return fail(400, { error: 'Este email já está cadastrado', nome, email });
		}

		const senhaHash = await hashPassword(password);

		const user = await db.user.create({
			data: {
				tenantId,
				nome,
				email,
				senhaHash,
				role: 'ALUNO'
			}
		});

		// Enviar email de boas-vindas (async, não bloqueia o cadastro)
		const schoolName = locals.tenant?.nome ?? 'Pulso';
		sendEmail({
			to: email,
			subject: `Bem-vindo(a) à ${schoolName}! 🎉`,
			html: welcomeEmail(nome, schoolName)
		}).catch(err => console.error('Erro ao enviar email de boas-vindas:', err));

		const session = await createSession(user.id);
		setSessionCookie(cookies, session.token);

		throw redirect(303, '/aluno');
	}
};

