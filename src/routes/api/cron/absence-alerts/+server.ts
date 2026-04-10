// ===========================================
// Pulso — Cron: Alertas de Faltas
// ===========================================
// Endpoint para ser chamado por cron job (ex: weekly)
// Detecta alunos com >3 faltas e envia alertas por email

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { sendEmail } from '$lib/server/email';
import { absenceAlertEmail } from '$lib/server/email/templates';

export const GET: RequestHandler = async () => {
	const results = { alerts: 0, errors: [] as string[] };

	try {
		// Buscar todos os tenants ativos
		const tenants = await db.tenant.findMany({ where: { ativo: true } });

		for (const tenant of tenants) {
			// Buscar faltas nos últimos 30 dias
			const trintaDiasAtras = new Date();
			trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

			const faltas = await db.attendance.findMany({
				where: {
					tenantId: tenant.id,
					presente: false,
					data: { gte: trintaDiasAtras }
				},
				include: {
					user: { select: { id: true, nome: true, email: true } },
					classGroup: {
						select: { modality: { select: { nome: true } }, nivel: true }
					}
				}
			});

			// Contar faltas por aluno
			const faltasPorAluno = new Map<string, {
				nome: string;
				email: string;
				faltas: number;
				turma: string;
			}>();

			for (const f of faltas) {
				if (!faltasPorAluno.has(f.userId)) {
					faltasPorAluno.set(f.userId, {
						nome: f.user.nome,
						email: f.user.email,
						faltas: 0,
						turma: `${f.classGroup.modality.nome} - ${f.classGroup.nivel}`
					});
				}
				faltasPorAluno.get(f.userId)!.faltas++;
			}

			// Enviar alertas para alunos com >3 faltas
			for (const [, aluno] of faltasPorAluno) {
				if (aluno.faltas > 3) {
					try {
						await sendEmail({
							to: aluno.email,
							subject: `Alerta de frequência — ${aluno.faltas} faltas registradas`,
							html: absenceAlertEmail(
								aluno.nome,
								aluno.faltas,
								aluno.turma,
								tenant.nome
							)
						});

						// Also notify admin
						const admin = await db.user.findFirst({
							where: { tenantId: tenant.id, role: 'ADMIN', ativo: true },
							select: { email: true }
						});
						if (admin) {
							await sendEmail({
								to: admin.email,
								subject: `[Admin] Aluno ${aluno.nome} com ${aluno.faltas} faltas`,
								html: absenceAlertEmail(
									aluno.nome,
									aluno.faltas,
									aluno.turma,
									tenant.nome
								)
							});
						}

						results.alerts++;
					} catch (err) {
						results.errors.push(`Alert ${aluno.nome}: ${String(err)}`);
					}
				}
			}
		}
	} catch (err) {
		results.errors.push(`Global error: ${String(err)}`);
	}

	return json({
		ok: true,
		timestamp: new Date().toISOString(),
		...results
	});
};
