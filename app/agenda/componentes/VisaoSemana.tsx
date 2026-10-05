// components/agenda/VisaoSemana.tsx
"use client";

import {
    format,
    startOfWeek,
    endOfWeek,
    addDays,
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

const HORARIOS = [
    "08:00", "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00",
];

export default function VisaoSemana({ data, agendamentos, onSelecionar }: Props) {
    const inicioSemana = startOfWeek(data, { locale: ptBR });
    const fimSemana = endOfWeek(data, { locale: ptBR });

    const diasDaSemana = Array.from({ length: 7 }, (_, i) =>
        addDays(inicioSemana, i)
    );

    const getAgendamentos = (dia: Date, horario: string) => {
        return agendamentos.filter((a) => {
            const dataAg = parseISO(a.data);
            return isSameDay(dataAg, dia) && a.horario === horario;
        });
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] text-sm sm:min-w-[760px]">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="w-20 px-3 py-3 text-left font-medium text-slate-500">
                            Hora
                        </th>
                        {diasDaSemana.map((dia) => {
                            const isHoje = isSameDay(dia, new Date());
                            return (
                                <th
                                    key={dia.toISOString()}
                                    className={`px-2 py-3 text-center font-medium sm:px-3 ${isHoje ? "text-slate-950" : "text-slate-500"
                                        }`}
                                >
                                    <div className="text-[10px] uppercase sm:text-xs">
                                        {format(dia, "EEE", { locale: ptBR })}
                                    </div>
                                    <div
                                        className={`text-base font-bold sm:text-lg ${isHoje ? "text-slate-950" : "text-slate-700"
                                            }`}
                                    >
                                        {format(dia, "dd")}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {HORARIOS.map((horario) => (
                        <tr key={horario} className="border-b border-slate-100 last:border-0">
                            <td className="px-3 py-2 text-[11px] font-medium text-slate-500 sm:text-xs">
                                {horario}
                            </td>
                            {diasDaSemana.map((dia) => {
                                const ags = getAgendamentos(dia, horario);
                                return (
                                    <td
                                        key={dia.toISOString()}
                                        className="px-1 py-1 align-top"
                                    >
                                        {ags.map((a) => (
                                            <button
                                                key={a.id}
                                                onClick={() => onSelecionar(a)}
                                                className={`w-full rounded-lg p-2 text-left text-[10px] transition hover:opacity-80 sm:text-xs ${a.status === "Pago"
                                                    ? "bg-green-100 text-green-800"
                                                    : a.status === "Pendente"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : a.status === "Cancelado"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-blue-100 text-blue-800"
                                                    }`}
                                            >
                                                <div className="truncate font-semibold">
                                                    {a.clienteNome}
                                                </div>
                                                <div className="truncate text-[9px] sm:text-[10px]">
                                                    {a.servicoNome}
                                                </div>
                                            </button>
                                        ))}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}