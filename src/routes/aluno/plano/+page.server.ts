import { db } from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user || user.role !== 'ALUNO') throw redirect(302, '/login');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw redirect(302, '/login');

	const agora = new Date();
	const [assinaturaAtiva, historicoAssinaturas, planosDisponiveis] = await Promise.all([
		db.subscription.findFirst({
			where: { userId: user.id, tenantId, status: 'ATIVA', inicio: { lte: agora } },
			include: { plan: true },
			orderBy: { inicio: 'desc' }
		}),
		db.subscription.findMany({
			where: { userId: user.id, tenantId },
			include: { plan: { select: { nome: true } } },
			orderBy: { inicio: 'desc' }
		}),
		db.plan.findMany({
			where: { tenantId, ativo: true },
			orderBy: { preco: 'asc' }
		})
	]);

	return {
		assinaturaAtiva: assinaturaAtiva ? {
			id: assinaturaAtiva.id,
			planId: assinaturaAtiva.planId,
			status: assinaturaAtiva.status,
			inicio: assinaturaAtiva.inicio.toISOString(),
			fim: assinaturaAtiva.fim?.toISOString() ?? null,
			createdAt: assinaturaAtiva.createdAt.toISOString(),
			plano: {
				id: assinaturaAtiva.plan.id,
				nome: assinaturaAtiva.plan.nome,
				descricao: assinaturaAtiva.plan.descricao,
				preco: Number(assinaturaAtiva.plan.preco),
				maxAulasSemana: assinaturaAtiva.plan.maxAulasSemana,
				permiteParticular: assinaturaAtiva.plan.permiteParticular
			}
		} : null,
		historico: historicoAssinaturas.map(s => ({
			id: s.id,
			plano: s.plan.nome,
			status: s.status,
			inicio: s.inicio.toISOString(),
			fim: s.fim?.toISOString() ?? null,
			createdAt: s.createdAt.toISOString()
		})),
		planos: planosDisponiveis.map(p => ({
			id: p.id,
			nome: p.nome,
			descricao: p.descricao,
			preco: Number(p.preco),
			maxAulasSemana: p.maxAulasSemana,
			permiteParticular: p.permiteParticular
		}))
	};
};

// Calculate pro-rata: days remaining in current 30-day cycle
function calcProRata(inicio: Date, precoAtual: number, precoNovo: number): { credito: number; cobranca: number; diasRestantes: number } {
	const agora = new Date();
	const diffMs = agora.getTime() - inicio.getTime();
	const diasUsados = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const ciclo = 30;
	const diasRestantes = Math.max(ciclo - (diasUsados % ciclo), 0);
	const fracaoRestante = diasRestantes / ciclo;
	const credito = Math.round(precoAtual * fracaoRestante * 100) / 100;
	const cobranca = Math.round(precoNovo * fracaoRestante * 100) / 100;
	return { credito, cobranca, diasRestantes };
}

// Helper: find the real current subscription (the one the user is actively using now)
async function getCurrentSubscription(userId: string, tenantId: string) {
	// Get all ATIVA subscriptions, ordered by inicio desc
	const subs = await db.subscription.findMany({
		where: { userId, tenantId, status: 'ATIVA' },
		include: { plan: true },
		orderBy: { inicio: 'desc' }
	});
	if (subs.length === 0) return null;
	// The "current" is the one whose inicio <= now; if none, use earliest
	const agora = new Date();
	const current = subs.find(s => s.inicio <= agora) ?? subs[subs.length - 1];
	return current;
}

