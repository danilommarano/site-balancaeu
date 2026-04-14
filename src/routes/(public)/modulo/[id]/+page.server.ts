import type { PageServerLoad } from './$types';
import { loadModulo } from '$lib/server/modulo-loader';

export const load: PageServerLoad = async ({ locals, params }) => {
	return loadModulo(locals.tenant?.id, params.id);
};
