"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserType = "cliente" | "proprietario";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        const type = data.user?.type;
        if (active) {
          setUserType(type === "cliente" || type === "proprietario" ? type : null);
        }
      })
      .catch(() => {
        if (active) setUserType(null);
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => { active = false; };
  }, [pathname]);

  const sair = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Não foi possível sair.");
      setUserType(null);
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const authControl = !checkingSession && (userType ? (
    <button
      type="button"
      onClick={sair}
      disabled={loggingOut}
      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
    >
      {loggingOut ? "Saindo..." : "Sair"}
    </button>
  ) : (
    <Link href="/login" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
      Entrar
    </Link>
  ));

  const staticPaths = new Set([
    "agenda",
    "agendar",
    "cadastrar",
    "configuracoes",
    "consultar-agendamentos",
    "login",
  ]);
  const segments = pathname.split("/").filter(Boolean);
  const isPerfilEstabelecimento = segments.length === 1 && !staticPaths.has(segments[0]);
  const isPaginaCliente = userType !== "proprietario" && (
    pathname === "/" ||
    isPerfilEstabelecimento ||
    pathname.startsWith("/agendar/") ||
    pathname === "/consultar-agendamentos" ||
    pathname === "/login" ||
    pathname === "/cadastrar"
  );

  const voltar = () => {
    if (isPerfilEstabelecimento) {
      router.push("/");
      return;
    }
    if (pathname.startsWith("/agendar/")) {
      const slug = pathname.split("/")[2];
      if (slug) {
        router.push(`/${slug}`);
        return;
      }
    }
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          {isPaginaCliente ? (
            <span className="text-lg font-bold text-slate-900">AgendaApp</span>
          ) : (
            <Link href="/" className="text-lg font-bold text-slate-900">AgendaApp</Link>
          )}

          {isPaginaCliente ? (
            <div className="flex items-center gap-2">
              {pathname !== "/" && (
              <button
                type="button"
                onClick={voltar}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Voltar
              </button>
              )}
              {pathname !== "/login" && pathname !== "/cadastrar" && authControl}
            </div>
          ) : <nav className="flex items-center gap-3 text-sm">
            <Link href="/" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
              Home
            </Link>
            <Link href="/agenda" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
              Agenda
            </Link>
            <Link href="/configuracoes/meuNegocio" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
              Negócio
            </Link>
            {authControl}
          </nav>}
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
