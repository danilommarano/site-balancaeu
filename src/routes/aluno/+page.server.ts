import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user || user.role !== 'ALUNO') throw redirect(302, '/login');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw redirect(302, '/login');

	// Fetch subscription with plan, enrollments with class details, and attendance count
	const [subscription, enrollments, presencasMes, proximosEventos] = await Promise.all([
		db.subscription.findFirst({
			where: { userId: user.id, tenantId, status: 'ATIVA' },
			include: { plan: true },
			orderBy: { inicio: 'desc' }
		}),
		db.enrollment.findMany({
			where: { userId: user.id, tenantId, status: 'ATIVA' },
			include: {
				classGroup: {
					include: {
						modality: { select: { nome: true } },
						professor: { select: { nome: true } }
					}
				}
			}
		}),
		db.attendance.count({
			where: {
				userId: user.id,
				tenantId,
				presente: true,
				data: {
					gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
				}
			}
		}),
		db.event.findMany({
			where: { tenantId, ativo: true, data: { gte: new Date() } },
			orderBy: { data: 'asc' },
			take: 3
		})
	]);

	// Serialize Decimal and Date fields
	const planoAtual = subscription ? {
		nome: subscription.plan.nome,
		preco: Number(subscription.plan.preco),
		maxAulasSemana: subscription.plan.maxAulasSemana,
		permiteParticular: subscription.plan.permiteParticular,
		status: subscription.status,
		inicio: subscription.inicio.toISOString(),
		fim: subscription.fim?.toISOString() ?? null
	} : null;

	const turmas = enrollments.map(e => ({
		id: e.classGroup.id,
		modalidade: e.classGroup.modality.nome,
		professor: e.classGroup.professor.nome,
		nivel: e.classGroup.nivel,
		diaSemana: e.classGroup.diaSemana,
		horarioInicio: e.classGroup.horarioInicio,
		horarioFim: e.classGroup.horarioFim,
		sala: e.classGroup.sala
	}));

	const eventos = proximosEventos.map(e => ({
		id: e.id,
		titulo: e.titulo,
		data: e.data.toISOString(),
		horario: e.horario,
		local: e.local,
		preco: e.preco ? Number(e.preco) : null
	}));

	return {
		planoAtual,
		turmas,
		presencasMes,
		eventos,
		totalTurmas: enrollments.length
	};
};
