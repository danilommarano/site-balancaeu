import { error, redirect } from '@sveltejs/kit';
import { generateState, generateCodeVerifier } from 'arctic';
import type { RequestHandler } from './$types';
import { getGoogleProvider } from '$lib/server/oauth';

export const GET: RequestHandler = ({ cookies, url }) => {
	const google = getGoogleProvider(url.origin);
	if (!google) throw error(500, 'Login com Google não está configurado neste servidor.');

	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const authUrl = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

	const isHttps = url.protocol === 'https:';
	cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: isHttps,
		maxAge: 60 * 10
	});
	cookies.set('google_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: isHttps,
		maxAge: 60 * 10
	});

	throw redirect(302, authUrl.toString());
};
