// ===========================================
// BalancaEu — Server Hooks
// ===========================================

import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { validateSession, getSessionToken } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	// ─── 1. Resolver tenant pelo hostname ────────────
	const host = event.request.headers.get('host') ?? 'localhost';
	const hostname = host.split(':')[0];

	let tenant = null;

	try {
		// Em dev, usar query param ?tenant=slug ou header X-Tenant
		if (hostname === 'localhost' || hostname === '127.0.0.1') {
			const tenantSlug =
				event.url.searchParams.get('tenant') ??
				event.request.headers.get('x-tenant') ??
				'balancaeu';
			tenant = await db.tenant.findUnique({ where: { slug: tenantSlug } });
		} else {
			// Em produção: slug.ritmo.app ou domínio customizado
			const subdomain = hostname.split('.')[0];
			tenant =
				(await db.tenant.findUnique({ where: { slug: subdomain } })) ??
				(await db.tenant.findFirst({ where: { dominioCustomizado: hostname } })) ??
				(await db.tenant.findFirst({ where: { ativo: true } }));
		}
	} catch {
		// Banco indisponível — continua sem tenant
	}

	event.locals.tenant = tenant;

	// ─── 2. Validar sessão ───────────────────────────
	const token = getSessionToken(event.cookies);
	let user = null;

	try {
		if (token) {
			const session = await validateSession(token);
			if (session) {
				user = session.user;
			}
		}
	} catch {
		// Banco indisponível — continua sem sessão
	}

	event.locals.user = user;

	// ─── 3. Proteger rotas por role ──────────────────
	const path = event.url.pathname;

	const protectedRoutes: Record<string, string[]> = {
		'/admin': ['ADMIN'],
		'/professor': ['ADMIN', 'PROFESSOR'],
		'/aluno': ['ADMIN', 'ALUNO']
	};

	for (const [prefix, roles] of Object.entries(protectedRoutes)) {
		if (path.startsWith(prefix)) {
			if (!user) {
				throw redirect(303, `/login?redirect=${encodeURIComponent(path)}`);
			}
			if (!roles.includes(user.role)) {
				throw redirect(303, '/');
			}
		}
	}

	const response = await resolve(event);
	return response;
};
