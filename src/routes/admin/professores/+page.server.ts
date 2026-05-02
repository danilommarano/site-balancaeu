import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import bcrypt from 'bcrypt';
import { isValidEmail, isValidPhone } from '$lib/server/validation';

export const load: PageServerLoad = async ({ locals }) => {
	const tenantId = locals.tenant?.id;
	if (!tenantId) return { professores: [], modalidades: [] };

	const [professores, modalidades] = await Promise.all([
		db.user.findMany({
			where: { tenantId, role: 'PROFESSOR' },
			orderBy: { nome: 'asc' },
			select: {
				id: true,
				nome: true,
				email: true,
				telefone: true,
				ativo: true,
				createdAt: true,
				teacher: {
					select: {
						bio: true,
						imagemUrl: true,
						especialidades: true,
						modalities: { select: { id: true, nome: true } }
					}
				},
				_count: {
					select: { professorClasses: true }
				}
			}
		}),
		db.modality.findMany({
			where: { tenantId, ativo: true },
			orderBy: { nome: 'asc' },
			select: { id: true, nome: true }
		})
	]);

	return {
		professores: professores.map(p => ({
			...p,
			createdAt: p.createdAt.toISOString()
		})),
		modalidades
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const nome = fd.get('nome')?.toString().trim();
		const email = fd.get('email')?.toString().trim().toLowerCase();
		const telefone = fd.get('telefone')?.toString().trim() || null;
		const bio = fd.get('bio')?.toString().trim() || '';
		const imagemUrl = fd.get('imagemUrl')?.toString().trim() || null;
		const modalityIds = fd.getAll('modalityIds').map(v => v.toString()).filter(Boolean);
		const senha = fd.get('senha')?.toString();

		if (!nome || !email || !senha) {
			return fail(400, { error: 'Nome, email e senha são obrigatórios' });
		}

		if (!isValidEmail(email)) {
			return fail(400, { error: 'Formato de email inválido' });
		}

		if (telefone && !isValidPhone(telefone)) {
			return fail(400, { error: 'Formato de telefone inválido (mín. 10 dígitos)' });
		}

		if (senha.length < 6) {
			return fail(400, { error: 'Senha deve ter no mínimo 6 caracteres' });
		}

		const exists = await db.user.findUnique({ where: { tenantId_email: { tenantId, email } } });
		if (exists) {
			return fail(400, { error: 'Email já cadastrado' });
		}

		const senhaHash = await bcrypt.hash(senha, 12);

		const user = await db.user.create({
			data: { tenantId, nome, email, senhaHash, role: 'PROFESSOR', telefone }
		});

		await db.teacher.create({
			data: {
				tenantId,
				userId: user.id,
				bio,
				imagemUrl,
				especialidades: [],
				modalities: { connect: modalityIds.map(id => ({ id })) }
			}
		});

		return { success: true };
	},

	update: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		const nome = fd.get('nome')?.toString().trim();
		const email = fd.get('email')?.toString().trim().toLowerCase();
		const telefone = fd.get('telefone')?.toString().trim() || null;
		const bio = fd.get('bio')?.toString().trim() || '';
		const imagemUrl = fd.get('imagemUrl')?.toString().trim() || null;
		const modalityIds = fd.getAll('modalityIds').map(v => v.toString()).filter(Boolean);
		const ativo = fd.get('ativo') === 'true';

		if (!id || !nome || !email) {
			return fail(400, { error: 'Nome e email são obrigatórios' });
		}

		if (!isValidEmail(email)) {
			return fail(400, { error: 'Formato de email inválido' });
		}

		if (telefone && !isValidPhone(telefone)) {
			return fail(400, { error: 'Formato de telefone inválido (mín. 10 dígitos)' });
		}

		const exists = await db.user.findUnique({ where: { tenantId_email: { tenantId, email } } });
		if (exists && exists.id !== id) {
			return fail(400, { error: 'Email já cadastrado por outro usuário' });
		}

		await db.user.update({
			where: { id },
			data: { nome, email, telefone, ativo }
		});

		const teacher = await db.teacher.findFirst({ where: { userId: id } });
		if (teacher) {
			await db.teacher.update({
				where: { id: teacher.id },
				data: {
					bio,
					imagemUrl,
					modalities: { set: modalityIds.map(mid => ({ id: mid })) }
				}
			});
		}

		return { success: true };
	},

	toggleActive: async ({ request, locals }) => {
		const tenantId = locals.tenant?.id;
		if (!tenantId) return fail(400, { error: 'Tenant não encontrado' });

		const fd = await request.formData();
		const id = fd.get('id')?.toString();
		const ativo = fd.get('ativo') === 'true';
		if (!id) return fail(400, { error: 'ID obrigatório' });

		await db.user.update({ where: { id }, data: { ativo } });
		return { success: true };
	}
};
