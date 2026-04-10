import { db } from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { sendEmail } from '$lib/server/email';
import { lessonConfirmationEmail } from '$lib/server/email/templates';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user || user.role !== 'PROFESSOR') throw redirect(302, '/login');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw redirect(302, '/login');

	const lessons = await db.privateLesson.findMany({
		where: { professorId: user.id, tenantId },
		include: {
			user: { select: { nome: true, email: true } },
			modality: { select: { nome: true } }
		},
		orderBy: { dataHora: 'desc' }
	});

	return {
		aulas: lessons.map(l => ({
			id: l.id,
			aluno: { nome: l.user.nome, email: l.user.email },
			modalidade: l.modality.nome,
			dataHora: l.dataHora.toISOString(),
			duracao: l.duracao,
			status: l.status,
			observacao: l.observacao,
			createdAt: l.createdAt.toISOString()
		}))
	};
};

export const actions: Actions = {
	confirmar: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'PROFESSOR') return fail(401, { error: 'Não autenticado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID não informado.' });

		const lesson = await db.privateLesson.findFirst({
			where: { id, professorId: user.id, status: 'AGENDADA' },
			include: {
				user: { select: { nome: true, email: true } },
				modality: { select: { nome: true } }
			}
		});
		if (!lesson) return fail(400, { error: 'Aula não encontrada ou já processada.' });

		await db.privateLesson.update({
			where: { id },
			data: { status: 'CONFIRMADA' }
		});

		// Enviar email de confirmação ao aluno
		const dataFormatada = lesson.dataHora.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
		const horario = lesson.dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
		const schoolName = locals.tenant?.nome ?? 'Pulso';

		sendEmail({
			to: lesson.user.email,
			subject: `Aula particular confirmada — ${lesson.modality.nome}`,
			html: lessonConfirmationEmail(
				lesson.user.nome,
				user.nome,
				dataFormatada,
				horario,
				lesson.modality.nome,
				schoolName
			)
		}).catch(err => console.error('Erro ao enviar email de confirmação:', err));

		return { success: true, message: 'Aula confirmada!' };
	},

	recusar: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'PROFESSOR') return fail(401, { error: 'Não autenticado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID não informado.' });

		const lesson = await db.privateLesson.findFirst({
			where: { id, professorId: user.id, status: 'AGENDADA' }
		});
		if (!lesson) return fail(400, { error: 'Aula não encontrada ou já processada.' });

		await db.privateLesson.update({
			where: { id },
			data: { status: 'CANCELADA' }
		});

		return { success: true, message: 'Aula recusada.' };
	},

	concluir: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'PROFESSOR') return fail(401, { error: 'Não autenticado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		if (!id) return fail(400, { error: 'ID não informado.' });

		const lesson = await db.privateLesson.findFirst({
			where: { id, professorId: user.id, status: 'CONFIRMADA' }
		});
		if (!lesson) return fail(400, { error: 'Aula não encontrada ou não confirmada.' });

		await db.privateLesson.update({
			where: { id },
			data: { status: 'CONCLUIDA' }
		});

		return { success: true, message: 'Aula marcada como concluída.' };
	}
};
