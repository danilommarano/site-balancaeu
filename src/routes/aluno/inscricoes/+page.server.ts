import { db } from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user || user.role !== 'ALUNO') throw redirect(302, '/login');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw redirect(302, '/login');

	// Fetch enrollments, available classes, modalities, and subscription in parallel
	const [enrollments, turmasDisponiveis, modalidades, assinatura] = await Promise.all([
		db.enrollment.findMany({
			where: { userId: user.id, tenantId },
			include: {
				classGroup: {
					include: {
						modality: { select: { nome: true } },
						professor: { select: { nome: true } },
						_count: { select: { enrollments: { where: { status: { in: ['ATIVA', 'LISTA_ESPERA'] } } } } }
					}
				}
			},
			orderBy: { dataInscricao: 'desc' }
		}),
		db.classGroup.findMany({
			where: { tenantId, ativo: true },
			include: {
				modality: { select: { id: true, nome: true } },
				professor: { select: { nome: true } },
				_count: { select: { enrollments: { where: { status: { in: ['ATIVA', 'LISTA_ESPERA'] } } } } }
			},
			orderBy: [{ modality: { nome: 'asc' } }, { diaSemana: 'asc' }]
		}),
		db.modality.findMany({
			where: { tenantId, ativo: true },
			select: { id: true, nome: true },
			orderBy: { nome: 'asc' }
		}),
		db.subscription.findFirst({
			where: { userId: user.id, tenantId, status: 'ATIVA' },
			include: { plan: true },
			orderBy: { inicio: 'desc' }
		})
	]);

	// IDs of class groups user is already enrolled in (ATIVA or LISTA_ESPERA)
	const enrolledClassIds = new Set(
		enrollments
			.filter(e => e.status === 'ATIVA' || e.status === 'LISTA_ESPERA')
			.map(e => e.classGroupId)
	);

	return {
		inscricoes: enrollments.map(e => ({
			id: e.id,
			status: e.status,
			dataInscricao: e.dataInscricao.toISOString(),
			turma: {
				id: e.classGroup.id,
				modalidade: e.classGroup.modality.nome,
				professor: e.classGroup.professor.nome,
				nivel: e.classGroup.nivel,
				diaSemana: e.classGroup.diaSemana,
				horarioInicio: e.classGroup.horarioInicio,
				horarioFim: e.classGroup.horarioFim,
				sala: e.classGroup.sala,
				maxAlunos: e.classGroup.maxAlunos,
				inscritos: e.classGroup._count.enrollments
			}
		})),
		turmasDisponiveis: turmasDisponiveis.map(t => ({
			id: t.id,
			modalidadeId: t.modality.id,
			modalidade: t.modality.nome,
			professor: t.professor.nome,
			nivel: t.nivel,
			diaSemana: t.diaSemana,
			horarioInicio: t.horarioInicio,
			horarioFim: t.horarioFim,
			sala: t.sala,
			maxAlunos: t.maxAlunos,
			inscritos: t._count.enrollments,
			jaInscrito: enrolledClassIds.has(t.id)
		})),
		modalidades: modalidades,
		temPlano: !!assinatura,
		maxAulasSemana: assinatura?.plan.maxAulasSemana ?? 0,
		inscricoesAtivas: enrollments.filter(e => e.status === 'ATIVA').length
	};
};