export const actions: Actions = {
	trocar: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'ALUNO') return fail(401, { error: 'Não autenticado' });

		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const planId = fd.get('planId')?.toString();
		if (!planId) return fail(400, { error: 'Plano não informado.' });

		// Get current subscription (the one actually in use now)
		const subAtual = await getCurrentSubscription(user.id, tenantId);
		if (!subAtual) {
			return fail(400, { error: 'Você não possui assinatura ativa.' });
		}

		if (subAtual.planId === planId) {
			return fail(400, { error: 'Você já está neste plano.' });
		}

		// Get target plan
		const novoPlano = await db.plan.findFirst({
			where: { id: planId, tenantId, ativo: true }
		});
		if (!novoPlano) return fail(400, { error: 'Plano não encontrado.' });

		const precoAtual = Number(subAtual.plan.preco);
		const precoNovo = Number(novoPlano.preco);
		const isUpgrade = precoNovo > precoAtual;

		// For downgrade: check active enrollments vs new plan limit
		if (!isUpgrade) {
			const inscricoesAtivas = await db.enrollment.count({
				where: { userId: user.id, tenantId, status: 'ATIVA' }
			});
			if (inscricoesAtivas > novoPlano.maxAulasSemana) {
				return fail(400, {
					error: `Você possui ${inscricoesAtivas} inscrição(ões) ativa(s), mas o plano "${novoPlano.nome}" permite apenas ${novoPlano.maxAulasSemana}. Cancele algumas turmas antes de fazer downgrade.`
				});
			}
		}

		const agora = new Date();

		// Cancel ALL active subs for this user (clean up any scheduled ones too)
		await db.subscription.updateMany({
			where: { userId: user.id, tenantId, status: 'ATIVA' },
			data: { status: 'CANCELADA', fim: agora }
		});

		// Create new subscription (immediate effect for both upgrade and downgrade)
		await db.subscription.create({
			data: {
				tenantId,
				userId: user.id,
				planId: novoPlano.id,
				status: 'ATIVA',
				inicio: agora
			}
		});

		// Calculate pro-rata and register transaction
		const { credito, cobranca, diasRestantes } = calcProRata(subAtual.inicio, precoAtual, precoNovo);

		if (isUpgrade) {
			const valorAjuste = Math.round((cobranca - credito) * 100) / 100;
			if (valorAjuste > 0) {
				await db.transaction.create({
					data: {
						tenantId,
						userId: user.id,
						tipo: 'MENSALIDADE',
						valor: valorAjuste,
						descricao: `Upgrade: ${subAtual.plan.nome} → ${novoPlano.nome} (pro-rata ${diasRestantes} dias)`,
						data: agora,
						status: 'PENDENTE'
					}
				});
			}
			return {
				success: true,
				message: `Upgrade para "${novoPlano.nome}" realizado! ${valorAjuste > 0 ? `Ajuste pro-rata: R$ ${valorAjuste.toFixed(2)}` : ''}`
			};
		} else {
			const creditoRestante = Math.round((credito - cobranca) * 100) / 100;
			if (creditoRestante > 0) {
				await db.transaction.create({
					data: {
						tenantId,
						userId: user.id,
						tipo: 'MENSALIDADE',
						valor: -creditoRestante,
						descricao: `Downgrade: ${subAtual.plan.nome} → ${novoPlano.nome} (crédito pro-rata ${diasRestantes} dias)`,
						data: agora,
						status: 'PENDENTE'
					}
				});
			}
			return {
				success: true,
				message: `Downgrade para "${novoPlano.nome}" realizado! ${creditoRestante > 0 ? `Crédito pro-rata: R$ ${creditoRestante.toFixed(2)}` : ''}`
			};
		}
	},

	cancelar: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'ALUNO') return fail(401, { error: 'Não autenticado' });

		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const subscriptionId = fd.get('subscriptionId')?.toString();
		if (!subscriptionId) return fail(400, { error: 'Assinatura não informada.' });

		const sub = await db.subscription.findFirst({
			where: { id: subscriptionId, userId: user.id, tenantId, status: 'ATIVA' },
			include: { plan: true }
		});
		if (!sub) return fail(400, { error: 'Assinatura não encontrada ou já cancelada.' });

		// Also cancel any other ATIVA subs (e.g. scheduled downgrades)
		await db.subscription.updateMany({
			where: { userId: user.id, tenantId, status: 'ATIVA', id: { not: sub.id } },
			data: { status: 'CANCELADA', fim: new Date() }
		});

		// Calculate remaining credit
		const { credito, diasRestantes } = calcProRata(sub.inicio, Number(sub.plan.preco), 0);
		const agora = new Date();

		// Cancel the subscription
		await db.subscription.update({
			where: { id: sub.id },
			data: { status: 'CANCELADA', fim: agora }
		});

		// Cancel all active enrollments
		await db.enrollment.updateMany({
			where: { userId: user.id, tenantId, status: 'ATIVA' },
			data: { status: 'CANCELADA' }
		});

		// Register credit transaction if applicable
		if (credito > 0) {
			await db.transaction.create({
				data: {
					tenantId,
					userId: user.id,
					tipo: 'MENSALIDADE',
					valor: -credito,
					descricao: `Cancelamento: ${sub.plan.nome} (crédito pro-rata ${diasRestantes} dias)`,
					data: agora,
					status: 'PENDENTE'
				}
			});
		}

		return {
			success: true,
			message: `Assinatura cancelada. ${credito > 0 ? `Crédito de R$ ${credito.toFixed(2)} registrado.` : ''} Suas inscrições em turmas foram canceladas.`
		};
	},

	assinar: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'ALUNO') return fail(401, { error: 'Não autenticado' });

		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const planId = fd.get('planId')?.toString();
		if (!planId) return fail(400, { error: 'Plano não informado.' });

		// Check no active subscription
		const subAtual = await db.subscription.findFirst({
			where: { userId: user.id, tenantId, status: 'ATIVA' }
		});
		if (subAtual) {
			return fail(400, { error: 'Você já possui uma assinatura ativa.' });
		}

		const plano = await db.plan.findFirst({
			where: { id: planId, tenantId, ativo: true }
		});
		if (!plano) return fail(400, { error: 'Plano não encontrado.' });

		const agora = new Date();

		await db.subscription.create({
			data: {
				tenantId,
				userId: user.id,
				planId: plano.id,
				status: 'ATIVA',
				inicio: agora
			}
		});

		await db.transaction.create({
			data: {
				tenantId,
				userId: user.id,
				tipo: 'MENSALIDADE',
				valor: Number(plano.preco),
				descricao: `Assinatura: ${plano.nome}`,
				data: agora,
				status: 'PENDENTE'
			}
		});

		return { success: true, message: `Assinatura do plano "${plano.nome}" realizada com sucesso!` };
	}
};
