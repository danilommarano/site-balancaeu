import type { PageServerLoad } from './$types';
import { loadModulo } from '$lib/server/modulo-loader';

export const load: PageServerLoad = async ({ locals }) => {
	return loadModulo(locals.tenant?.id, 'forro-roots');
};
