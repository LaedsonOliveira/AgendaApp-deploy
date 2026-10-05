// types/agenda.ts

export type StatusAgendamento = "Pendente" | "Pago" | "Cancelado" | "Finalizado";

export interface Agendamento {
  id: string;
  data: string; // ISO string
  horario: string; // "09:00"
  clienteNome: string;
  clienteFone: string;
  servicoNome: string;
  servicoId?: string;
  profissionalId: string;
  profissionalNome: string;
  valor: number;
  duracao?: number;
  status: StatusAgendamento;
}

export interface Profissional {
  id: string;
  nome: string;
}

export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
}

export interface HorarioFuncionamento {
  dia: string;
  ativo: boolean;
  abertura: string;
  fechamento: string;
  almocoInicio?: string;
  almocoFim?: string;
}