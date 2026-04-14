import { error, redirect } from '@sveltejs/kit';
import { OAuth2RequestError } from 'arctic';
import type { RequestHandler } from './$types';
import { getGoogleProvider, fetchGoogleUserInfo, createOrLinkOAuthUser } from '$lib/server/oauth';
import { createSession, setSessionCookie } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies, url, locals }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) throw error(400, 'Escola não encontrada.');

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('google_oauth_state');
	const codeVerifier = cookies.get('google_code_verifier');

	if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
		throw error(400, 'Callback inválido do Google.');
	}

	const google = getGoogleProvider(url.origin);
	if (!google) throw error(500, 'Login com Google não está configurado.');

	try {
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);
		const userInfo = await fetchGoogleUserInfo(tokens.accessToken());

		if (!userInfo.email) throw error(400, 'Google não retornou email.');

		const user = await createOrLinkOAuthUser({
			tenantId,
			email: userInfo.email.toLowerCase(),
			nome: userInfo.name ?? userInfo.email.split('@')[0]
		});

		const session = await createSession(user.id);
		setSessionCookie(cookies, session.token);

		cookies.delete('google_oauth_state', { path: '/' });
		cookies.delete('google_code_verifier', { path: '/' });
	} catch (e) {
		if (e instanceof OAuth2RequestError) {
			throw error(400, `Erro no OAuth: ${e.message}`);
		}
		throw e;
	}

	// Redireciona conforme papel (somente ALUNO sai do OAuth — admin/professor usam senha)
	throw redirect(303, '/aluno');
};
