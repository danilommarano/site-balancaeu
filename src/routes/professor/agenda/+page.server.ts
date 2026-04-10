import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

const diasOrdem = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
const diasLabels: Record<string, string> = {
	SEG: 'Segunda', TER: 'Terça', QUA: 'Quarta', QUI: 'Quinta',
	SEX: 'Sexta', SAB: 'Sábado', DOM: 'Domingo'
};

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user || user.role !== 'PROFESSOR') throw redirect(302, '/login');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw redirect(302, '/login');

	// ─── Turmas regulares do professor ───────────────
	const turmas = await db.classGroup.findMany({
		where: { tenantId, professorId: user.id, ativo: true },
		orderBy: [{ diaSemana: 'asc' }, { horarioInicio: 'asc' }],
		include: {
			modality: { select: { nome: true } },
			_count: {
				select: { enrollments: { where: { status: 'ATIVA' } } }
			}
		}
	});

	// ─── Particulares da semana ──────────────────────
	const hoje = new Date();
	const inicioSemana = new Date(hoje);
	inicioSemana.setDate(hoje.getDate() - hoje.getDay() + 1); // Monday
	inicioSemana.setHours(0, 0, 0, 0);
	const fimSemana = new Date(inicioSemana);
	fimSemana.setDate(inicioSemana.getDate() + 6);
	fimSemana.setHours(23, 59, 59, 999);

	const particulares = await db.privateLesson.findMany({
		where: {
			tenantId,
			professorId: user.id,
			dataHora: { gte: inicioSemana, lte: fimSemana },
			status: { in: ['AGENDADA', 'CONFIRMADA'] }
		},
		include: {
			user: { select: { nome: true } },
			modality: { select: { nome: true } }
		},
		orderBy: { dataHora: 'asc' }
	});

	// Build agenda per day
	const agenda = diasOrdem.map(dia => {
		const turmasDia = turmas
			.filter(t => t.diaSemana === dia)
			.map(t => ({
				id: t.id,
				tipo: 'turma' as const,
				modalidade: t.modality.nome,
				nivel: t.nivel,
				horarioInicio: t.horarioInicio,
				horarioFim: t.horarioFim,
				sala: t.sala,
				totalAlunos: t._count.enrollments
			}));

		// Map particulares to their day of week
		const particularesDia = particulares
			.filter(p => {
				const d = new Date(p.dataHora);
				const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=Mon
				return diasOrdem[dayIdx] === dia;
			})
			.map(p => ({
				id: p.id,
				tipo: 'particular' as const,
				modalidade: p.modality.nome,
				aluno: p.user.nome,
				horarioInicio: new Date(p.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
				horarioFim: (() => {
					const fim = new Date(p.dataHora);
					fim.setMinutes(fim.getMinutes() + p.duracao);
					return fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
				})(),
				duracao: p.duracao,
				status: p.status
			}));

		return {
			dia,
			label: diasLabels[dia],
			items: [...turmasDia, ...particularesDia].sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio))
		};
	});

	return {
		agenda,
		semana: `${inicioSemana.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${fimSemana.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`
	};
};
