// ===========================================
// Pulso — Tipos globais do SvelteKit
// ===========================================

import type { Tenant, User } from '@prisma/client';

declare global {
	namespace App {
		interface Locals {
			user: (User & { tenant: Tenant }) | null;
			tenant: Tenant | null;
		}

		interface Error {
			message: string;
			code?: string;
		}

		interface PageData {
			user: (User & { tenant: Tenant }) | null;
			tenant: Tenant | null;
		}
	}
}

export {};
