"use client";

import { useState } from "react";
import {
  format,
  addDays,
  getDay,
  isSameDay,
  startOfToday,
  subDays,
} from "date-fns";

interface Props {
  dataSelecionada: Date | null;
  horarioSelecionado: string | null;
  horarios: string[];
  onSelect: (data: Date) => void;
  onSelectHorario: (horario: string) => void;
  onNext: () => void;
  onBack: () => void;
  cores: { primary: string; secondary: string };
}

export default function EtapaData({
  dataSelecionada,
  horarioSelecionado,
  horarios,
  onSelect,
  onSelectHorario,
  onNext,
  onBack,
  cores,
}: Props) {
  const [janelaInicio, setJanelaInicio] = useState(() => startOfToday());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dataSelecionada && horarioSelecionado) onNext();
  };

  const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const hoje = startOfToday();
  const dias = Array.from({ length: 7 }, (_, i) => addDays(janelaInicio, i));
  const fimDaJanela = addDays(janelaInicio, 6);
  const podeVoltar = janelaInicio > hoje;

  const dataSelecionadaLabel = dataSelecionada
    ? format(dataSelecionada, "EEEE, dd 'de' MMMM")
    : "Selecione o melhor dia";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Agendamento
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">
              Escolha a data e o horário
            </h2>
          </div>
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-md"
            style={{ backgroundColor: cores.secondary }}
          >
            {dataSelecionada ? format(dataSelecionada, "dd") : "✓"}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-3">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Seleção atual
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800">
            {dataSelecionadaLabel}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {horarioSelecionado ? `Horário: ${horarioSelecionado}` : "Aguardando horário"}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Data
          </span>
          <button
            type="button"
            onClick={() => setJanelaInicio(startOfToday())}
            className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-700"
          >
            Hoje
          </button>
        </div>

        <div className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2">
          <button
            type="button"
            onClick={() => setJanelaInicio((prev) => subDays(prev, 7))}
            disabled={!podeVoltar}
            aria-label="Ver período anterior"
            title="Período anterior"
            className="flex aspect-square items-center justify-center rounded-2xl border border-slate-300 bg-slate-50 text-lg font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span aria-hidden="true">←</span>
          </button>

          <div className="rounded-2xl bg-slate-50 px-3 py-2 text-center">
            <span className="text-xs font-semibold text-slate-700 sm:text-sm">
              {format(janelaInicio, "dd/MM")} - {format(fimDaJanela, "dd/MM")}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setJanelaInicio((prev) => addDays(prev, 7))}
            aria-label="Ver próximo período"
            title="Próximo período"
            className="flex aspect-square items-center justify-center rounded-2xl border border-slate-300 bg-slate-50 text-lg font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
          {dias.map((dia) => {
            const isSelected = dataSelecionada && isSameDay(dia, dataSelecionada);
            const isToday = isSameDay(dia, hoje);
            const diaSemana = diasDaSemana[getDay(dia)];

            return (
              <button
                key={dia.toISOString()}
                type="button"
                onClick={() => onSelect(dia)}
                className={`flex min-w-0 flex-col items-center rounded-2xl border-2 px-0.5 py-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  isSelected ? "text-white" : "border-slate-200 text-slate-700"
                }`}
                style={{
                  backgroundColor: isSelected ? cores.secondary : undefined,
                  borderColor: isSelected ? cores.secondary : undefined,
                  boxShadow: isSelected ? `0 12px 24px -16px ${cores.secondary}` : undefined,
                }}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  {diaSemana}
                </span>
                <span className="mt-1 text-base font-bold sm:text-lg">
                  {format(dia, "dd")}
                </span>
                {isToday && (
                  <span
                    className={`mt-1 text-[10px] font-semibold uppercase ${
                      isSelected ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    Hoje
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Horário
          </span>
          {dataSelecionada && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {horarios.length} disponíveis
            </span>
          )}
        </div>

        {!dataSelecionada ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Primeiro selecione uma data para ver os horários disponíveis.
          </p>
        ) : horarios.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
            <p className="text-sm text-slate-500">
              Nenhum horário disponível para este dia.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {horarios.map((horario) => (
              <button
                key={horario}
                type="button"
                onClick={() => onSelectHorario(horario)}
                className={`rounded-2xl border-2 py-3 text-center transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                  horarioSelecionado === horario
                    ? "text-white"
                    : "border-slate-200 text-slate-700"
                }`}
                style={{
                  backgroundColor:
                    horarioSelecionado === horario ? cores.secondary : undefined,
                  borderColor:
                    horarioSelecionado === horario ? cores.secondary : undefined,
                  boxShadow:
                    horarioSelecionado === horario
                      ? `0 16px 24px -18px ${cores.secondary}`
                      : undefined,
                }}
              >
                <span className="text-sm font-semibold">{horario}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-2xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={!dataSelecionada || !horarioSelecionado}
          className="flex-1 rounded-2xl px-6 py-3 text-white font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: cores.secondary }}
        >
          Continuar
        </button>
      </div>
    </form>
  );
}