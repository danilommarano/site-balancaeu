// ===========================================
// BalancaEu — Templates de Email HTML
// ===========================================
// Fase 16 — Templates responsivos para emails transacionais

function baseTemplate(content: string, schoolName = 'BalancaEu'): string {
	return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${schoolName}</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background:#7c3aed;border-radius:12px;padding:10px 16px;">
        <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">${schoolName}</span>
      </div>
    </div>

    <!-- Content -->
    <div style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:32px;margin-bottom:24px;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="text-align:center;">
      <p style="color:#52525b;font-size:12px;margin:0;">
        ${schoolName} — Plataforma de gestão para escolas de dança
      </p>
      <p style="color:#3f3f46;font-size:11px;margin:8px 0 0;">
        Este é um email automático, por favor não responda.
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Email de boas-vindas ────────────────────────────
export function welcomeEmail(nome: string, schoolName = 'BalancaEu'): string {
	return baseTemplate(`
    <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 16px;">
      Bem-vindo(a), ${nome}! 🎉
    </h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Sua conta na <strong style="color:#fff;">${schoolName}</strong> foi criada com sucesso!
      Agora você pode acessar a plataforma para visualizar seus planos, inscrever-se em turmas e muito mais.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="#" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
        Acessar Minha Conta
      </a>
    </div>
    <p style="color:#71717a;font-size:13px;margin:0;">
      Qualquer dúvida, entre em contato com a escola.
    </p>
  `, schoolName);
}

// ─── Confirmação de agendamento de particular ────────
export function lessonConfirmationEmail(
	alunoNome: string,
	professorNome: string,
	data: string,
	horario: string,
	modalidade: string,
	schoolName = 'BalancaEu'
): string {
	return baseTemplate(`
    <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 16px;">
      Aula confirmada! ✅
    </h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Olá, <strong style="color:#fff;">${alunoNome}</strong>! Sua aula particular foi confirmada pelo professor.
    </p>
    <div style="background:#27272a;border-radius:12px;padding:20px;margin:0 0 20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#71717a;font-size:12px;padding:6px 0;">Modalidade</td>
          <td style="color:#fff;font-size:14px;padding:6px 0;text-align:right;font-weight:600;">${modalidade}</td>
        </tr>
        <tr>
          <td style="color:#71717a;font-size:12px;padding:6px 0;">Professor</td>
          <td style="color:#fff;font-size:14px;padding:6px 0;text-align:right;">${professorNome}</td>
        </tr>
        <tr>
          <td style="color:#71717a;font-size:12px;padding:6px 0;">Data</td>
          <td style="color:#fff;font-size:14px;padding:6px 0;text-align:right;">${data}</td>
        </tr>
        <tr>
          <td style="color:#71717a;font-size:12px;padding:6px 0;">Horário</td>
          <td style="color:#fff;font-size:14px;padding:6px 0;text-align:right;">${horario}</td>
        </tr>
      </table>
    </div>
    <p style="color:#71717a;font-size:12px;margin:0;">
      Lembre-se de chegar com 5 minutos de antecedência. Cancelamentos devem ser feitos com no mínimo 24h de antecedência.
    </p>
  `, schoolName);
}

// ─── Lembrete de aula particular (24h) ───────────────
export function lessonReminderEmail(
	alunoNome: string,
	professorNome: string,
	data: string,
	horario: string,
	modalidade: string,
	schoolName = 'BalancaEu'
): string {
	return baseTemplate(`
    <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 16px;">
      Lembrete: aula amanhã! 📅
    </h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Olá, <strong style="color:#fff;">${alunoNome}</strong>! Lembrando que você tem uma aula particular amanhã.
    </p>
    <div style="background:#27272a;border-radius:12px;padding:20px;margin:0 0 20px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#71717a;font-size:12px;padding:6px 0;">Modalidade</td>
          <td style="color:#fff;font-size:14px;padding:6px 0;text-align:right;font-weight:600;">${modalidade}</td>
        </tr>
        <tr>
          <td style="color:#71717a;font-size:12px;padding:6px 0;">Professor</td>
          <td style="color:#fff;font-size:14px;padding:6px 0;text-align:right;">${professorNome}</td>
        </tr>
        <tr>
          <td style="color:#71717a;font-size:12px;padding:6px 0;">Data</td>
          <td style="color:#fff;font-size:14px;padding:6px 0;text-align:right;">${data}</td>
        </tr>
        <tr>
          <td style="color:#71717a;font-size:12px;padding:6px 0;">Horário</td>
          <td style="color:#fff;font-size:14px;padding:6px 0;text-align:right;">${horario}</td>
        </tr>
      </table>
    </div>
    <p style="color:#71717a;font-size:12px;margin:0;">
      Caso precise cancelar, faça isso com no mínimo 24h de antecedência pela plataforma.
    </p>
  `, schoolName);
}

// ─── Alerta de faltas excessivas ─────────────────────
export function absenceAlertEmail(
	alunoNome: string,
	faltas: number,
	turma: string,
	schoolName = 'BalancaEu'
): string {
	return baseTemplate(`
    <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 16px;">
      Alerta de frequência ⚠️
    </h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Olá, <strong style="color:#fff;">${alunoNome}</strong>. Identificamos que você tem
      <strong style="color:#ef4444;">${faltas} faltas</strong> na turma
      <strong style="color:#fff;">${turma}</strong>.
    </p>
    <div style="background:#7f1d1d20;border:1px solid #ef444430;border-radius:12px;padding:16px;margin:0 0 20px;">
      <p style="color:#fca5a5;font-size:13px;margin:0;">
        A frequência é importante para o seu desenvolvimento. Se estiver com alguma dificuldade, 
        converse com a administração da escola.
      </p>
    </div>
    <p style="color:#71717a;font-size:12px;margin:0;">
      Este é um aviso automático gerado pelo sistema de controle de presença.
    </p>
  `, schoolName);
}

// ─── Aviso de vencimento de plano ────────────────────
export function planExpiringEmail(
	alunoNome: string,
	plano: string,
	dataVencimento: string,
	schoolName = 'BalancaEu'
): string {
	return baseTemplate(`
    <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 16px;">
      Seu plano está vencendo 📋
    </h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Olá, <strong style="color:#fff;">${alunoNome}</strong>! Seu plano
      <strong style="color:#fff;">${plano}</strong> irá vencer em
      <strong style="color:#fbbf24;">${dataVencimento}</strong>.
    </p>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Renove para continuar aproveitando suas aulas sem interrupção.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="#" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
        Renovar Plano
      </a>
    </div>
  `, schoolName);
}

// ─── Notificação de novo evento ──────────────────────
export function newEventEmail(
	titulo: string,
	descricao: string,
	data: string,
	horario: string,
	local: string,
	preco: string | null,
	schoolName = 'BalancaEu'
): string {
	return baseTemplate(`
    <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 16px;">
      Novo evento! 🎶
    </h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 20px;">
      A <strong style="color:#fff;">${schoolName}</strong> tem um novo evento:
    </p>
    <div style="background:#27272a;border-radius:12px;padding:20px;margin:0 0 20px;">
      <h2 style="color:#fff;font-size:18px;font-weight:600;margin:0 0 12px;">${titulo}</h2>
      <p style="color:#a1a1aa;font-size:13px;line-height:1.5;margin:0 0 16px;">${descricao}</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#71717a;font-size:12px;padding:4px 0;">📅 Data</td>
          <td style="color:#fff;font-size:13px;padding:4px 0;text-align:right;">${data}</td>
        </tr>
        <tr>
          <td style="color:#71717a;font-size:12px;padding:4px 0;">🕐 Horário</td>
          <td style="color:#fff;font-size:13px;padding:4px 0;text-align:right;">${horario}</td>
        </tr>
        <tr>
          <td style="color:#71717a;font-size:12px;padding:4px 0;">📍 Local</td>
          <td style="color:#fff;font-size:13px;padding:4px 0;text-align:right;">${local}</td>
        </tr>
        ${preco ? `
        <tr>
          <td style="color:#71717a;font-size:12px;padding:4px 0;">💰 Valor</td>
          <td style="color:#fff;font-size:13px;padding:4px 0;text-align:right;">${preco}</td>
        </tr>
        ` : `
        <tr>
          <td style="color:#71717a;font-size:12px;padding:4px 0;">💰 Valor</td>
          <td style="color:#22c55e;font-size:13px;padding:4px 0;text-align:right;font-weight:600;">Gratuito</td>
        </tr>
        `}
      </table>
    </div>
  `, schoolName);
}
