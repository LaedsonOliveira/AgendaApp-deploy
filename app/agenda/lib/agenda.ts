// lib/encaixe.ts
import { getDay, isSameDay, parseISO } from "date-fns";
import { Agendamento, HorarioFuncionamento, Servico } from "../types/agenda";

export interface ResultadoEncaixe {
  disponivel: boolean;
  horarioInicio: string;
  horarioFim: string;
  conflito: boolean;
  mensagem: string;
  proximoAgendamento?: string;
  data?: string;
}

const DIAS_DA_SEMANA = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
];

const minutosDoHorario = (horario: string) => {
  const [horas, minutos] = horario.split(":").map(Number);
  return horas * 60 + minutos;
};

const horarioDosMinutos = (minutos: number) => {
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  return `${String(horas).padStart(2, "0")}:${String(minutosRestantes).padStart(2, "0")}`;
};

export function calcularHorarioEncaixe(
  agendamentos: Agendamento[],
  servico: Servico,
  profissionalId: string,
  horariosFuncionamento: HorarioFuncionamento[]
): ResultadoEncaixe {
  const agora = new Date();
  const duracaoServico = servico.duracao;
  const dia = horariosFuncionamento.find((horario) => horario.dia === DIAS_DA_SEMANA[getDay(agora)]);

  if (!dia || !dia.ativo) {
    return {
      disponivel: false,
      horarioInicio: "",
      horarioFim: "",
      conflito: false,
      mensagem: "O meu negócio não funciona hoje.",
    };
  }

  const abertura = minutosDoHorario(dia.abertura);
  const fechamento = minutosDoHorario(dia.fechamento);
  const minutoAtual = agora.getHours() * 60 + agora.getMinutes();
  const inicioAtual = Math.max(minutoAtual, abertura);
  const pausaInicio = dia.almocoInicio ? minutosDoHorario(dia.almocoInicio) : null;
  const pausaFim = dia.almocoFim ? minutosDoHorario(dia.almocoFim) : null;

  // Filtra agendamentos do profissional hoje
  const agsDoProfissional = agendamentos
    .filter(
      (a) =>
        a.profissionalId === profissionalId &&
        isSameDay(parseISO(a.data), agora) &&
        a.status !== "Cancelado"
    )
    .sort((a, b) => a.horario.localeCompare(b.horario));

  let inicio = inicioAtual;
  let conflito = false;
  let proximoAgendamento: string | undefined;

  while (inicio + duracaoServico <= fechamento) {
    const fim = inicio + duracaoServico;
    const agendamentoEmConflito = agsDoProfissional.find((agendamento) => {
      const agendamentoInicio = minutosDoHorario(agendamento.horario);
      const agendamentoFim = agendamentoInicio + (agendamento.duracao || 30);
      return inicio < agendamentoFim && fim > agendamentoInicio;
    });

    const conflitaComAlmoco = pausaInicio !== null && pausaFim !== null && inicio < pausaFim && fim > pausaInicio;

    if (!agendamentoEmConflito && !conflitaComAlmoco) {
      const dataDoEncaixe = new Date(agora);
      dataDoEncaixe.setHours(Math.floor(inicio / 60), inicio % 60, 0, 0);
      return {
        disponivel: true,
        horarioInicio: horarioDosMinutos(inicio),
        horarioFim: horarioDosMinutos(fim),
        conflito,
        mensagem: conflito
          ? `Não cabe agora. Próximo horário disponível: ${horarioDosMinutos(inicio)}`
          : "Horário livre! Pode atender agora.",
        proximoAgendamento,
        data: dataDoEncaixe.toISOString(),
      };
    }

    conflito = true;
    if (agendamentoEmConflito) {
      const agendamentoInicio = minutosDoHorario(agendamentoEmConflito.horario);
      inicio = Math.max(inicio + 1, agendamentoInicio + (agendamentoEmConflito.duracao || 30));
      proximoAgendamento ??= agendamentoEmConflito.horario;
    } else if (pausaFim !== null) {
      inicio = Math.max(inicio + 1, pausaFim);
    }
  }

  return {
    disponivel: false,
    horarioInicio: "",
    horarioFim: "",
    conflito,
    mensagem: conflito
      ? "Não há horário disponível hoje para a duração desse serviço."
      : `O serviço precisa terminar até ${dia.fechamento}.`,
    proximoAgendamento,
  };
}