export const actions: Actions = {
	inscrever: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'ALUNO') return fail(401, { error: 'Não autenticado' });

		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const classGroupId = fd.get('classGroupId')?.toString();
		if (!classGroupId) return fail(400, { error: 'Turma não informada' });

		// 1. Check active subscription
		const assinatura = await db.subscription.findFirst({
			where: { userId: user.id, tenantId, status: 'ATIVA' },
			include: { plan: true }
		});
		if (!assinatura) {
			return fail(400, { error: 'Você precisa ter um plano ativo para se inscrever em turmas.' });
		}

		// 2. Check class group exists and is active
		const turma = await db.classGroup.findFirst({
			where: { id: classGroupId, tenantId, ativo: true },
			include: {
				_count: { select: { enrollments: { where: { status: { in: ['ATIVA', 'LISTA_ESPERA'] } } } } }
			}
		});
		if (!turma) return fail(400, { error: 'Turma não encontrada ou inativa.' });

		// 3. Check if already enrolled
		const existingEnrollment = await db.enrollment.findUnique({
			where: { userId_classGroupId: { userId: user.id, classGroupId } }
		});
		if (existingEnrollment && existingEnrollment.status !== 'CANCELADA') {
			return fail(400, { error: 'Você já está inscrito nesta turma.' });
		}

		// 4. Check max aulas/semana from plan
		const inscricoesAtivas = await db.enrollment.count({
			where: { userId: user.id, tenantId, status: 'ATIVA' }
		});
		if (inscricoesAtivas >= assinatura.plan.maxAulasSemana) {
			return fail(400, {
				error: `Seu plano "${assinatura.plan.nome}" permite no máximo ${assinatura.plan.maxAulasSemana} aula(s) por semana. Faça upgrade para se inscrever em mais turmas.`
			});
		}

		// 5. Check schedule conflict (same day + overlapping time)
		const minhasInscricoes = await db.enrollment.findMany({
			where: { userId: user.id, tenantId, status: 'ATIVA' },
			include: { classGroup: true }
		});

		const conflito = minhasInscricoes.find(e => {
			const cg = e.classGroup;
			if (cg.diaSemana !== turma.diaSemana) return false;
			// Check time overlap: A starts before B ends AND A ends after B starts
			return cg.horarioInicio < turma.horarioFim && cg.horarioFim > turma.horarioInicio;
		});

		if (conflito) {
			return fail(400, {
				error: `Conflito de horário com sua turma "${conflito.classGroup.nivel}" (${conflito.classGroup.horarioInicio}–${conflito.classGroup.horarioFim}).`
			});
		}

		// 6. Determine status: ATIVA if vacancies, LISTA_ESPERA if full
		const vagasOcupadas = turma._count.enrollments;
		const status = vagasOcupadas >= turma.maxAlunos ? 'LISTA_ESPERA' : 'ATIVA';

		// 7. Create or update enrollment
		if (existingEnrollment) {
			// Re-activate cancelled enrollment
			await db.enrollment.update({
				where: { id: existingEnrollment.id },
				data: { status, dataInscricao: new Date() }
			});
		} else {
			await db.enrollment.create({
				data: {
					tenantId,
					userId: user.id,
					classGroupId,
					status
				}
			});
		}

		if (status === 'LISTA_ESPERA') {
			return { success: true, message: 'Turma lotada. Você foi adicionado à lista de espera.' };
		}
		return { success: true, message: 'Inscrição realizada com sucesso!' };
	},

	cancelar: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'ALUNO') return fail(401, { error: 'Não autenticado' });

		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const enrollmentId = fd.get('enrollmentId')?.toString();
		if (!enrollmentId) return fail(400, { error: 'Inscrição não informada' });

		const enrollment = await db.enrollment.findFirst({
			where: { id: enrollmentId, userId: user.id, tenantId }
		});
		if (!enrollment) return fail(400, { error: 'Inscrição não encontrada.' });
		if (enrollment.status === 'CANCELADA') {
			return fail(400, { error: 'Esta inscrição já está cancelada.' });
		}

		const wasFull = enrollment.status === 'ATIVA';

		// Cancel the enrollment
		await db.enrollment.update({
			where: { id: enrollmentId },
			data: { status: 'CANCELADA' }
		});

		// If the cancelled enrollment was ATIVA, promote first person in LISTA_ESPERA
		if (wasFull) {
			const nextInLine = await db.enrollment.findFirst({
				where: {
					classGroupId: enrollment.classGroupId,
					tenantId,
					status: 'LISTA_ESPERA'
				},
				orderBy: { dataInscricao: 'asc' }
			});
			if (nextInLine) {
				await db.enrollment.update({
					where: { id: nextInLine.id },
					data: { status: 'ATIVA' }
				});
			}
		}

		return { success: true, message: 'Inscrição cancelada com sucesso.' };
	}
};
