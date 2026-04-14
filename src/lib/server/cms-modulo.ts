// ===========================================
// BalancaEu — Configuração de seções CMS para páginas de módulo
// ===========================================

export type ChaveConfig = {
	chave: string;
	label: string;
	tipo: 'texto' | 'imagem' | 'textarea';
};

export type SecaoConfig = {
	label: string;
	chaves: ChaveConfig[];
};

export const SECOES_MODULO: Record<string, SecaoConfig> = {
	hero: {
		label: 'Hero (Topo da Página)',
		chaves: [
			{ chave: 'label', label: 'Label acima do título', tipo: 'texto' },
			{ chave: 'subtitulo', label: 'Texto descritivo abaixo do nome', tipo: 'textarea' },
			{ chave: 'cta_primario_texto', label: 'Texto do botão primário', tipo: 'texto' },
			{ chave: 'cta_secundario_texto', label: 'Texto do botão secundário', tipo: 'texto' },
			{ chave: 'imagem', label: 'Imagem do hero (sobrescreve da modalidade)', tipo: 'imagem' }
		]
	},
	sobre: {
		label: 'Sobre a Modalidade',
		chaves: [
			{ chave: 'label', label: 'Label da seção', tipo: 'texto' },
			{ chave: 'titulo', label: 'Título da seção', tipo: 'texto' },
			{ chave: 'paragrafo_1', label: 'Parágrafo 1', tipo: 'textarea' },
			{ chave: 'paragrafo_2', label: 'Parágrafo 2', tipo: 'textarea' }
		]
	},
	beneficios: {
		label: 'Cards de Benefícios',
		chaves: [
			{ chave: 'card_1_titulo', label: 'Card 1 — Título', tipo: 'texto' },
			{ chave: 'card_1_texto', label: 'Card 1 — Descrição', tipo: 'texto' },
			{ chave: 'card_1_icone', label: 'Card 1 — Ícone (material symbols)', tipo: 'texto' },
			{ chave: 'card_2_titulo', label: 'Card 2 — Título', tipo: 'texto' },
			{ chave: 'card_2_texto', label: 'Card 2 — Descrição', tipo: 'texto' },
			{ chave: 'card_2_icone', label: 'Card 2 — Ícone', tipo: 'texto' },
			{ chave: 'card_3_titulo', label: 'Card 3 — Título', tipo: 'texto' },
			{ chave: 'card_3_texto', label: 'Card 3 — Descrição', tipo: 'texto' },
			{ chave: 'card_3_icone', label: 'Card 3 — Ícone', tipo: 'texto' }
		]
	},
	professores: {
		label: 'Seção de Professores',
		chaves: [
			{ chave: 'label', label: 'Label da seção', tipo: 'texto' },
			{ chave: 'titulo', label: 'Título (use {modalidade} para substituir)', tipo: 'texto' },
			{ chave: 'descricao', label: 'Descrição', tipo: 'textarea' }
		]
	},
	horarios: {
		label: 'Seção de Horários',
		chaves: [
			{ chave: 'label', label: 'Label da seção', tipo: 'texto' },
			{ chave: 'titulo', label: 'Título (use {modalidade} para substituir)', tipo: 'texto' }
		]
	},
	cta_final: {
		label: 'CTA Final',
		chaves: [
			{ chave: 'titulo', label: 'Título principal', tipo: 'texto' },
			{ chave: 'titulo_destaque', label: 'Frase em destaque', tipo: 'texto' },
			{ chave: 'descricao', label: 'Descrição', tipo: 'textarea' },
			{ chave: 'cta_primario_texto', label: 'Texto do botão primário', tipo: 'texto' }
		]
	}
};

export function secaoKey(modalityId: string, secao: string): string {
	return `modulo.${modalityId}.${secao}`;
}

export function stripPrefix(key: string, modalityId: string): string | null {
	const prefix = `modulo.${modalityId}.`;
	if (!key.startsWith(prefix)) return null;
	return key.slice(prefix.length);
}
