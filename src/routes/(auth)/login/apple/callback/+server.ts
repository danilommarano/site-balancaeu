import { error, redirect } from '@sveltejs/kit';
import { OAuth2RequestError } from 'arctic';
import type { RequestHandler } from './$types';
import {
	getAppleProvider,
	decodeIdToken,
	createOrLinkOAuthUser,
	type AppleIdTokenClaims
} from '$lib/server/oauth';
import { createSession, setSessionCookie } from '$lib/server/auth';

// Apple usa form_post quando pedimos name/email, então o callback é POST.
export const POST: RequestHandler = async ({ request, cookies, url, locals }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) throw error(400, 'Escola não encontrada.');

	const form = await request.formData();
	const code = form.get('code')?.toString();
	const state = form.get('state')?.toString();
	const userJson = form.get('user')?.toString(); // só na primeira autenticação
	const storedState = cookies.get('apple_oauth_state');

	if (!code || !state || !storedState || state !== storedState) {
		throw error(400, 'Callback inválido do Apple.');
	}

	const apple = getAppleProvider(url.origin);
	if (!apple) throw error(500, 'Login com Apple não está configurado.');

	try {
		const tokens = await apple.validateAuthorizationCode(code);
		const idToken = tokens.idToken();
		const claims = decodeIdToken<AppleIdTokenClaims>(idToken);

		if (!claims.email) {
			throw error(400, 'Apple não retornou email (tente revogar acesso e reautorizar).');
		}

		// Nome só vem na primeira autenticação, como JSON string.
		let nome = claims.email.split('@')[0];
		if (userJson) {
			try {
				const parsed = JSON.parse(userJson) as {
					name?: { firstName?: string; lastName?: string };
				};
				const first = parsed.name?.firstName ?? '';
				const last = parsed.name?.lastName ?? '';
				const full = `${first} ${last}`.trim();
				if (full) nome = full;
			} catch {
				// ignora
			}
		}

		const user = await createOrLinkOAuthUser({
			tenantId,
			email: claims.email.toLowerCase(),
			nome
		});

		const session = await createSession(user.id);
		setSessionCookie(cookies, session.token);

		cookies.delete('apple_oauth_state', { path: '/' });
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			throw error(400, `Erro no OAuth Apple: ${e.message}`);
		}
		throw e;
	}

	throw redirect(303, '/aluno');
};

// Fallback para GET (caso de erro antes de chegar ao form_post)
export const GET: RequestHandler = ({ url }) => {
	const errMsg = url.searchParams.get('error');
	throw error(400, errMsg ? `Apple OAuth: ${errMsg}` : 'Callback inesperado do Apple.');
};
