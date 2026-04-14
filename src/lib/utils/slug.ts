/**
 * Converte um texto em slug: minúsculo, sem acentos, espaços viram hífen.
 * Ex: "Forró Roots" → "forro-roots"
 */
export function slugify(text: string): string {
	return text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}
