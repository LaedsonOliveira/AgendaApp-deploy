"use client";

import { useSearchParams } from "next/navigation";
import { startTransition, useState, useEffect } from "react";
import { Suspense } from "react";
import Link from "next/link";
import {
    DadosNegocio,
    Servico,
    Barbeiro,
    HorarioDia,
    Personalizacao
} from "./types";
import AbaDados from "./componentes/AbaDados";
import AbaServicos from "./componentes/AbaServicos";
import AbaBarbeiros from "./componentes/AbaBarbeiros";
import AbaHorarios from "./componentes/AbaHorarios";
import AbaPersonalizacao from "./componentes/AbaPersonalizacao";

// Dados mockados iniciais
const dadosMock: DadosNegocio = {
    nome: "",
    descricao: "",
    telefone: "",
    email: "",
    cnpj: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: ""
};

const horariosMock: HorarioDia[] = [
    { dia: "segunda", ativo: true, abertura: "09:00", fechamento: "20:00", almocoInicio: "12:00", almocoFim: "13:00" },
    { dia: "terca", ativo: true, abertura: "09:00", fechamento: "20:00", almocoInicio: "12:00", almocoFim: "13:00" },
    { dia: "quarta", ativo: true, abertura: "09:00", fechamento: "20:00", almocoInicio: "12:00", almocoFim: "13:00" },
    { dia: "quinta", ativo: true, abertura: "09:00", fechamento: "20:00", almocoInicio: "12:00", almocoFim: "13:00" },
    { dia: "sexta", ativo: true, abertura: "09:00", fechamento: "20:00", almocoInicio: "12:00", almocoFim: "13:00" },
    { dia: "sabado", ativo: true, abertura: "09:00", fechamento: "18:00" },
    { dia: "domingo", ativo: false, abertura: "09:00", fechamento: "14:00" },
];

const personalizacaoMock: Personalizacao = {
    nomeNegocio: "",
    corPrimaria: "#1a1a2e",
    corSecundaria: "#e94560",
    logo: null,
    banner: null,
    mensagemBoasVindas: "",
    instagram: "",
    facebook: "",
    whatsapp: ""
};

