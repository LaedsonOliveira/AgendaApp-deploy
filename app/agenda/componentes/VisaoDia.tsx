// components/agenda/VisaoDia.tsx
"use client";

import { format, parseISO, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Agendamento } from "../types/agenda";

interface Props {
    data: Date;
    agendamentos: Agendamento[];
    onSelecionar: (agendamento: Agendamento) => void;
}

export default function VisaoDia({ data, agendamentos, onSelecionar }: Props) {
    // Filtra apenas os agendamentos do dia
    const agendamentosDoDia = agendamentos
        .filter((a) => isSameDay(parseISO(a.data), data))
        .sort((a, b) => a.horario.localeCompare(b.horario));

    const getStatusBadge = (status: string) => {
        const styles = {
            Pago: "bg-green-100 text-green-800",
            Pendente: "bg-yellow-100 text-yellow-800",
            Cancelado: "bg-red-100 text-red-800",
            Finalizado: "bg-blue-100 text-blue-800",
        };
        return styles[status as keyof typeof styles] || "bg-slate-100 text-slate-800";
    };

    if (agendamentosDoDia.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <p className="text-slate-500">Nenhum agendamento para este dia.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {agendamentosDoDia.map((a) => (
                <button
                    key={a.id}
                    onClick={() => onSelecionar(a)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-950 hover:shadow-md"
                >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        {/* HORÁRIO */}
                        <div className="flex flex-col items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-white sm:min-w-[90px]">
                            <span className="text-lg font-bold">{a.horario}</span>
                        </div>

                        {/* INFO */}
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 text-sm sm:gap-2">
                                <span className="font-semibold text-slate-900">
                                    {a.clienteNome}
                                </span>
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-600">{a.servicoNome}</span>
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-600">{a.profissionalNome}</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{a.clienteFone}</p>
                        </div>

                        {/* VALOR + STATUS */}
                        <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
                            <span className="text-base font-bold text-slate-900 sm:text-lg">
                                R$ {a.valor.toFixed(2).replace(".", ",")}
                            </span>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(
                                    a.status
                                )}`}
                            >
                                {a.status}
                            </span>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}