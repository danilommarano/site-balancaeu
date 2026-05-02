import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Não autenticado');
	const body = await request.json().catch(() => ({}));
	const theme = body?.theme;
	if (theme !== 'light' && theme !== 'dark' && theme !== null) {
		throw error(400, 'theme inválido (use "light", "dark" ou null)');
	}
	await db.user.update({
		where: { id: locals.user.id },
		data: { themePreference: theme }
	});
	return json({ success: true, theme });
};
