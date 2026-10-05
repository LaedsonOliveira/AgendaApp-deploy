import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import ConsultaAgendamentos from "./ConsultaAgendamentos";

interface PageProps {
  searchParams: Promise<{ slug?: string }>;
}

export default async function ConsultarAgendamentosPage({ searchParams }: PageProps) {
  const { slug } = await searchParams;
  const session = await getCurrentSession();
  if (!session) {
    const destination = slug ? `/${slug}` : "/";
    redirect(`/login?returnTo=${encodeURIComponent(destination)}`);
  }

  return <ConsultaAgendamentos slug={slug ?? null} />;
}