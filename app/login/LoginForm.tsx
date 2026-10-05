"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginForm({ returnTo }: { returnTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Não foi possível entrar.");

      const safeReturnTo = returnTo?.startsWith("/") &&
        !returnTo.startsWith("//") &&
        !returnTo.startsWith("/\\")
        ? returnTo
        : null;
      const slugFromBooking = safeReturnTo?.match(/^\/agendar\/([^/?#]+)/)?.[1];
      const slugFromProfile = safeReturnTo?.match(/^\/([^/?#]+)\/?(?:[?#]|$)/)?.[1];
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
      const destino = data.user.type === "proprietario"
        ? "/agenda"
        : slugParaAgendar
          ? `/agendar/${slugParaAgendar}`
          : safeReturnTo ?? "/";
      router.push(destino);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-12">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Acesso à plataforma</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Entrar</h1>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
            <input
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
              placeholder="meu@email.com"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-900"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Senha</label>
            <input
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
              placeholder="Sua senha"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-slate-900"
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Ainda não tem conta?{" "}
          <Link
            href={`/cadastrar${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
            className="font-semibold text-slate-900 underline underline-offset-4"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}