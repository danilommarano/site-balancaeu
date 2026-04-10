// ===========================================
// Pulso — Autenticação (Session-based)
// ===========================================

import { db } from '$lib/server/db';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type { Cookies } from '@sveltejs/kit';

const SESSION_COOKIE = 'pulso_session';
const SESSION_MAX_AGE_DAYS = 30;

// ─── Password Hashing ────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

// ─── Session Management ──────────────────────────────

export async function createSession(userId: string) {
	const token = randomUUID();
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + SESSION_MAX_AGE_DAYS);

	const session = await db.session.create({
		data: {
			userId,
			token,
			expiresAt
		}
	});

	return session;
}

export async function validateSession(token: string) {
	const session = await db.session.findUnique({
		where: { token },
		include: {
			user: {
				include: { tenant: true }
			}
		}
	});

	if (!session) return null;

	if (session.expiresAt < new Date()) {
		await db.session.delete({ where: { id: session.id } });
		return null;
	}

	return session;
}

export async function invalidateSession(token: string) {
	await db.session.delete({ where: { token } }).catch(() => {});
}

export async function invalidateAllUserSessions(userId: string) {
	await db.session.deleteMany({ where: { userId } });
}

// ─── Cookie Helpers ──────────────────────────────────

export function setSessionCookie(cookies: Cookies, token: string) {
	const isHttps = (process.env.ORIGIN ?? '').startsWith('https');
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: isHttps,
		maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60
	});
}

export function getSessionToken(cookies: Cookies): string | undefined {
	return cookies.get(SESSION_COOKIE);
}

export function deleteSessionCookie(cookies: Cookies) {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}
