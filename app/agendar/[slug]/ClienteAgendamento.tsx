// app/agendar/[slug]/ClienteAgendamento.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import Image from "next/image";
import Icone from "@/app/componentes/Icones";
import EtapaBarbeiro from "../componentes/EtapaBarbeiro";
import EtapaServico from "../componentes/EtapaServico";
import EtapaData from "../componentes/EtapaData";
import EtapaDadosCliente from "../componentes/EtapaDadosCliente";
import ConfirmacaoAgendamento from "../componentes/ConfirmacaoAgendamento";

// ========================================
// TIPOS
// ========================================
interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  duracao: number;
  profissionais: string[];
}

interface Profissional {
  id: string;
  nome: string;
}

interface AgendamentoExistente {
  dataHora: string;
  profissionalId: string;
  duracao: number;
}

interface HorarioFuncionamento {
  dia: string;
  ativo: boolean;
  abertura: string;
  fechamento: string;
  almocoInicio: string | null;
  almocoFim: string | null;
}

interface Estabelecimento {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  banner: string | null;
  primaryColor: string;
  servicos: Servico[];
  profissionais: Profissional[];
  horarios: HorarioFuncionamento[];
  agendamentos: AgendamentoExistente[];
}

interface Props {
  estabelecimento: Estabelecimento;
  slug: string;
}

// ========================================
// ETAPAS
// ========================================
const ETAPAS = {
  BARBEIRO: 0,
  SERVICO: 1,
  DATA: 2,
  DADOS: 3,
  CONFIRMACAO: 4,
} as const;

