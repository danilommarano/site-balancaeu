import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { isValidTime } from '$lib/server/validation';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) return { turmas: [], modalidades: [], professores: [] };

	const [turmas, modalidades, professores] = await Promise.all([
		db.classGroup.findMany({
			where: { tenantId },
			orderBy: [{ diaSemana: 'asc' }, { horarioInicio: 'asc' }],
			include: {
				modality: { select: { nome: true } },
				professor: { select: { nome: true } },
				_count: { select: { enrollments: { where: { status: { in: ['ATIVA', 'LISTA_ESPERA'] } } } } }
			}
		}),
		db.modality.findMany({
			where: { tenantId, ativo: true },
			orderBy: { nome: 'asc' },
			select: { id: true, nome: true }
		}),
		db.user.findMany({
			where: { tenantId, role: 'PROFESSOR', ativo: true },
			orderBy: { nome: 'asc' },
			select: { id: true, nome: true }
		})
	]);

	return { turmas, modalidades, professores };
};

const diasValidos = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'] as const;

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const modalityId = fd.get('modalityId')?.toString();
		const professorId = fd.get('professorId')?.toString();
		const nivel = fd.get('nivel')?.toString().trim();
		const diaSemana = fd.get('diaSemana')?.toString() as typeof diasValidos[number];
		const horarioInicio = fd.get('horarioInicio')?.toString().trim();
		const horarioFim = fd.get('horarioFim')?.toString().trim();
		const sala = fd.get('sala')?.toString().trim();
		const maxAlunos = parseInt(fd.get('maxAlunos')?.toString() ?? '0');

		if (!modalityId || !professorId || !nivel || !diaSemana || !horarioInicio || !horarioFim || !sala || !maxAlunos) {
			return fail(400, { error: 'Todos os campos são obrigatórios' });
		}

		if (!diasValidos.includes(diaSemana)) {
			return fail(400, { error: 'Dia da semana inválido' });
		}

		if (!isValidTime(horarioInicio) || !isValidTime(horarioFim)) {
			return fail(400, { error: 'Formato de horário inválido (use HH:MM)' });
		}

		if (horarioInicio >= horarioFim) {
			return fail(400, { error: 'Horário de início deve ser anterior ao de fim' });
		}

		if (maxAlunos < 1 || maxAlunos > 200) {
			return fail(400, { error: 'Máximo de alunos deve ser entre 1 e 200' });
		}

		await db.classGroup.create({
			data: { tenantId, modalityId, professorId, nivel, diaSemana, horarioInicio, horarioFim, sala, maxAlunos }
		});

		return { success: true };
	},

	update: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		const modalityId = fd.get('modalityId')?.toString();
		const professorId = fd.get('professorId')?.toString();
		const nivel = fd.get('nivel')?.toString().trim();
		const diaSemana = fd.get('diaSemana')?.toString() as typeof diasValidos[number];
		const horarioInicio = fd.get('horarioInicio')?.toString().trim();
		const horarioFim = fd.get('horarioFim')?.toString().trim();
		const sala = fd.get('sala')?.toString().trim();
		const maxAlunos = parseInt(fd.get('maxAlunos')?.toString() ?? '0');
		const ativo = fd.get('ativo') === 'true';

		if (!id || !modalityId || !professorId || !nivel || !diaSemana || !horarioInicio || !horarioFim || !sala) {
			return fail(400, { error: 'Campos obrigatórios faltando' });
		}

		if (!isValidTime(horarioInicio) || !isValidTime(horarioFim)) {
			return fail(400, { error: 'Formato de horário inválido (use HH:MM)' });
		}

		if (horarioInicio >= horarioFim) {
			return fail(400, { error: 'Horário de início deve ser anterior ao de fim' });
		}

		await db.classGroup.update({
			where: { id },
			data: { modalityId, professorId, nivel, diaSemana, horarioInicio, horarioFim, sala, maxAlunos, ativo }
		});

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID obrigatório' });

		const inscricoes = await db.enrollment.count({ where: { classGroupId: id, status: { in: ['ATIVA', 'LISTA_ESPERA'] } } });
		if (inscricoes > 0) {
			return fail(400, { error: `Não é possível excluir: ${inscricoes} inscrição(ões) ativa(s)` });
		}

		await db.classGroup.delete({ where: { id } });
		return { success: true };
	}
};
