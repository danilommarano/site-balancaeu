// ===========================================
// BalancaEu — Tipos compartilhados
// ===========================================
// TODO: Fase 2 — Definir tipos TypeScript baseados no schema Prisma

export type Role = 'ADMIN' | 'PROFESSOR' | 'ALUNO';

export type SubscriptionStatus = 'ATIVA' | 'CANCELADA' | 'PAUSADA' | 'EXPIRADA';

export type EnrollmentStatus = 'ATIVA' | 'CANCELADA' | 'LISTA_ESPERA';

export type DayOfWeek = 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB';

export type LessonStatus = 'AGENDADA' | 'CONFIRMADA' | 'CONCLUIDA' | 'CANCELADA';

export type TransactionType = 'MENSALIDADE' | 'PARTICULAR' | 'EVENTO' | 'OUTRO';

export type TransactionStatus = 'PAGO' | 'PENDENTE' | 'CANCELADO';

export type CheckInMethod = 'QR_CODE' | 'MANUAL';