type Etapa = (typeof ETAPAS)[keyof typeof ETAPAS];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export default function ClienteAgendamento({ estabelecimento }: Props) {
  const [etapaAtual, setEtapaAtual] = useState<Etapa>(ETAPAS.BARBEIRO);

  // Seleções do cliente
  const [profissionalSelecionado, setProfissionalSelecionado] =
    useState<Profissional | null>(null);
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(
    null
  );
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(
    null
  );

  // Dados do cliente
  const [nomeCliente, setNomeCliente] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [telefoneCliente, setTelefoneCliente] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("telefone") ?? "";
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then(({ user }) => {
        if (!mounted || !user) return;
        setNomeCliente(user.name);
        setTelefoneCliente(user.telefone);
        setClienteEmail(user.email);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const cores = {
    primary: estabelecimento.primaryColor || "#1a1a2e",
    secondary: estabelecimento.primaryColor || "#e94560",
  };

  // ========================================
  // NAVEGAÇÃO
  // ========================================
  const avancarEtapa = () => {
    setEtapaAtual((atual) => Math.min(atual + 1, ETAPAS.CONFIRMACAO) as Etapa);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const voltarEtapa = () => {
    setEtapaAtual((atual) => Math.max(atual - 1, ETAPAS.BARBEIRO) as Etapa);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ========================================
  // HORÁRIOS DISPONÍVEIS
  // ========================================
  const horariosDisponiveis = useMemo(() => {
    if (!dataSelecionada || !profissionalSelecionado) return [];

    const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
    const horarioEmpresa = estabelecimento.horarios.find(
      (horario) => horario.dia === diasSemana[dataSelecionada.getDay()]
    );
    if (estabelecimento.horarios.length && !horarioEmpresa?.ativo) return [];

    const minutosDoDia = (hora: string) => {
      const [horas, minutos] = hora.split(":").map(Number);
      return horas * 60 + minutos;
    };
    const abertura = horarioEmpresa ? minutosDoDia(horarioEmpresa.abertura) : 8 * 60;
    const fechamento = horarioEmpresa ? minutosDoDia(horarioEmpresa.fechamento) : 19 * 60 + 30;
    const duracao = servicoSelecionado?.duracao ?? 30;

    const ocupados = estabelecimento.agendamentos
      .filter((ag) => {
        const dataAg = parseISO(ag.dataHora);
        return (
          isSameDay(dataAg, dataSelecionada) &&
          ag.profissionalId === profissionalSelecionado.id
        );
      })
      .map((ag) => ({
        inicio: minutosDoDia(format(parseISO(ag.dataHora), "HH:mm")),
        duracao: ag.duracao,
      }));

    const horarios: string[] = [];
    for (let inicio = abertura; inicio + duracao <= fechamento; inicio += 30) {
      const fim = inicio + duracao;
      const conflitaAlmoco = horarioEmpresa?.almocoInicio && horarioEmpresa.almocoFim
        ? inicio < minutosDoDia(horarioEmpresa.almocoFim) && fim > minutosDoDia(horarioEmpresa.almocoInicio)
        : false;
      const conflitaAgendamento = ocupados.some((agendamento) =>
        inicio < agendamento.inicio + agendamento.duracao && fim > agendamento.inicio
      );
      if (conflitaAlmoco || conflitaAgendamento) continue;
      horarios.push(`${String(Math.floor(inicio / 60)).padStart(2, "0")}:${String(inicio % 60).padStart(2, "0")}`);
    }
    return horarios;
  }, [dataSelecionada, profissionalSelecionado, servicoSelecionado, estabelecimento.agendamentos, estabelecimento.horarios]);

  // ========================================
  // CONFIRMAR AGENDAMENTO
  // ========================================
  const handleConfirmar = async () => {
    if (
      !profissionalSelecionado ||
      !servicoSelecionado ||
      !dataSelecionada ||
      !horarioSelecionado
    ) {
      alert("Preencha todos os dados!");
      return;
    }

    setLoading(true);

    try {
      const dataHora = new Date(`${format(dataSelecionada, "yyyy-MM-dd")}T${horarioSelecionado}:00`);
      const response = await fetch("/api/agendamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estabelecimentoId: estabelecimento.id,
          profissionalId: profissionalSelecionado.id,
          servicoId: servicoSelecionado.id,
          dataHora: dataHora.toISOString(),
          clienteNome: nomeCliente.trim(),
          clienteFone: telefoneCliente.trim(),
          clienteEmail,
          descricao: `Agendamento via site - ${servicoSelecionado.nome}`,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Erro ao agendar.");
      }

      avancarEtapa();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao agendar. Tente novamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDERIZAR ETAPA
  // ========================================
  const handleSelectData = (novaData: Date) => {
    setDataSelecionada(novaData);
    setHorarioSelecionado(null);
  };

  const renderEtapa = () => {
    switch (etapaAtual) {
      case ETAPAS.BARBEIRO:
        return (
          <EtapaBarbeiro
            profissionais={estabelecimento.profissionais}
            selecionado={profissionalSelecionado}
            onSelect={setProfissionalSelecionado}
            onNext={avancarEtapa}
            cores={cores}
          />
        );
      case ETAPAS.SERVICO:
        return (
          <EtapaServico
            servicos={estabelecimento.servicos.filter((servico) =>
              servico.profissionais.length === 0 || servico.profissionais.includes(profissionalSelecionado?.id ?? "")
            )}
            selecionado={servicoSelecionado}
            onSelect={setServicoSelecionado}
            onNext={avancarEtapa}
            onBack={voltarEtapa}
            cores={cores}
          />
        );
      case ETAPAS.DATA:
        return (
          <EtapaData
            dataSelecionada={dataSelecionada}
            horarioSelecionado={horarioSelecionado}
            horarios={horariosDisponiveis}
            onSelect={handleSelectData}
            onSelectHorario={setHorarioSelecionado}
            onNext={avancarEtapa}
            onBack={voltarEtapa}
            cores={cores}
          />
        );
      case ETAPAS.DADOS:
        return (
          <EtapaDadosCliente
            nome={nomeCliente}
            setNome={setNomeCliente}
            telefone={telefoneCliente}
            setTelefone={setTelefoneCliente}
            onNext={handleConfirmar}
            onBack={voltarEtapa}
            loading={loading}
            cores={cores}
          />
        );
      case ETAPAS.CONFIRMACAO:
        return (
          <ConfirmacaoAgendamento
            estabelecimento={estabelecimento}
            profissional={profissionalSelecionado!}
            servico={servicoSelecionado!}
            data={dataSelecionada!}
            horario={horarioSelecionado!}
            clienteNome={nomeCliente}
            cores={cores}
            onVoltar={voltarEtapa}
          />
        );
      default:
        return null;
    }
  };

  // ========================================
  // PROGRESSO DAS ETAPAS
  // ========================================
  const etapasLista = Object.keys(ETAPAS).filter(
    (key) => isNaN(Number(key))
  ) as (keyof typeof ETAPAS)[];

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== HEADER COM BANNER E LOGO CENTRALIZADOS ===== */}
      <div
        className="relative bg-cover bg-center pt-8"
        style={{
          backgroundColor: cores.primary,
          backgroundImage: estabelecimento.banner
            ? `url(${estabelecimento.banner})`
            : "none",
        }}
      >
        {/* Overlay escuro sobre o banner */}
        {estabelecimento.banner && (
          <div className="absolute inset-0 bg-black/40" />
        )}

        {/* Conteúdo centralizado */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Logo - centralizada */}
          <div className="flex justify-center">
            {estabelecimento.logoUrl ? (
              <Image
                src={estabelecimento.logoUrl}
                alt={estabelecimento.name}
                width={96}
                height={96}
                unoptimized
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-white/10 text-4xl shadow-lg text-white">
                <Icone tipo="tesoura" className="h-10 w-10" />
              </div>
            )}
          </div>

          {/* Nome do negócio - centralizado */}
          <h1
            className="mt-3 text-2xl font-bold"
            style={{ color: cores.secondary }}
          >
            {estabelecimento.name}
          </h1>

          {/* Subtítulo - centralizado */}
          <p className="mt-1 text-sm text-white/80">
            Agende seu horário de forma rápida e fácil
          </p>
          <span className="mt-3 inline-block text-sm font-semibold text-white/90">
            Agendamento autenticado
          </span>

          {/* Espaço extra no final */}
          <div className="pb-6"></div>
        </div>
      </div>

      {/* ===== CONTEÚDO ===== */}
      <div className="container mx-auto max-w-2xl px-3 py-5 sm:px-4 sm:py-8">
        <div className="rounded-2xl bg-white p-4 shadow-lg sm:p-6">
          {/* PROGRESSO */}
          <div className="mb-6 flex items-center justify-between gap-1 sm:gap-2">
            {etapasLista.map((key, index) => {
              const isConcluida = index < etapaAtual;
              const isAtiva = index === etapaAtual;

              return (
                <div key={key} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${isConcluida
                      ? "bg-green-500 text-white"
                      : isAtiva
                        ? "text-white"
                        : "bg-slate-200 text-slate-500"
                      }`}
                    style={isAtiva ? { backgroundColor: cores.secondary } : {}}
                  >
                    {isConcluida ? <Icone tipo="check" className="h-4 w-4" /> : index + 1}
                  </div>
                  {index < etapasLista.length - 1 && (
                    <div
                      className={`h-0.5 min-w-2 flex-1 transition sm:max-w-8 ${isConcluida ? "bg-green-500" : "bg-slate-200"
                        }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* ETAPA ATUAL */}
          {renderEtapa()}
        </div>
      </div>
    </div>
  );
}