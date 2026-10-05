import { notFound, redirect } from "next/navigation";
import ClienteAgendamento from "./ClienteAgendamento";
import { getEstabelecimentoBySlug } from "@/lib/owner";
import { getCurrentSession } from "@/lib/session";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const session = await getCurrentSession();
  if (!session) {
    redirect(`/login?returnTo=${encodeURIComponent(`/${slug}`)}`);
  }

  const estabelecimento = await getEstabelecimentoBySlug(slug);

  if (!estabelecimento) {
    notFound();
  }

  const estabelecimentoJson = {
    id: estabelecimento.id,
    slug: estabelecimento.slug,
    name: estabelecimento.name,
    logoUrl: estabelecimento.logoUrl,
    banner: estabelecimento.banner,
    primaryColor: estabelecimento.primaryColor,
    servicos: estabelecimento.servicos.map((servico) => ({
      id: servico.id,
      nome: servico.nome,
      descricao: servico.descricao,
      preco: Number(servico.preco),
      duracao: servico.duracao,
      profissionais: servico.profissionais.map((profissional) => profissional.id),
    })),
    profissionais: estabelecimento.profissionais.map((profissional) => ({
      id: profissional.id,
      nome: profissional.nome,
    })),
    horarios: estabelecimento.horarios.map((horario) => ({
      dia: horario.dia,
      ativo: horario.ativo,
      abertura: horario.abertura,
      fechamento: horario.fechamento,
      almocoInicio: horario.almocoInicio,
      almocoFim: horario.almocoFim,
    })),
    agendamentos: estabelecimento.agendamentos.map((agendamento) => ({
      dataHora: agendamento.dataHora.toISOString(),
      profissionalId: agendamento.profissionalId,
      duracao: agendamento.servico.duracao,
    })),
  };

  return <ClienteAgendamento estabelecimento={estabelecimentoJson} slug={slug} />;
}