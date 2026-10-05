// components/agenda/ModalEncaixe.tsx
"use client";

import { useMemo, useState } from "react";
import Icone from "@/app/componentes/Icones";
import { Agendamento, HorarioFuncionamento, Profissional, Servico } from "../types/agenda";
import { calcularHorarioEncaixe, ResultadoEncaixe } from "../lib/agenda";

interface EncaixeCriado {
    clienteNome: string;
    clienteFone: string;
    servicoNome: string;
    servicoId: string;
    profissionalId: string;
    profissionalNome: string;
    data: string;
    horario: string;
    duracao: number;
    valor: number;
    status: "Pendente";
}

interface Props {
    agendamentos: Agendamento[];
    profissionais: Profissional[];
    servicos: Servico[];
    horariosFuncionamento: HorarioFuncionamento[];
    onFechar: () => void;
    onCriar: (encaixe: EncaixeCriado) => void;
}

export default function ModalEncaixe({
    agendamentos,
    profissionais,
    servicos,
    horariosFuncionamento,
    onFechar,
    onCriar,
}: Props) {
    const [clienteNome, setClienteNome] = useState("");
    const [clienteFone, setClienteFone] = useState("");
    const [servicoId, setServicoId] = useState("");
    const [profissionalId, setProfissionalId] = useState("");
    const [erro, setErro] = useState("");

    const servicoSelecionado = servicos.find((s) => s.id === servicoId);

    const resultado = useMemo<ResultadoEncaixe | null>(() => {
        if (servicoSelecionado && profissionalId) {
            return calcularHorarioEncaixe(
                agendamentos,
                servicoSelecionado,
                profissionalId,
                horariosFuncionamento
            );
        }
        return null;
    }, [agendamentos, horariosFuncionamento, profissionalId, servicoSelecionado]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErro("");

        if (!clienteNome.trim()) {
            setErro("Informe o nome do cliente");
            return;
        }
        if (!servicoSelecionado) {
            setErro("Selecione um serviço");
            return;
        }
        if (!profissionalId) {
            setErro("Selecione um profissional");
            return;
        }
        if (!resultado) {
            setErro("Não foi possível calcular o horário");
            return;
        }

        const profissional = profissionais.find((p) => p.id === profissionalId);

        if (!resultado.disponivel) {
            setErro(resultado.mensagem);
            return;
        }

        onCriar({
            clienteNome: clienteNome.trim(),
            clienteFone: clienteFone.trim(),
            servicoNome: servicoSelecionado.nome,
            servicoId: servicoSelecionado.id,
            profissionalId,
            profissionalNome: profissional?.nome || "",
            data: resultado.data!,
            horario: resultado.horarioInicio,
            duracao: servicoSelecionado.duracao,
            valor: servicoSelecionado.preco,
            status: "Pendente",
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                {/* CABEÇALHO */}
                <div className="mb-5 flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950">
                            Atendimento Imediato
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Para clientes que chegaram sem agendamento
                        </p>
                    </div>
                    <button
                        onClick={onFechar}
                        className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        aria-label="Fechar"
                    >
                        <Icone tipo="fechar" className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* CLIENTE */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Nome do Cliente *
                            </label>
                            <input
                                type="text"
                                value={clienteNome}
                                onChange={(e) => setClienteNome(e.target.value)}
                                placeholder="João Silva"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Telefone
                            </label>
                            <input
                                type="tel"
                                value={clienteFone}
                                onChange={(e) => setClienteFone(e.target.value)}
                                placeholder="(81) 99999-9999"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                            />
                        </div>
                    </div>

                    {/* SERVIÇO + PROFISSIONAL */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Serviço *
                            </label>
                            <select
                                value={servicoId}
                                onChange={(e) => setServicoId(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                                required
                            >
                                <option value="">Selecione...</option>
                                {servicos.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nome} ({s.duracao} min)
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Profissional *
                            </label>
                            <select
                                value={profissionalId}
                                onChange={(e) => setProfissionalId(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                                required
                            >
                                <option value="">Selecione...</option>
                                {profissionais.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* RESULTADO DO CÁLCULO */}
                    {resultado && (
                        <div
                            className={`rounded-xl border p-4 ${resultado.conflito
                                ? "border-yellow-300 bg-yellow-50"
                                : "border-green-300 bg-green-50"
                                }`}
                        >
                            <div className="mb-3 flex items-center gap-2">
                                <span className="text-lg" aria-hidden="true">
                                    {resultado.conflito ? (
                                        <Icone tipo="alerta" className="h-5 w-5" />
                                    ) : (
                                        <Icone tipo="check-circle" className="h-5 w-5" />
                                    )}
                                </span>
                                <span
                                    className={`text-sm font-semibold ${resultado.conflito ? "text-yellow-800" : "text-green-800"
                                        }`}
                                >
                                    {resultado.mensagem}
                                </span>
                            </div>

                            {resultado.disponivel && (
                                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                                    <div>
                                        <span className="block text-xs text-slate-500">Início</span>
                                        <span className="font-bold text-slate-900">
                                            {resultado.horarioInicio}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-500">Fim</span>
                                        <span className="font-bold text-slate-900">
                                            {resultado.horarioFim}
                                        </span>
                                    </div>
                                    {servicoSelecionado && (
                                        <div>
                                            <span className="block text-xs text-slate-500">Duração</span>
                                            <span className="font-bold text-slate-900">
                                                {servicoSelecionado.duracao} min
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {resultado.disponivel && resultado.proximoAgendamento && (
                                <p className="mt-3 text-xs text-slate-600">
                                    Próximo agendamento às {resultado.proximoAgendamento}
                                </p>
                            )}
                        </div>
                    )}

                    {erro && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                            {erro}
                        </p>
                    )}

                    {/* BOTÕES */}
                    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={onFechar}
                            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!resultado?.disponivel}
                            className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Criar Encaixe
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}