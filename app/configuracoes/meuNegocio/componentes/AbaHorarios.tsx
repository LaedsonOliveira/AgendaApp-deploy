// app/configuracoes/meu-negocio/components/AbaHorarios.tsx
"use client";

import { useState } from "react";
import { HorarioDia } from "../types";

interface Props {
  horarios: HorarioDia[];
  setHorarios: (horarios: HorarioDia[]) => void;
  onSave: (horarios: HorarioDia[]) => Promise<void>;
}

const diasSemana = [
  { id: "segunda", label: "Segunda" },
  { id: "terca", label: "Terça" },
  { id: "quarta", label: "Quarta" },
  { id: "quinta", label: "Quinta" },
  { id: "sexta", label: "Sexta" },
  { id: "sabado", label: "Sábado" },
  { id: "domingo", label: "Domingo" },
];

export default function AbaHorarios({ horarios, setHorarios, onSave }: Props) {
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState("");
  const handleChange = (dia: string, field: keyof HorarioDia, value: HorarioDia[keyof HorarioDia]) => {
    setHorarios(
      horarios.map(h =>
        h.dia === dia ? { ...h, [field]: value } : h
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setFeedback("");
    try {
      await onSave(horarios);
      setFeedback("Horários salvos.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar os horários.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Horários de Funcionamento</h2>
        <p className="mt-1 text-sm text-slate-500">Defina os dias e horários que o seu negócio funciona</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {diasSemana.map((dia) => {
          const horario = horarios.find(h => h.dia === dia.id);
          if (!horario) return null;

          return (
            <div key={dia.id} className={`rounded-xl border p-4 transition sm:p-5 ${horario.ativo ? "border-slate-200 bg-white shadow-sm" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 lg:min-w-32">
                  <input
                    type="checkbox"
                    checked={horario.ativo}
                    onChange={(e) => handleChange(dia.id, 'ativo', e.target.checked)}
                    className="h-4 w-4 accent-slate-950"
                  />
                  <label className="text-sm font-semibold text-slate-800">{dia.label}</label>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Abre</span>
                  <input
                    type="time"
                    value={horario.abertura || "09:00"}
                    onChange={(e) => handleChange(dia.id, 'abertura', e.target.value)}
                    disabled={!horario.ativo}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Fecha</span>
                  <input
                    type="time"
                    value={horario.fechamento || "18:00"}
                    onChange={(e) => handleChange(dia.id, 'fechamento', e.target.value)}
                    disabled={!horario.ativo}
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <div className="flex flex-wrap items-center gap-2 border-l border-slate-200 pl-3">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Almoço</span>
                    <input
                      type="time"
                      value={horario.almocoInicio || ""}
                      onChange={(e) => handleChange(dia.id, 'almocoInicio', e.target.value)}
                      disabled={!horario.ativo}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <span>às</span>
                    <input
                      type="time"
                      value={horario.almocoFim || ""}
                      onChange={(e) => handleChange(dia.id, 'almocoFim', e.target.value)}
                      disabled={!horario.ativo}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-end pt-3">
          <div className="flex items-center gap-3">
            {feedback && <p role="status" className="text-sm text-slate-600">{feedback}</p>}
            <button type="submit" disabled={salvando} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2">
              {salvando ? "Salvando..." : "Salvar Horários"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}