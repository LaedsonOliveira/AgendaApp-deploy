import Link from "next/link";
import Image from "next/image";
import { getPublicEstabelecimentos } from "@/lib/owner";

export default async function Home() {
  const estabelecimentos = await getPublicEstabelecimentos();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Estabelecimentos</h1>

        {estabelecimentos.length > 0 ? (
          <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
            {estabelecimentos.map((estabelecimento) => (
              <li key={estabelecimento.slug} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
                {estabelecimento.logoUrl ? (
                  <Image
                    src={estabelecimento.logoUrl}
                    alt={`Logo ${estabelecimento.name}`}
                    width={64}
                    height={64}
                    unoptimized
                    className="h-16 w-16 rounded-md border border-slate-200 object-cover"
                  />
                ) : (
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md text-xl font-bold text-white"
                    style={{ backgroundColor: estabelecimento.primaryColor }}
                    aria-hidden="true"
                  >
                    {estabelecimento.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold">{estabelecimento.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">/{estabelecimento.slug}</p>
                </div>
                <Link
                  href={`/${estabelecimento.slug}`}
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-white"
                >
                  Ver perfil
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-16 text-center">
            <h2 className="text-xl font-semibold">Nenhum estabelecimento cadastrado</h2>
            <p className="mt-2 text-sm text-slate-600">Crie uma conta para publicar a primeira página.</p>
            <Link href="/cadastrar" className="mt-5 inline-flex rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700">
              Criar conta do negócio
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}