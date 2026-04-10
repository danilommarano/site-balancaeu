import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user || user.role !== 'PROFESSOR') throw redirect(302, '/login');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw redirect(302, '/login');

	// Get teacher profile
	const teacher = await db.teacher.findUnique({
		where: { userId: user.id },
		include: {
			modalities: { select: { id: true, nome: true } },
			availabilities: { orderBy: [{ diaSemana: 'asc' }, { horarioInicio: 'asc' }] }
		}
	});

	// Get user details
	const userData = await db.user.findUnique({
		where: { id: user.id },
		select: { nome: true, email: true, telefone: true, avatarUrl: true }
	});

	return {
		perfil: {
			nome: userData?.nome ?? '',
			email: userData?.email ?? '',
			telefone: userData?.telefone ?? '',
			avatarUrl: userData?.avatarUrl ?? '',
			bio: teacher?.bio ?? '',
			especialidades: teacher?.especialidades ?? [],
			imagemUrl: teacher?.imagemUrl ?? ''
		},
		modalidades: teacher?.modalities?.map(m => m.nome) ?? [],
		totalDisponibilidades: teacher?.availabilities?.length ?? 0
	};
};

export const actions: Actions = {
	salvar: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'PROFESSOR') return fail(401, { error: 'Não autenticado' });

		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const nome = fd.get('nome')?.toString()?.trim();
		const telefone = fd.get('telefone')?.toString()?.trim() || null;
		const bio = fd.get('bio')?.toString()?.trim() || '';
		const especialidadesStr = fd.get('especialidades')?.toString()?.trim() || '';

		if (!nome || nome.length < 2) {
			return fail(400, { error: 'O nome deve ter pelo menos 2 caracteres.' });
		}

		const especialidades = especialidadesStr
			.split(',')
			.map(s => s.trim())
			.filter(s => s.length > 0);

		// Update user
		await db.user.update({
			where: { id: user.id },
			data: { nome, telefone }
		});

		// Update teacher profile 
		const teacher = await db.teacher.findUnique({ where: { userId: user.id } });
		if (teacher) {
			await db.teacher.update({
				where: { id: teacher.id },
				data: { bio, especialidades }
			});
		}

		return { success: true, message: 'Perfil atualizado com sucesso!' };
	}
};
