/**
 * Pulso — Validação server-side reutilizável
 */

export function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
	if (!phone) return true;
	const digits = phone.replace(/\D/g, '');
	return digits.length >= 10 && digits.length <= 13;
}

export function sanitizePhone(phone: string): string {
	return phone.replace(/[^\d()+\-\s]/g, '').trim();
}

export function isValidPrice(price: number): boolean {
	return !isNaN(price) && price >= 0 && price <= 999999;
}

export function isValidTime(time: string): boolean {
	return /^\d{2}:\d{2}$/.test(time);
}

export function isNotEmpty(value: string | null | undefined): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

export function isValidUrl(url: string): boolean {
	if (!url) return true;
	return url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://');
}
