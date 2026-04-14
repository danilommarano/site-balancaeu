/**
 * Migração única: renomeia IDs de modalidades existentes para slugs.
 * FKs têm ON UPDATE CASCADE, então a atualização cascateia para
 * class_groups, private_lessons e _TeacherModalities automaticamente.
 */
import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/lib/utils/slug';

const prisma = new PrismaClient();

async function main() {
	const mods = await prisma.modality.findMany();
	console.log(`Encontradas ${mods.length} modalidades.`);

	for (const mod of mods) {
		const newId = slugify(mod.nome);
		if (!newId) {
			console.warn(`  ⚠️  "${mod.nome}" gera slug vazio — pulando.`);
			continue;
		}
		if (newId === mod.id) {
			console.log(`  ✓ ${mod.nome} já usa slug (${mod.id})`);
			continue;
		}

		const clash = await prisma.modality.findUnique({ where: { id: newId } });
		if (clash) {
			console.warn(`  ⚠️  Slug "${newId}" já existe — pulando "${mod.nome}".`);
			continue;
		}

		await prisma.$executeRawUnsafe(
			`UPDATE modalities SET id = $1 WHERE id = $2`,
			newId,
			mod.id
		);
		console.log(`  ✅ ${mod.nome}: ${mod.id} → ${newId}`);
	}

	console.log('\n🎉 Migração concluída!');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error('❌ Erro:', e);
		await prisma.$disconnect();
		process.exit(1);
	});
