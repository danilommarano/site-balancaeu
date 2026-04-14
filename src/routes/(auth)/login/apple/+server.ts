import { error, redirect } from '@sveltejs/kit';
import { generateState } from 'arctic';
import type { RequestHandler } from './$types';
import { getAppleProvider } from '$lib/server/oauth';

export const GET: RequestHandler = ({ cookies, url }) => {
	const apple = getAppleProvider(url.origin);
	if (!apple) throw error(500, 'Login com Apple não está configurado neste servidor.');

	const state = generateState();
	const authUrl = apple.createAuthorizationURL(state, ['name', 'email']);
	// Força response_mode=form_post (obrigatório quando pede name/email)
	authUrl.searchParams.set('response_mode', 'form_post');

	const isHttps = url.protocol === 'https:';
	cookies.set('apple_oauth_state', state, {
		path: '/',
		httpOnly: true,
		// Apple POSTa o callback cross-site — precisa SameSite=none para o cookie chegar.
		sameSite: 'none',
		secure: true,
		maxAge: 60 * 10
	});

	throw redirect(302, authUrl.toString());
};