function MeuNegocioConteudo() {
    const searchParams = useSearchParams();
    const [abaAtiva, setAbaAtiva] = useState("dados");
    const [usuarioCarregado, setUsuarioCarregado] = useState(false);
    const [slugEstabelecimento, setSlugEstabelecimento] = useState("");
    const [dados, setDados] = useState(dadosMock);
    const [servicos, setServicos] = useState<Servico[]>([]);
    const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([]);
    const [horarios, setHorarios] = useState(horariosMock);
    const [personalizacao, setPersonalizacao] = useState(personalizacaoMock);

    useEffect(() => {
        const aba = searchParams.get("aba");
        if (aba) {
            startTransition(() => setAbaAtiva(aba));
        }
    }, [searchParams]);

    useEffect(() => {
        const carregarPerfil = async () => {
            try {
                const response = await fetch("/api/owner/me");
                const data = await response.json();

                if (data.owner?.estabelecimento) {
                    const estabelecimento = data.owner.estabelecimento;
                    setSlugEstabelecimento(estabelecimento.slug ?? "");
                    setDados({
                        nome: estabelecimento.name ?? "",
                        descricao: estabelecimento.description ?? "",
                        telefone: estabelecimento.telefone ?? "",
                        email: estabelecimento.email ?? "",
                        cnpj: estabelecimento.cnpj ?? "",
                        endereco: estabelecimento.endereco ?? "",
                        cidade: estabelecimento.cidade ?? "",
                        estado: estabelecimento.estado ?? "",
                        cep: estabelecimento.cep ?? "",
                    });
                    setServicos(estabelecimento.servicos.map((servico: Servico) => ({
                        ...servico,
                        barbeiros: servico.barbeiros ?? [],
                    })));
                    setBarbeiros(estabelecimento.profissionais.map((profissional: Barbeiro & { fotoUrl?: string | null }) => ({
                        ...profissional,
                        foto: profissional.fotoUrl ?? null,
                    })));
                    if (estabelecimento.horarios.length) {
                        setHorarios(estabelecimento.horarios.map((horario: HorarioDia) => ({
                            ...horario,
                            almocoInicio: horario.almocoInicio ?? "",
                            almocoFim: horario.almocoFim ?? "",
                        })));
                    }
                    setPersonalizacao((prev) => ({
                        ...prev,
                        nomeNegocio: estabelecimento.name ?? "",
                        corPrimaria: estabelecimento.primaryColor ?? "#1a1a2e",
                        corSecundaria: estabelecimento.secondaryColor ?? "#e94560",
                        logo: estabelecimento.logoUrl ?? null,
                        banner: estabelecimento.banner ?? null,
                        mensagemBoasVindas: estabelecimento.welcomeMessage ?? "",
                        instagram: estabelecimento.instagram ?? "",
                        facebook: estabelecimento.facebook ?? "",
                        whatsapp: estabelecimento.whatsapp ?? "",
                    }));
                }
            } catch {
                // ignora quando não há perfil autenticado
            } finally {
                setUsuarioCarregado(true);
            }
        };

        carregarPerfil();
    }, []);

    const requisitarApi = async (url: string, method: string, body?: unknown) => {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Não foi possível salvar.");
        return data;
    };

    const salvarDados = async () => {
        const data = await requisitarApi("/api/owner/me", "PATCH", {
            name: dados.nome,
            description: dados.descricao,
            telefone: dados.telefone,
            email: dados.email,
            cnpj: dados.cnpj,
            endereco: dados.endereco,
            cidade: dados.cidade,
            estado: dados.estado,
            cep: dados.cep,
        });
        setPersonalizacao((atual) => ({ ...atual, nomeNegocio: data.estabelecimento.name }));
    };

    const salvarPersonalizacao = async () => {
        const data = await requisitarApi("/api/owner/me", "PATCH", {
            name: personalizacao.nomeNegocio,
            logoUrl: personalizacao.logo,
            banner: personalizacao.banner,
            primaryColor: personalizacao.corPrimaria,
            secondaryColor: personalizacao.corSecundaria,
            welcomeMessage: personalizacao.mensagemBoasVindas,
            instagram: personalizacao.instagram ?? "",
            facebook: personalizacao.facebook ?? "",
            whatsapp: personalizacao.whatsapp ?? "",
        });
        setDados((atual) => ({ ...atual, nome: data.estabelecimento.name }));
    };

    const salvarServico = async (servico: Servico, editando: boolean) => {
        const data = await requisitarApi(
            editando ? `/api/owner/servicos/${servico.id}` : "/api/owner/servicos",
            editando ? "PATCH" : "POST",
            servico
        );
        return data.servico as Servico;
    };

    const excluirServico = async (id: string) => {
        await requisitarApi(`/api/owner/servicos/${id}`, "DELETE");
    };

    const salvarBarbeiro = async (barbeiro: Barbeiro, editando: boolean) => {
        const data = await requisitarApi(
            editando ? `/api/owner/profissionais/${barbeiro.id}` : "/api/owner/profissionais",
            editando ? "PATCH" : "POST",
            barbeiro
        );
        return data.profissional as Barbeiro;
    };

    const excluirBarbeiro = async (id: string) => {
        await requisitarApi(`/api/owner/profissionais/${id}`, "DELETE");
    };

    const salvarHorarios = async (valores: HorarioDia[]) => {
        const data = await requisitarApi("/api/owner/horarios", "PATCH", { horarios: valores });
        setHorarios(data.horarios.map((horario: HorarioDia) => ({
            ...horario,
            almocoInicio: horario.almocoInicio ?? "",
            almocoFim: horario.almocoFim ?? "",
        })));
    };

    const abas = [
        { id: "dados", label: "Dados do Negócio" },
        { id: "servicos", label: "Serviços" },
        { id: "barbeiros", label: "Funcionários" },
        { id: "horarios", label: "Horários" },
        { id: "personalizacao", label: "Personalização" },
    ];

    return (
        <div className="mx-auto w-full max-w-6xl space-y-5 pb-10 text-slate-900 sm:space-y-8">
            <header className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center justify-between gap-4">
                    <div className="space-y-2 pt-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Configurações do Negócio</h1>
                        <p className="max-w-2xl text-sm leading-6 text-slate-500">Gerencie as informações que seus clientes vão ver na página de agendamento</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/agenda"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
                        >
                            Ir para agenda
                        </Link>
                        {!usuarioCarregado && (
                            <span className="text-xs text-slate-500">Carregando...</span>
                        )}
                        {usuarioCarregado && slugEstabelecimento && (
                            <Link
                                href={`/${slugEstabelecimento}`}
                                target="_blank"
                                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                            >
                                Ver página pública
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Abas */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
                <div className="flex min-w-max gap-1">
                    {abas.map((aba) => (
                        <button
                            key={aba.id}
                            type="button"
                            onClick={() => setAbaAtiva(aba.id)}
                            className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 ${abaAtiva === aba.id
                                ? "bg-slate-950 text-white shadow-sm"
                                : "text-slate-600 hover:bg-white hover:text-slate-950"
                                }`}
                        >
                            {aba.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conteúdo das abas */}
            <div className="min-w-0">
                {abaAtiva === "dados" && (
                    <AbaDados dados={dados} setDados={setDados} onSave={salvarDados} />
                )}
                {abaAtiva === "servicos" && (
                    <AbaServicos
                        servicos={servicos}
                        setServicos={setServicos}
                        barbeiros={barbeiros}
                        onSave={salvarServico}
                        onDelete={excluirServico}
                    />
                )}
                {abaAtiva === "barbeiros" && (
                    <AbaBarbeiros
                        barbeiros={barbeiros}
                        setBarbeiros={setBarbeiros}
                        onSave={salvarBarbeiro}
                        onDelete={excluirBarbeiro}
                    />
                )}
                {abaAtiva === "horarios" && (
                    <AbaHorarios
                        horarios={horarios}
                        setHorarios={setHorarios}
                        onSave={salvarHorarios}
                    />
                )}
                {abaAtiva === "personalizacao" && (
                    <AbaPersonalizacao
                        personalizacao={personalizacao}
                        setPersonalizacao={setPersonalizacao}
                        onSave={salvarPersonalizacao}
                    />
                )}
            </div>
        </div>
    );
}

export default function MeuNegocio() {
    return (
        <Suspense fallback={<div className="min-h-48" />}>
            <MeuNegocioConteudo />
        </Suspense>
    );
}