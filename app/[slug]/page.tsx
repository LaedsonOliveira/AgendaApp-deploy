import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { getPublicEstabelecimentoBySlug } from "@/lib/owner";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const nomeDias: Record<string, string> = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
};

export default async function EstabelecimentoPage({ params }: PageProps) {
  const { slug } = await params;
  const estabelecimento = await getPublicEstabelecimentoBySlug(slug);

  if (!estabelecimento) notFound();

  const session = await getCurrentSession();
  const corPrimaria = estabelecimento.primaryColor || "#1a1a2e";
  const servicos = estabelecimento.servicos;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section
        className="relative flex min-h-72 items-end bg-cover bg-center sm:min-h-96"
        style={{
          backgroundColor: corPrimaria,
          backgroundImage: estabelecimento.banner
            ? `url("${estabelecimento.banner}")`
            : undefined,
        }}
      >
        {estabelecimento.banner && <div className="absolute inset-0 bg-black/40" />}
        <div className="relative mx-auto w-full max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-white/80">Perfil do estabelecimento</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold text-white sm:text-5xl">
            {estabelecimento.name}
          </h1>
          {estabelecimento.welcomeMessage && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white sm:text-base">
              {estabelecimento.welcomeMessage}
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-slate-200 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {estabelecimento.logoUrl ? (
              <Image
                src={estabelecimento.logoUrl}
                alt={`Logo ${estabelecimento.name}`}
                width={72}
                height={72}
                unoptimized
                className="h-16 w-16 shrink-0 rounded-md border border-slate-200 object-cover"
              />
            ) : (
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md text-2xl font-bold text-white"
                style={{ backgroundColor: corPrimaria }}
                aria-hidden="true"
              >
                {estabelecimento.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold">{estabelecimento.name}</h2>
              <p className="mt-1 text-sm text-slate-600">Agendamentos online</p>
            </div>
          </div>
          {session ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/agendar/${estabelecimento.slug}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: corPrimaria }}
              >
                Agendar horário
              </Link>
              <Link
                href={`/consultar-agendamentos?slug=${encodeURIComponent(estabelecimento.slug)}`}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Consultar agendamento
              </Link>
            </div>
          ) : (
            <Link
              href={`/login?returnTo=${encodeURIComponent(`/${estabelecimento.slug}`)}`}
              className="inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: corPrimaria }}
            >
              Entrar
            </Link>
          )}
        </div>

        {(estabelecimento.description || estabelecimento.telefone || estabelecimento.email || estabelecimento.endereco) && (
          <section className="grid gap-8 border-b border-slate-200 py-8 sm:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold">Sobre o estabelecimento</h2>
              {estabelecimento.description && (
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {estabelecimento.description}
                </p>
              )}
              {estabelecimento.endereco && (
                <p className="mt-3 text-sm text-slate-600">
                  {[estabelecimento.endereco, estabelecimento.cidade, estabelecimento.estado, estabelecimento.cep]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">Contato</h2>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                {estabelecimento.telefone && <p>{estabelecimento.telefone}</p>}
                {estabelecimento.email && <p>{estabelecimento.email}</p>}
                {estabelecimento.whatsapp && <p>WhatsApp: {estabelecimento.whatsapp}</p>}
                {estabelecimento.instagram && <p>Instagram: {estabelecimento.instagram}</p>}
              </div>
            </div>
          </section>
        )}

        {estabelecimento.horarios.length > 0 && (
          <section className="border-b border-slate-200 py-8" aria-labelledby="horarios-titulo">
            <h2 id="horarios-titulo" className="text-lg font-semibold">Horários de funcionamento</h2>
            <ul className="mt-3 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {estabelecimento.horarios.map((horario) => (
                <li key={horario.id} className="flex justify-between gap-3 border-b border-slate-100 py-2 text-sm">
                  <span className="text-slate-600">{nomeDias[horario.dia] ?? horario.dia}</span>
                  <span className="font-medium">
                    {horario.ativo ? `${horario.abertura}–${horario.fechamento}` : "Fechado"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="pt-9" aria-labelledby="servicos-titulo">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {estabelecimento.name}
              </p>
              <h2 id="servicos-titulo" className="mt-2 text-2xl font-bold">
                Serviços disponíveis
              </h2>
            </div>
            <span className="text-sm text-slate-500">{servicos.length} serviços</span>
          </div>

          {servicos.length > 0 ? (
            <ul className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
              {servicos.map((servico) => (
                <li key={servico.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold">{servico.nome}</h3>
                    {servico.descricao && (
                      <p className="mt-1 text-sm text-slate-600">{servico.descricao}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">{servico.duracao} minutos</p>
                  </div>
                  <p className="text-base font-semibold sm:text-right">
                    {Number(servico.preco).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 border-y border-slate-200 py-6 text-sm text-slate-600">
              Nenhum serviço disponível no momento.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}