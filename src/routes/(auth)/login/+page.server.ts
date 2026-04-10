import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
	verifyPassword,
	createSession,
	setSessionCookie
} from '$lib/server/auth';

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
		const email = data.get('email')?.toString().trim().toLowerCase();
		const password = data.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Email e senha são obrigatórios', email });
		}

		const tenantId = locals.tenant?.id;
		if (!tenantId) {
			return fail(400, { error: 'Escola não encontrada', email });
		}

		const user = await db.user.findUnique({
			where: { tenantId_email: { tenantId, email } }
		});

		if (!user || !user.ativo) {
			return fail(400, { error: 'Email ou senha incorretos', email });
		}

		const valid = await verifyPassword(password, user.senhaHash);
		if (!valid) {
			return fail(400, { error: 'Email ou senha incorretos', email });
		}

		const session = await createSession(user.id);
		setSessionCookie(cookies, session.token);

		const redirectTo = new URL(request.url).searchParams.get('redirect');
		const role = user.role;
		const defaultPath =
			role === 'ADMIN' ? '/admin' : role === 'PROFESSOR' ? '/professor' : '/aluno';

		throw redirect(303, redirectTo ?? defaultPath);
	}
};
