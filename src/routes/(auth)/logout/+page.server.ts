import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { invalidateSession, getSessionToken, deleteSessionCookie } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ cookies }) => {
		const token = getSessionToken(cookies);
		if (token) {
			await invalidateSession(token);
		}
		deleteSessionCookie(cookies);
		throw redirect(303, '/login');
	}
};
