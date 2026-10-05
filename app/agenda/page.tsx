"use client";

import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import {
    format,
    addDays,
    subDays,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfDay,
    endOfDay,
    isWithinInterval,
    parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import VisaoDia from "./componentes/VisaoDia";
import VisaoSemana from "./componentes/VisaoSemana";
import VisaoMes from "./componentes/VisaoMes";
import ModalDetalhes from "./componentes/ModalDetalhes";
import ModalEncaixe from "./componentes/ModalEncaixe";
import BotaoEncaixe from "./componentes/BotaoEncaixe";
import { Agendamento, HorarioFuncionamento, Profissional, Servico, StatusAgendamento } from "./types/agenda";

const HORARIOS_FUNCIONAMENTO_PADRAO: HorarioFuncionamento[] = [
    { dia: "segunda", ativo: true, abertura: "09:00", fechamento: "20:00", almocoInicio: "12:00", almocoFim: "13:00" },
    { dia: "terca", ativo: true, abertura: "09:00", fechamento: "20:00", almocoInicio: "12:00", almocoFim: "13:00" },
    { dia: "quarta", ativo: true, abertura: "09:00", fechamento: "20:00", almocoInicio: "12:00", almocoFim: "13:00" },
    { dia: "quinta", ativo: true, abertura: "09:00", fechamento: "20:00", almocoInicio: "12:00", almocoFim: "13:00" },
    { dia: "sexta", ativo: true, abertura: "09:00", fechamento: "20:00", almocoInicio: "12:00", almocoFim: "13:00" },
    { dia: "sabado", ativo: true, abertura: "09:00", fechamento: "18:00" },
    { dia: "domingo", ativo: false, abertura: "09:00", fechamento: "14:00" },
];

const mapStatusDbParaUi = (status: string): StatusAgendamento => {
    switch (status) {
        case "PENDENTE":
            return "Pendente";
        case "CONFIRMADO":
            return "Pago";
        case "CANCELADO":
            return "Cancelado";
        case "CONCLUIDO":
            return "Finalizado";
        default:
            return "Pendente";
    }
};

const mapStatusUiParaDb = (status: StatusAgendamento) => {
    switch (status) {
        case "Pendente":
            return "PENDENTE";
        case "Pago":
            return "CONFIRMADO";
        case "Cancelado":
            return "CANCELADO";
        case "Finalizado":
            return "CONCLUIDO";
        default:
            return "PENDENTE";
    }
};

export default function Agenda() {
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [profissionais, setProfissionais] = useState<Profissional[]>([]);
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [estabelecimento, setEstabelecimento] = useState<{ id: string; slug: string; name: string; primaryColor: string } | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [dataAtual, setDataAtual] = useState(new Date());
    const [visualizacao, setVisualizacao] = useState<"dia" | "semana" | "mes">("dia");
    const [filtroProfissional, setFiltroProfissional] = useState("todos");
    const [filtroStatus, setFiltroStatus] = useState<StatusAgendamento | "todos">("todos");
    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null);
    const [modalEncaixeAberto, setModalEncaixeAberto] = useState(false);

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const response = await fetch("/api/owner/agenda");
                const data = await response.json();

                if (!data.estabelecimento) {
                    setAgendamentos([]);
                    setProfissionais([]);
                    setServicos([]);
                    setEstabelecimento(null);
                    return;
                }

                const agendamentosMapeados: Agendamento[] = (data.estabelecimento.agendamentos ?? []).map((item: any) => {
                    const dataHora = new Date(item.dataHora);
                    const servico = data.estabelecimento.servicos.find((s: any) => s.id === item.servicoId);
                    const profissional = data.estabelecimento.profissionais.find((p: any) => p.id === item.profissionalId);

                    return {
                        id: item.id,
                        data: dataHora.toISOString(),
                        horario: format(dataHora, "HH:mm"),
                        clienteNome: item.clienteNome,
                        clienteFone: item.clienteFone,
                        servicoNome: servico?.nome ?? "Serviço",
                        servicoId: item.servicoId,
                        profissionalId: item.profissionalId,
                        profissionalNome: profissional?.nome ?? "Profissional",
                        valor: Number(item.preco ?? servico?.preco ?? 0),
                        duracao: servico?.duracao ?? 30,
                        status: mapStatusDbParaUi(item.status),
                    };
                });

                setEstabelecimento({
                    id: data.estabelecimento.id,
                    slug: data.estabelecimento.slug,
                    name: data.estabelecimento.name,
                    primaryColor: data.estabelecimento.primaryColor ?? "#1a1a2e",
                });
                setProfissionais(data.estabelecimento.profissionais ?? []);
                setServicos(data.estabelecimento.servicos ?? []);
                setAgendamentos(agendamentosMapeados);
            } catch (error) {
                console.error("Erro ao carregar agenda", error);
                setAgendamentos([]);
                setProfissionais([]);
                setServicos([]);
                setEstabelecimento(null);
            } finally {
                setCarregando(false);
            }
        };

        carregarDados();
    }, []);

    const agendamentosFiltrados = useMemo(() => {
        return agendamentos.filter((a) => {
            const profissionalOk = filtroProfissional === "todos" || a.profissionalId === filtroProfissional;
            const statusOk = filtroStatus === "todos" || a.status === filtroStatus;
            return profissionalOk && statusOk;
        });
    }, [agendamentos, filtroProfissional, filtroStatus]);

    const quantidadeNoPeriodo = useMemo(() => {
        const inicio = visualizacao === "dia"
            ? startOfDay(dataAtual)
            : visualizacao === "semana"
                ? startOfWeek(dataAtual, { locale: ptBR })
                : startOfMonth(dataAtual);
        const fim = visualizacao === "dia"
            ? endOfDay(dataAtual)
            : visualizacao === "semana"
                ? endOfWeek(dataAtual, { locale: ptBR })
                : endOfMonth(dataAtual);

        return agendamentosFiltrados.filter((agendamento) =>
            isWithinInterval(parseISO(agendamento.data), { start: inicio, end: fim })
        ).length;
    }, [agendamentosFiltrados, dataAtual, visualizacao]);

    const handleAnterior = () => {
        if (visualizacao === "dia") setDataAtual(subDays(dataAtual, 1));
        else if (visualizacao === "semana") setDataAtual(subDays(dataAtual, 7));
        else setDataAtual(subMonths(dataAtual, 1));
    };

    const handleProximo = () => {
        if (visualizacao === "dia") setDataAtual(addDays(dataAtual, 1));
        else if (visualizacao === "semana") setDataAtual(addDays(dataAtual, 7));
        else setDataAtual(addMonths(dataAtual, 1));
    };

    const handleHoje = () => setDataAtual(new Date());

    const tituloData = useMemo(() => {
        if (visualizacao === "dia") {
            return format(dataAtual, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
        }
        if (visualizacao === "semana") {
            const inicio = startOfWeek(dataAtual, { locale: ptBR });
            const fim = endOfWeek(dataAtual, { locale: ptBR });
            return `${format(inicio, "dd MMM", { locale: ptBR })} - ${format(fim, "dd MMM yyyy", { locale: ptBR })}`;
        }
        return format(dataAtual, "MMMM 'de' yyyy", { locale: ptBR });
    }, [dataAtual, visualizacao]);

    const handleAlterarStatus = async (id: string, novoStatus: StatusAgendamento) => {
        try {
            const response = await fetch(`/api/agendamentos/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: novoStatus }),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar status do agendamento.");
            }

            setAgendamentos((prev) =>
                prev.map((a) => (a.id === id ? { ...a, status: novoStatus } : a))
            );
            setAgendamentoSelecionado(null);
        } catch (error) {
            console.error(error);
            alert("Não foi possível atualizar o status.");
        }
    };

    const handleExcluir = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;

        try {
            const response = await fetch(`/api/agendamentos/${id}`, { method: "DELETE" });

            if (!response.ok) {
                throw new Error("Erro ao excluir agendamento.");
            }

            setAgendamentos((prev) => prev.filter((a) => a.id !== id));
            setAgendamentoSelecionado(null);
        } catch (error) {
            console.error(error);
            alert("Não foi possível excluir o agendamento.");
        }
    };

    const handleCriarEncaixe = async (encaixe: {
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
    }) => {
        if (!estabelecimento) {
            alert("Cadastre o seu negócio antes de criar um encaixe.");
            return;
        }

        try {
            const response = await fetch("/api/agendamentos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    estabelecimentoId: estabelecimento.id,
                    profissionalId: encaixe.profissionalId,
                    servicoId: encaixe.servicoId,
                    dataHora: new Date(`${encaixe.data}T${encaixe.horario}:00`).toISOString(),
                    clienteNome: encaixe.clienteNome,
                    clienteFone: encaixe.clienteFone,
                    descricao: "Agendamento manual",
                }),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.error || "Erro ao criar agendamento manual.");
            }

            const novoAgendamento: Agendamento = {
                id: payload.agendamento.id,
                data: new Date(`${encaixe.data}T${encaixe.horario}:00`).toISOString(),
                horario: encaixe.horario,
                clienteNome: encaixe.clienteNome,
                clienteFone: encaixe.clienteFone,
                servicoNome: encaixe.servicoNome,
                servicoId: encaixe.servicoId,
                profissionalId: encaixe.profissionalId,
                profissionalNome: encaixe.profissionalNome,
                valor: encaixe.valor,
                duracao: encaixe.duracao,
                status: "Pendente",
            };

            setAgendamentos((prev) => [novoAgendamento, ...prev]);
            setModalEncaixeAberto(false);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Erro ao criar agendamento manual.");
        }
    };

    if (!carregando && !estabelecimento) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16 text-center">
                <h1 className="text-2xl font-bold text-slate-900">Nenhum negócio encontrado</h1>
                <p className="mt-3 text-slate-600">Cadastre seu negócio e faça login para ver a agenda.</p>
                <div className="mt-6 flex justify-center gap-3">
                    <Link href="/cadastrar" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Criar conta</Link>
                    <Link href="/login" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">Entrar</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-0 py-4 sm:px-2 sm:py-6">
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Agenda</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Gerencie todos os agendamentos do seu negócio
                    </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                        href="/configuracoes/meuNegocio"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 hover:shadow-md sm:w-auto"
                    >
                        Configuração do negócio
                    </Link>
                    <BotaoEncaixe onClick={() => setModalEncaixeAberto(true)} />
                    <Link
                        href={estabelecimento ? `/agendar/${estabelecimento.slug}` : "/agendar/teste"}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-500 sm:w-auto"
                    >
                        + Novo Agendamento
                    </Link>
                </div>
            </div>

            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                    <div className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2 sm:min-w-[27rem]">
                        <button
                            onClick={handleAnterior}
                            aria-label="Ver período anterior"
                            title="Período anterior"
                            className="flex aspect-square items-center justify-center rounded-lg border border-slate-300 text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            ←
                        </button>

                        <div className="flex min-w-0 flex-col items-center gap-1">
                            <p className="text-center text-sm font-semibold capitalize text-slate-900">
                                {tituloData}
                            </p>
                            <span className="text-xs text-slate-500">
                                {quantidadeNoPeriodo} {quantidadeNoPeriodo === 1 ? "agendamento" : "agendamentos"}
                            </span>
                            <button
                                onClick={handleHoje}
                                className="rounded-md bg-slate-950 px-3 py-1 text-xs font-medium text-white transition hover:bg-slate-700"
                            >
                                Hoje
                            </button>
                        </div>

                        <button
                            onClick={handleProximo}
                            aria-label="Ver próximo período"
                            title="Próximo período"
                            className="flex aspect-square items-center justify-center rounded-lg border border-slate-300 text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full gap-1 rounded-lg bg-slate-100 p-1 sm:w-auto">
                    {(["dia", "semana", "mes"] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setVisualizacao(v)}
                            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition sm:flex-none ${visualizacao === v
                                ? "bg-slate-950 text-white"
                                : "text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {visualizacao === "dia" && (
                <VisaoDia
                    data={dataAtual}
                    agendamentos={agendamentosFiltrados}
                    onSelecionar={setAgendamentoSelecionado}
                />
            )}

            {visualizacao === "semana" && (
                <VisaoSemana
                    data={dataAtual}
                    agendamentos={agendamentosFiltrados}
                    onSelecionar={setAgendamentoSelecionado}
                />
            )}

            {visualizacao === "mes" && (
                <VisaoMes
                    data={dataAtual}
                    agendamentos={agendamentosFiltrados}
                    onSelecionar={setAgendamentoSelecionado}
                />
            )}

            {agendamentoSelecionado && (
                <ModalDetalhes
                    agendamento={agendamentoSelecionado}
                    onFechar={() => setAgendamentoSelecionado(null)}
                    onAlterarStatus={handleAlterarStatus}
                    onExcluir={handleExcluir}
                />
            )}

            {modalEncaixeAberto && estabelecimento && (
                <ModalEncaixe
                    agendamentos={agendamentos}
                    profissionais={profissionais}
                    servicos={servicos}
                    horariosFuncionamento={HORARIOS_FUNCIONAMENTO_PADRAO}
                    onFechar={() => setModalEncaixeAberto(false)}
                    onCriar={handleCriarEncaixe}
                />
            )}
        </div>
    );
}