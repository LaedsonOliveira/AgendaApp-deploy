"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Agendamento {
  id: string;
  dataHora: string;
  status: string;
  preco: number | string;
  estabelecimento: { slug: string; name: string };
  servico: { nome: string; duracao: number };
  profissional: { nome: string };
}

const statusLabel: Record<string, string> = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Confirmado",
  CANCELADO: "Cancelado",
  CONCLUIDO: "Concluído",
};

export default function ConsultaAgendamentos({ slug }: { slug: string | null }) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let mounted = true;
    fetch("/api/agendamentos/me")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Não foi possível consultar os agendamentos.");
        return data.agendamentos as Agendamento[];
      })
      .then((items) => {
        if (mounted) {
          setAgendamentos(slug ? items.filter((item) => item.estabelecimento.slug === slug) : items);
        }
      })
      .catch((error) => {
        if (mounted) setErro(error instanceof Error ? error.message : "Não foi possível consultar os agendamentos.");
      })
      .finally(() => {
        if (mounted) setCarregando(false);
      });
    return () => { mounted = false; };
  }, [slug]);

  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl px-4 py-10 sm:px-6">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Sua conta</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Agendamentos</h1>
      </header>

      {carregando && <p className="py-8 text-sm text-slate-600">Carregando agendamentos...</p>}
      {erro && <p role="alert" className="py-8 text-sm text-red-600">{erro}</p>}
      {!carregando && !erro && agendamentos.length === 0 && (
        <div className="py-10">
          <p className="text-sm text-slate-600">Nenhum agendamento encontrado.</p>
          {slug && (
            <Link href={`/agendar/${slug}`} className="mt-4 inline-flex rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700">
              Agendar horário
            </Link>
          )}
        </div>
      )}

      <ul className="divide-y divide-slate-200">
        {agendamentos.map((agendamento) => (
          <li key={agendamento.id} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <Link href={`/${agendamento.estabelecimento.slug}`} className="font-semibold text-slate-900 hover:underline">
                {agendamento.estabelecimento.name}
              </Link>
              <p className="mt-1 text-sm text-slate-700">{agendamento.servico.nome} com {agendamento.profissional.nome}</p>
              <p className="mt-1 text-sm text-slate-500">
                {new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "short" }).format(new Date(agendamento.dataHora))}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm font-semibold">{statusLabel[agendamento.status] ?? agendamento.status}</p>
              <p className="mt-1 text-sm text-slate-600">
                {Number(agendamento.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}