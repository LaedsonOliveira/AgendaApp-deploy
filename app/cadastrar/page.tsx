"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Suspense } from "react";

type TipoConta = "proprietario" | "cliente";

function CadastroConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [tipoConta, setTipoConta] = useState<TipoConta>("proprietario");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [password, setPassword] = useState("");
  const [estabelecimentoName, setEstabelecimentoName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(tipoConta === "cliente" ? "/api/client/register" : "/api/owner/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tipoConta === "cliente"
          ? { nome: name, email, telefone, password }
          : { name, email, telefone, password, estabelecimentoName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar conta.");
      }

      const safeDestination = returnTo?.startsWith("/") &&
        !returnTo.startsWith("//") &&
        !returnTo.startsWith("/\\")
        ? returnTo
        : null;
      const slugFromBooking = safeDestination?.match(/^\/agendar\/([^/?#]+)/)?.[1];
      const slugFromProfile = safeDestination?.match(/^\/([^/?#]+)\/?(?:[?#]|$)/)?.[1];
      const rotasFixas = new Set([
        "agenda",
        "agendar",
        "cadastrar",
        "configuracoes",
        "consultar-agendamentos",
        "login",
      ]);
      const slugParaAgendar = slugFromBooking ?? (
        slugFromProfile && !rotasFixas.has(slugFromProfile) ? slugFromProfile : null
      );
      router.push(tipoConta === "proprietario"
        ? "/configuracoes/meuNegocio?aba=dados"
        : slugParaAgendar
          ? `/agendar/${slugParaAgendar}`
          : safeDestination ?? "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Criar conta</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          {tipoConta === "cliente" ? "Conta de cliente" : "Conta do negócio"}
        </h1>

        <div className="mt-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1" aria-label="Tipo de conta">
          <button
            type="button"
            onClick={() => { setTipoConta("cliente"); setError(""); }}
            aria-pressed={tipoConta === "cliente"}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${tipoConta === "cliente" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Cliente
          </button>
          <button
            type="button"
            onClick={() => { setTipoConta("proprietario"); setError(""); }}
            aria-pressed={tipoConta === "proprietario"}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${tipoConta === "proprietario" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Proprietário
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {tipoConta === "cliente" ? "Nome completo" : "Nome do responsável"}
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
              placeholder={tipoConta === "cliente" ? "Seu nome" : "Ex: João da Barbearia"}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
              placeholder="contato@negocio.com"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Telefone</label>
            <input
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              type="tel"
              autoComplete="tel"
              required
              placeholder="(81) 99999-9999"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Senha</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              minLength={8}
              autoComplete="new-password"
              required
              placeholder="Pelo menos 8 caracteres"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
            />
          </div>

          {tipoConta === "proprietario" && <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Nome do estabelecimento</label>
            <input
              value={estabelecimentoName}
              onChange={(event) => setEstabelecimentoName(event.target.value)}
              placeholder="Ex: Barbearia Central"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
            />
          </div>}

          {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Já tem conta? <Link href={`/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`} className="font-semibold text-slate-900">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

export default function CadastrarPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <CadastroConteudo />
    </Suspense>
  );
}
