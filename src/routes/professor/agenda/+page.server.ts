import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';

const diasOrdem = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'] as const;
type Dia = typeof diasOrdem[number];

function dataParaDia(d: Date): Dia {
	return diasOrdem[d.getDay()];
}

function hhmm(d: Date): string {
	return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function addMinutes(d: Date, mins: number): Date {
	const out = new Date(d);
	out.setMinutes(out.getMinutes() + mins);
	return out;
}

function ymd(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatIntervalo(start: Date, end: Date): string {
	const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
	const m1 = cap(start.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''));
	const m2 = cap(end.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''));
	const y = end.getFullYear();
	if (m1 === m2) return `${m1} de ${y}`;
	return `${m1} – ${m2}. de ${y}`;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user;
	if (!user || user.role !== 'PROFESSOR') throw redirect(302, '/login');

	const tenantId = locals.tenant?.id;
	if (!tenantId) throw redirect(302, '/login');

	const teacher = await db.teacher.findUnique({ where: { userId: user.id } });
	if (!teacher) throw redirect(302, '/professor');

	// Week start (Sunday) calculated from ?d= param or today
	const dParam = url.searchParams.get('d');
	const ref = dParam ? new Date(`${dParam}T12:00:00`) : new Date();
	const inicioSemana = new Date(ref);
	inicioSemana.setDate(ref.getDate() - ref.getDay());
	inicioSemana.setHours(0, 0, 0, 0);
	const fimSemana = new Date(inicioSemana);
	fimSemana.setDate(inicioSemana.getDate() + 6);
	fimSemana.setHours(23, 59, 59, 999);

	const prev = new Date(inicioSemana);
	prev.setDate(prev.getDate() - 7);
	const next = new Date(inicioSemana);
	next.setDate(next.getDate() + 7);

	// Days array (Sun → Sat)
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const diasLabels = ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'];
	const dias = diasOrdem.map((d, i) => {
		const date = new Date(inicioSemana);
		date.setDate(date.getDate() + i);
		return {
			dia: d,
			label: diasLabels[i],
			dateNumber: date.getDate(),
			isToday: date.getTime() === today.getTime(),
			iso: ymd(date)
		};
	});

	// Turmas regulares
	const turmas = await db.classGroup.findMany({
		where: { tenantId, professorId: user.id, ativo: true },
		include: { modality: { select: { nome: true } } }
	});

	// Particulares na semana
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
		}
	});

	// Disponibilidades (recorrentes)
	const disponibilidades = await db.teacherAvailability.findMany({
		where: { teacherId: teacher.id }
	});

	type Evento = {
		id: string;
		tipo: 'turma' | 'particular' | 'disponibilidade';
		dia: Dia;
		inicio: string;
		fim: string;
		titulo: string;
		subtitulo?: string;
	};

	const eventos: Evento[] = [
		...turmas.map<Evento>(t => ({
			id: t.id,
			tipo: 'turma',
			dia: t.diaSemana as Dia,
			inicio: t.horarioInicio,
			fim: t.horarioFim,
			titulo: t.modality.nome,
			subtitulo: `${t.nivel} · Sala ${t.sala}`
		})),
		...particulares.map<Evento>(p => ({
			id: p.id,
			tipo: 'particular',
			dia: dataParaDia(new Date(p.dataHora)),
			inicio: hhmm(new Date(p.dataHora)),
			fim: hhmm(addMinutes(new Date(p.dataHora), p.duracao)),
			titulo: p.modality.nome,
			subtitulo: p.user.nome
		})),
		...disponibilidades.map<Evento>(d => ({
			id: d.id,
			tipo: 'disponibilidade',
			dia: d.diaSemana as Dia,
			inicio: d.horarioInicio,
			fim: d.horarioFim,
			titulo: 'Livre',
			subtitulo: undefined
		}))
	];

	const tz = -new Date().getTimezoneOffset() / 60;
	const tzLabel = `GMT${tz >= 0 ? '+' : '-'}${String(Math.abs(tz)).padStart(2, '0')}`;

	return {
		eventos,
		dias,
		intervalo: formatIntervalo(inicioSemana, fimSemana),
		nav: {
			hoje: '/professor/agenda',
			prev: `/professor/agenda?d=${ymd(prev)}`,
			next: `/professor/agenda?d=${ymd(next)}`
		},
		tzLabel
	};
};

export const actions: Actions = {
	adicionarDisponibilidade: async ({ request, locals }) => {
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
			return fail(400, { error: 'Início deve ser antes do fim.' });
		}

		const existing = await db.teacherAvailability.findMany({
			where: { teacherId: teacher.id, diaSemana: diaSemana as any }
		});
		const overlap = existing.find(a =>
			a.horarioInicio < horarioFim && a.horarioFim > horarioInicio
		);
		if (overlap) {
			return fail(400, {
				error: `Conflita com ${overlap.horarioInicio}–${overlap.horarioFim}.`
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

		return { success: true, message: 'Horário livre adicionado.' };
	},

	removerDisponibilidade: async ({ request, locals }) => {
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
		return { success: true, message: 'Horário livre removido.' };
	}
};
