// components/agenda/ModalDetalhes.tsx
"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Icone from "@/app/componentes/Icones";
import { Agendamento, StatusAgendamento } from "../types/agenda";

interface Props {
    agendamento: Agendamento;
    onFechar: () => void;
    onAlterarStatus: (id: string, status: StatusAgendamento) => void;
    onExcluir: (id: string) => void;
}

export default function ModalDetalhes({
    agendamento,
    onFechar,
    onAlterarStatus,
    onExcluir,
}: Props) {
    const statusOptions: StatusAgendamento[] = [
        "Pendente",
        "Pago",
        "Cancelado",
        "Finalizado",
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                {/* CABEÇALHO */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-950">
                        Detalhes do Agendamento
                    </h2>
                    <button
                        onClick={onFechar}
                        className="text-slate-400 transition hover:text-slate-700"
                    >
                        <Icone tipo="fechar" className="h-5 w-5" />
                    </button>
                </div>

                {/* INFORMAÇÕES */}
                <div className="space-y-3 rounded-lg bg-slate-50 p-4">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-sm text-slate-500">Cliente</span>
                        <span className="text-sm font-medium text-slate-900">
                            {agendamento.clienteNome}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-sm text-slate-500">Telefone</span>
                        <span className="text-sm font-medium text-slate-900">
                            {agendamento.clienteFone}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-sm text-slate-500">Serviço</span>
                        <span className="text-sm font-medium text-slate-900">
                            {agendamento.servicoNome}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-sm text-slate-500">Profissional</span>
                        <span className="text-sm font-medium text-slate-900">
                            {agendamento.profissionalNome}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-sm text-slate-500">Data</span>
                        <span className="text-sm font-medium text-slate-900">
                            {format(parseISO(agendamento.data), "dd/MM/yyyy", {
                                locale: ptBR,
                            })}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-sm text-slate-500">Horário</span>
                        <span className="text-sm font-medium text-slate-900">
                            {agendamento.horario}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-sm text-slate-500">Valor</span>
                        <span className="text-sm font-bold text-slate-900">
                            R$ {agendamento.valor.toFixed(2).replace(".", ",")}
                        </span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-slate-500">Status</span>
                        <select
                            value={agendamento.status}
                            onChange={(e) =>
                                onAlterarStatus(
                                    agendamento.id,
                                    e.target.value as StatusAgendamento
                                )
                            }
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                        >
                            {statusOptions.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* AÇÕES */}
                <div className="mt-4 flex gap-3">
                    <button
                        onClick={onFechar}
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        Fechar
                    </button>
                    <button
                        onClick={() => onExcluir(agendamento.id)}
                        className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
}