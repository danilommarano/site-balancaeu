import { db } from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user || user.role !== 'PROFESSOR') throw redirect(302, '/login');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw redirect(302, '/login');

	const teacher = await db.teacher.findUnique({
		where: { userId: user.id },
		include: {
			availabilities: { orderBy: [{ diaSemana: 'asc' }, { horarioInicio: 'asc' }] }
		}
	});

	if (!teacher) throw redirect(302, '/professor');

	return {
		disponibilidades: teacher.availabilities.map(a => ({
			id: a.id,
			diaSemana: a.diaSemana,
			horarioInicio: a.horarioInicio,
			horarioFim: a.horarioFim
		}))
	};
};

export const actions: Actions = {
	adicionar: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'PROFESSOR') return fail(401, { error: 'Não autenticado' });

		const teacher = await db.teacher.findUnique({ where: { userId: user.id } });
		if (!teacher) return fail(400, { error: 'Perfil de professor não encontrado.' });

		const fd = await request.formData();
		const diaSemana = fd.get('diaSemana')?.toString();
		const horarioInicio = fd.get('horarioInicio')?.toString();
		const horarioFim = fd.get('horarioFim')?.toString();

		if (!diaSemana || !horarioInicio || !horarioFim) {
			return fail(400, { error: 'Preencha todos os campos.' });
		}

		if (horarioInicio >= horarioFim) {
			return fail(400, { error: 'O horário de início deve ser anterior ao horário de fim.' });
		}

		// Check overlap with existing availabilities
		const existing = await db.teacherAvailability.findMany({
			where: { teacherId: teacher.id, diaSemana: diaSemana as any }
		});

		const overlap = existing.find(a =>
			a.horarioInicio < horarioFim && a.horarioFim > horarioInicio
		);

		if (overlap) {
			return fail(400, {
				error: `Conflito com disponibilidade existente (${overlap.horarioInicio}–${overlap.horarioFim}).`
			});
		}

		await db.teacherAvailability.create({
			data: {
				teacherId: teacher.id,
				diaSemana: diaSemana as any,
				horarioInicio,
				horarioFim
			}
		});

		return { success: true, message: 'Disponibilidade adicionada!' };
	},

	remover: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'PROFESSOR') return fail(401, { error: 'Não autenticado' });

		const teacher = await db.teacher.findUnique({ where: { userId: user.id } });
		if (!teacher) return fail(400, { error: 'Perfil de professor não encontrado.' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID não informado.' });

		const avail = await db.teacherAvailability.findFirst({
			where: { id, teacherId: teacher.id }
		});
		if (!avail) return fail(400, { error: 'Disponibilidade não encontrada.' });

		await db.teacherAvailability.delete({ where: { id } });

		return { success: true, message: 'Disponibilidade removida.' };
	}
};
