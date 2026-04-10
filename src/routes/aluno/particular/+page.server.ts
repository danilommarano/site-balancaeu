import { db } from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user || user.role !== 'ALUNO') throw redirect(302, '/login');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw redirect(302, '/login');

	const [assinatura, professores, minhasAulas] = await Promise.all([
		db.subscription.findFirst({
			where: { userId: user.id, tenantId, status: 'ATIVA' },
			include: { plan: true }
		}),
		db.teacher.findMany({
			where: { tenantId, user: { ativo: true } },
			include: {
				user: { select: { id: true, nome: true } },
				modalities: { select: { id: true, nome: true } },
				availabilities: { orderBy: [{ diaSemana: 'asc' }, { horarioInicio: 'asc' }] }
			}
		}),
		db.privateLesson.findMany({
			where: { userId: user.id, tenantId },
			include: {
				professor: { select: { nome: true } },
				modality: { select: { nome: true } }
			},
			orderBy: { dataHora: 'desc' },
			take: 20
		})
	]);

	const permiteParticular = assinatura?.plan.permiteParticular ?? false;

	return {
		temPlano: !!assinatura,
		permiteParticular,
		professores: professores
			.filter(p => p.availabilities.length > 0)
			.map(p => ({
				userId: p.user.id,
				nome: p.user.nome,
				modalidades: p.modalities,
				disponibilidades: p.availabilities.map(a => ({
					diaSemana: a.diaSemana,
					horarioInicio: a.horarioInicio,
					horarioFim: a.horarioFim
				}))
			})),
		minhasAulas: minhasAulas.map(a => ({
			id: a.id,
			professor: a.professor.nome,
			modalidade: a.modality.nome,
			dataHora: a.dataHora.toISOString(),
			duracao: a.duracao,
			status: a.status,
			observacao: a.observacao,
			createdAt: a.createdAt.toISOString()
		}))
	};
};

export const actions: Actions = {
	agendar: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'ALUNO') return fail(401, { error: 'Não autenticado' });

		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const professorId = fd.get('professorId')?.toString();
		const modalityId = fd.get('modalityId')?.toString();
		const dataStr = fd.get('data')?.toString();
		const horario = fd.get('horario')?.toString();
		const duracao = parseInt(fd.get('duracao')?.toString() ?? '60');
		const observacao = fd.get('observacao')?.toString() || null;

		if (!professorId || !modalityId || !dataStr || !horario) {
			return fail(400, { error: 'Preencha todos os campos obrigatórios.' });
		}

		// 1. Check active subscription with permiteParticular
		const assinatura = await db.subscription.findFirst({
			where: { userId: user.id, tenantId, status: 'ATIVA' },
			include: { plan: true }
		});
		if (!assinatura) {
			return fail(400, { error: 'Você precisa ter um plano ativo.' });
		}
		if (!assinatura.plan.permiteParticular) {
			return fail(400, { error: 'Seu plano não inclui aulas particulares. Faça upgrade para um plano que permita.' });
		}

		// 2. Validate date is in the future
		const dataHora = new Date(`${dataStr}T${horario}:00`);
		if (isNaN(dataHora.getTime())) {
			return fail(400, { error: 'Data/hora inválida.' });
		}
		if (dataHora <= new Date()) {
			return fail(400, { error: 'A data/hora deve ser no futuro.' });
		}

		// 3. Check professor exists and has teacher profile
		const teacher = await db.teacher.findFirst({
			where: { userId: professorId, tenantId },
			include: { availabilities: true }
		});
		if (!teacher) {
			return fail(400, { error: 'Professor não encontrado.' });
		}

		// 4. Check professor availability for that day/time
		const diasSemana: Record<number, string> = {
			0: 'DOM', 1: 'SEG', 2: 'TER', 3: 'QUA', 4: 'QUI', 5: 'SEX', 6: 'SAB'
		};
		const diaSemana = diasSemana[dataHora.getDay()];
		const horaStr = horario;

		const slotDisponivel = teacher.availabilities.find(a =>
			a.diaSemana === diaSemana && a.horarioInicio <= horaStr && a.horarioFim > horaStr
		);
		if (!slotDisponivel) {
			return fail(400, { error: 'O professor não tem disponibilidade nesse dia/horário.' });
		}

		// 5. Check for conflicting lessons for the professor at that time
		const inicioAula = dataHora;
		const fimAula = new Date(dataHora.getTime() + duracao * 60000);

		const conflitoProfessor = await db.privateLesson.findFirst({
			where: {
				professorId,
				tenantId,
				status: { in: ['AGENDADA', 'CONFIRMADA'] },
				dataHora: { gte: new Date(inicioAula.getTime() - duracao * 60000), lt: fimAula }
			}
		});
		if (conflitoProfessor) {
			return fail(400, { error: 'O professor já tem uma aula agendada nesse horário.' });
		}

		// 6. Check for conflicting lessons for the student
		const conflitoAluno = await db.privateLesson.findFirst({
			where: {
				userId: user.id,
				tenantId,
				status: { in: ['AGENDADA', 'CONFIRMADA'] },
				dataHora: { gte: new Date(inicioAula.getTime() - duracao * 60000), lt: fimAula }
			}
		});
		if (conflitoAluno) {
			return fail(400, { error: 'Você já tem uma aula agendada nesse horário.' });
		}

		// 7. Create private lesson
		await db.privateLesson.create({
			data: {
				tenantId,
				userId: user.id,
				professorId,
				modalityId,
				dataHora,
				duracao,
				observacao,
				status: 'AGENDADA'
			}
		});

		return { success: true, message: 'Aula agendada! Aguarde a confirmação do professor.' };
	},

	cancelar: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'ALUNO') return fail(401, { error: 'Não autenticado' });

		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID não informado.' });

		const lesson = await db.privateLesson.findFirst({
			where: { id, userId: user.id, tenantId, status: { in: ['AGENDADA', 'CONFIRMADA'] } }
		});
		if (!lesson) return fail(400, { error: 'Aula não encontrada ou já processada.' });

		// Check 24h minimum cancellation policy
		const horasAteAula = (lesson.dataHora.getTime() - Date.now()) / (1000 * 60 * 60);
		if (lesson.status === 'CONFIRMADA' && horasAteAula < 24) {
			return fail(400, {
				error: 'Não é possível cancelar com menos de 24 horas de antecedência para aulas confirmadas.'
			});
		}

		await db.privateLesson.update({
			where: { id },
			data: { status: 'CANCELADA' }
		});

		return { success: true, message: 'Aula cancelada com sucesso.' };
	}
};
