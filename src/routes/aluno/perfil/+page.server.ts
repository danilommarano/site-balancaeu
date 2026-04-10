import { db } from '$lib/server/db';
import { redirect, fail } from '@sveltejs/kit';
import { isValidEmail, isValidPhone } from '$lib/server/validation';
import bcrypt from 'bcrypt';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user || user.role !== 'ALUNO') throw redirect(302, '/login');

	const fullUser = await db.user.findUnique({
		where: { id: user.id },
		select: {
			id: true,
			nome: true,
			email: true,
			telefone: true,
			dataNasc: true,
			avatarUrl: true,
			createdAt: true
		}
	});

	if (!fullUser) throw redirect(302, '/login');

	return {
		perfil: {
			...fullUser,
			dataNasc: fullUser.dataNasc?.toISOString().split('T')[0] ?? '',
			createdAt: fullUser.createdAt.toISOString()
		}
	};
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) return fail(401, { error: 'Não autenticado' });

		const fd = await request.formData();
		const nome = fd.get('nome')?.toString().trim();
		const email = fd.get('email')?.toString().trim();
		const telefone = fd.get('telefone')?.toString().trim() || null;
		const dataNasc = fd.get('dataNasc')?.toString().trim() || null;

		if (!nome || nome.length < 2) return fail(400, { error: 'Nome deve ter pelo menos 2 caracteres' });
		if (!email || !isValidEmail(email)) return fail(400, { error: 'Email inválido' });
		if (telefone && !isValidPhone(telefone)) return fail(400, { error: 'Telefone inválido' });

		// Check email uniqueness
		const existing = await db.user.findFirst({
			where: { tenantId: user.tenantId, email, id: { not: user.id } }
		});
		if (existing) return fail(400, { error: 'Este email já está em uso' });

		await db.user.update({
			where: { id: user.id },
			data: {
				nome,
				email,
				telefone,
				dataNasc: dataNasc ? new Date(dataNasc) : null
			}
		});

		return { success: 'Perfil atualizado com sucesso!' };
	},

	senha: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) return fail(401, { error: 'Não autenticado' });

		const fd = await request.formData();
		const senhaAtual = fd.get('senhaAtual')?.toString();
		const novaSenha = fd.get('novaSenha')?.toString();
		const confirmarSenha = fd.get('confirmarSenha')?.toString();

		if (!senhaAtual || !novaSenha || !confirmarSenha) {
			return fail(400, { senhaError: 'Preencha todos os campos' });
		}
		if (novaSenha.length < 6) {
			return fail(400, { senhaError: 'Nova senha deve ter pelo menos 6 caracteres' });
		}
		if (novaSenha !== confirmarSenha) {
			return fail(400, { senhaError: 'As senhas não coincidem' });
		}

		const fullUser = await db.user.findUnique({ where: { id: user.id } });
		if (!fullUser) return fail(400, { senhaError: 'Usuário não encontrado' });

		const valid = await bcrypt.compare(senhaAtual, fullUser.senhaHash);
		if (!valid) return fail(400, { senhaError: 'Senha atual incorreta' });

		const hash = await bcrypt.hash(novaSenha, 10);
		await db.user.update({
			where: { id: user.id },
			data: { senhaHash: hash }
		});

		return { senhaSuccess: 'Senha alterada com sucesso!' };
	}
};
