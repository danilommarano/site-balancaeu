// ===========================================
// BalancaEu — Fluxo de onboarding (/comecar)
// ===========================================
// Carrega modalidades + turmas. Ação final cria usuário + sessão + placements.

import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { hashPassword, createSession, setSessionCookie } from '$lib/server/auth';
import { sendEmail } from '$lib/server/email';
import { welcomeEmail } from '$lib/server/email/templates';

const DAY_MAP: Record<string, number> = {
	DOM: 0, SEG: 1, TER: 2, QUA: 3, QUI: 4, SEX: 5, SAB: 6
};

function nextOccurrence(diaSemana: string, horario: string): Date {
	const today = new Date();
	const target = DAY_MAP[diaSemana];
	const current = today.getDay();
	let daysAhead = (target - current + 7) % 7;
	if (daysAhead === 0) daysAhead = 7; // sempre próxima ocorrência
	const result = new Date(today);
	result.setDate(today.getDate() + daysAhead);
	const [h, m] = horario.split(':').map(Number);
	result.setHours(h, m, 0, 0);
	return result;
}

export const load: PageServerLoad = async ({ locals }) => {
	// Se já está logado, manda pro dashboard
	if (locals.user) {
		const role = locals.user.role;
		if (role === 'ADMIN') throw redirect(303, '/admin');
		if (role === 'PROFESSOR') throw redirect(303, '/professor');
		throw redirect(303, '/aluno');
	}

	const tenantId = locals.tenant?.id;
	if (!tenantId) {
		return { modalidades: [], turmas: [] };
	}

	const [modalidades, turmas] = await Promise.all([
		db.modality.findMany({
			where: { tenantId, ativo: true },
			orderBy: { nome: 'asc' }
		}),
		db.classGroup.findMany({
			where: { tenantId, ativo: true },
			orderBy: [{ diaSemana: 'asc' }, { horarioInicio: 'asc' }],
			include: {
				modality: { select: { id: true, nome: true } },
				professor: { select: { nome: true } }
			}
		})
	]);

	return { modalidades, turmas };
};

export const actions: Actions = {
	signup: async ({ request, cookies, locals }) => {
		const data = await request.formData();
		const nome = data.get('nome')?.toString().trim();
		const email = data.get('email')?.toString().trim().toLowerCase();
		const password = data.get('password')?.toString();
		const passwordConfirm = data.get('passwordConfirm')?.toString();
		const placementsJson = data.get('placements')?.toString() ?? '[]';

		if (!nome || !email || !password || !passwordConfirm) {
			return fail(400, { error: 'Todos os campos são obrigatórios', nome, email });
		}
		if (password.length < 6) {
			return fail(400, { error: 'A senha deve ter no mínimo 6 caracteres', nome, email });
		}
		if (password !== passwordConfirm) {
			return fail(400, { error: 'As senhas não coincidem', nome, email });
		}

		const tenantId = locals.tenant?.id;
		if (!tenantId) {
			return fail(400, { error: 'Escola não encontrada', nome, email });
		}

		const existing = await db.user.findUnique({
			where: { tenantId_email: { tenantId, email } }
		});
		if (existing) {
			return fail(400, { error: 'Este email já está cadastrado', nome, email });
		}

		// Parse placements: [{ classGroupId: string }, ...]
		let placementIds: string[] = [];
		try {
			const parsed = JSON.parse(placementsJson);
			if (Array.isArray(parsed)) {
				placementIds = parsed
					.map((p: unknown) => (typeof p === 'string' ? p : (p as { classGroupId?: string })?.classGroupId))
					.filter((v): v is string => typeof v === 'string' && v.length > 0);
			}
		} catch {
			// fallback: sem placements
		}

		// Valida que as turmas pertencem ao tenant
		const turmas = placementIds.length > 0
			? await db.classGroup.findMany({
					where: { id: { in: placementIds }, tenantId, ativo: true },
					select: { id: true, diaSemana: true, horarioInicio: true }
				})
			: [];

		const senhaHash = await hashPassword(password);

		const user = await db.user.create({
			data: {
				tenantId,
				nome,
				email,
				senhaHash,
				role: 'ALUNO'
			}
		});

		// Cria PlacementBookings em batch
		if (turmas.length > 0) {
			await db.placementBooking.createMany({
				data: turmas.map(t => ({
					tenantId,
					userId: user.id,
					classGroupId: t.id,
					dataHora: nextOccurrence(t.diaSemana, t.horarioInicio)
				}))
			});
		}

		// Email de boas-vindas (async)
		const schoolName = locals.tenant?.nome ?? 'BalancaEu';
		sendEmail({
			to: email,
			subject: `Bem-vindo(a) à ${schoolName}! 🎉`,
			html: welcomeEmail(nome, schoolName)
		}).catch(err => console.error('Erro ao enviar email de boas-vindas:', err));

		const session = await createSession(user.id);
		setSessionCookie(cookies, session.token);

		throw redirect(303, '/aluno?welcome=1');
	}
};
