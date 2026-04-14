// ===========================================
// BalancaEu — OAuth providers (Google, Apple)
// ===========================================
// Requer env vars: ver .env.example para config completa.

import { Google, Apple } from 'arctic';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { randomUUID } from 'crypto';

// ─── Google ──────────────────────────────────────
export function getGoogleProvider(origin: string): Google | null {
	if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return null;
	return new Google(
		env.GOOGLE_CLIENT_ID,
		env.GOOGLE_CLIENT_SECRET,
		`${origin}/login/google/callback`
	);
}

export type GoogleUserInfo = {
	sub: string;
	email: string;
	email_verified: boolean;
	name?: string;
	picture?: string;
};

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
	const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (!response.ok) throw new Error(`Google userinfo failed: ${response.status}`);
	return response.json();
}

// ─── Apple ───────────────────────────────────────
function pemToPkcs8(pem: string): Uint8Array {
	const base64 = pem
		.replace('-----BEGIN PRIVATE KEY-----', '')
		.replace('-----END PRIVATE KEY-----', '')
		.replace(/\\n/g, '\n')
		.replace(/\s+/g, '');
	return Uint8Array.from(Buffer.from(base64, 'base64'));
}

export function getAppleProvider(origin: string): Apple | null {
	if (
		!env.APPLE_CLIENT_ID ||
		!env.APPLE_TEAM_ID ||
		!env.APPLE_KEY_ID ||
		!env.APPLE_PRIVATE_KEY
	) {
		return null;
	}
	return new Apple(
		env.APPLE_CLIENT_ID,
		env.APPLE_TEAM_ID,
		env.APPLE_KEY_ID,
		pemToPkcs8(env.APPLE_PRIVATE_KEY),
		`${origin}/login/apple/callback`
	);
}

export type AppleIdTokenClaims = {
	sub: string;
	email?: string;
	email_verified?: boolean | string;
};

export function decodeIdToken<T = Record<string, unknown>>(token: string): T {
	const parts = token.split('.');
	if (parts.length !== 3) throw new Error('Invalid JWT');
	const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
	const padded = b64 + '==='.slice(0, (4 - (b64.length % 4)) % 4);
	return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
}

// ─── Usuário OAuth ───────────────────────────────
export async function createOrLinkOAuthUser(params: {
	tenantId: string;
	email: string;
	nome: string;
}) {
	const existing = await db.user.findUnique({
		where: { tenantId_email: { tenantId: params.tenantId, email: params.email } }
	});
	if (existing) return existing;

	return db.user.create({
		data: {
			tenantId: params.tenantId,
			email: params.email,
			nome: params.nome,
			// Placeholder inutilizável — login por senha fica bloqueado
			senhaHash: `oauth:${randomUUID()}`,
			role: 'ALUNO'
		}
	});
}
