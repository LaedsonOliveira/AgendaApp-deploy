// components/agenda/VisaoMes.tsx
"use client";

import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    addDays,
    isSameMonth,
    isSameDay,
    parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Agendamento } from "../types/agenda";

interface Props {
    data: Date;
    agendamentos: Agendamento[];
    onSelecionar: (agendamento: Agendamento) => void;
}

export default function VisaoMes({ data, agendamentos, onSelecionar }: Props) {
    const inicioMes = startOfMonth(data);
    const fimMes = endOfMonth(data);
    const inicioCalendario = startOfWeek(inicioMes, { locale: ptBR });
    const fimCalendario = endOfWeek(fimMes, { locale: ptBR });

    const dias: Date[] = [];
    let diaAtual = inicioCalendario;
    while (diaAtual <= fimCalendario) {
        dias.push(diaAtual);
        diaAtual = addDays(diaAtual, 1);
    }

    const getAgendamentosDoDia = (dia: Date) => {
        return agendamentos.filter((a) => isSameDay(parseISO(a.data), dia));
    };

    const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="min-w-[620px]">
                {/* CABEÇALHO DOS DIAS */}
                <div className="mb-2 grid grid-cols-7 gap-1">
                    {diasDaSemana.map((d) => (
                        <div
                            key={d}
                            className="py-2 text-center text-[10px] font-medium uppercase text-slate-500 sm:text-xs"
                        >
                            {d}
                        </div>
                    ))}
                </div>

                {/* DIAS */}
                <div className="grid grid-cols-7 gap-1">
                    {dias.map((dia) => {
                        const isMesAtual = isSameMonth(dia, data);
                        const isHoje = isSameDay(dia, new Date());
                        const ags = getAgendamentosDoDia(dia);

                        return (
                            <div
                                key={dia.toISOString()}
                                className={`min-h-[90px] rounded-lg border p-1.5 transition sm:min-h-[100px] sm:p-2 ${isMesAtual
                                    ? "border-slate-200 bg-white"
                                    : "border-slate-100 bg-slate-50"
                                    } ${isHoje ? "ring-2 ring-slate-950" : ""}`}
                            >
                                <div
                                    className={`mb-1 text-[10px] font-semibold sm:text-xs ${isMesAtual ? "text-slate-900" : "text-slate-400"
                                        } ${isHoje ? "text-slate-950" : ""}`}
                                >
                                    {format(dia, "dd")}
                                </div>
                                <div className="space-y-1">
                                    {ags.slice(0, 3).map((a) => (
                                        <button
                                            key={a.id}
                                            onClick={() => onSelecionar(a)}
                                            className={`w-full truncate rounded px-1 py-0.5 text-left text-[9px] transition hover:opacity-80 sm:text-[10px] ${a.status === "Pago"
                                                ? "bg-green-100 text-green-800"
                                                : a.status === "Pendente"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : a.status === "Cancelado"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }`}
                                        >
                                            {a.horario} {a.clienteNome}
                                        </button>
                                    ))}
                                    {ags.length > 3 && (
                                        <div className="pl-1 text-[9px] text-slate-500 sm:text-[10px]">
                                            +{ags.length - 3} mais
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}