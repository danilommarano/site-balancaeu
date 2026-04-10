import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import QRCode from 'qrcode';

export const GET: RequestHandler = async ({ locals, url }) => {
	const user = locals.user;
	if (!user) throw error(401, 'Não autenticado');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw error(400, 'Tenant não encontrado');

	// QR payload: tenant:userId (simple, unique, and verifiable)
	const payload = `pulso:${tenantId}:${user.id}`;

	const format = url.searchParams.get('format') ?? 'svg';

	if (format === 'svg') {
		const svg = await QRCode.toString(payload, {
			type: 'svg',
			width: 256,
			margin: 2,
			color: { dark: '#ffffff', light: '#00000000' }
		});
		return new Response(svg, {
			headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'private, max-age=3600' }
		});
	}

	const dataUrl = await QRCode.toDataURL(payload, {
		width: 512,
		margin: 2,
		color: { dark: '#ffffff', light: '#00000000' }
	});

	return json({ qrcode: dataUrl, payload });
};
