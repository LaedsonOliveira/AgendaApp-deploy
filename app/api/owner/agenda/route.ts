import { NextResponse } from "next/server";
import { getCurrentOwner, getEstabelecimentoByOwner } from "@/lib/owner";

export async function GET() {
  const owner = await getCurrentOwner();

  if (!owner) {
    return NextResponse.json({ owner: null, estabelecimento: null }, { status: 200 });
  }

  const estabelecimento = await getEstabelecimentoByOwner(owner.id);

  if (!estabelecimento) {
    return NextResponse.json({
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        telefone: owner.telefone,
      },
      estabelecimento: null,
    });
  }

  return NextResponse.json({
    owner: {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      telefone: owner.telefone,
    },
    estabelecimento: {
      id: estabelecimento.id,
      name: estabelecimento.name,
      slug: estabelecimento.slug,
      primaryColor: estabelecimento.primaryColor,
      servicos: estabelecimento.servicos.map((servico) => ({
        id: servico.id,
        nome: servico.nome,
        descricao: servico.descricao,
        preco: Number(servico.preco),
        duracao: servico.duracao,
      })),
      profissionais: estabelecimento.profissionais.map((profissional) => ({
        id: profissional.id,
        nome: profissional.nome,
      })),
      agendamentos: estabelecimento.agendamentos.map((agendamento) => ({
        id: agendamento.id,
        clienteNome: agendamento.clienteNome,
        clienteFone: agendamento.clienteFone,
        servicoId: agendamento.servicoId,
        profissionalId: agendamento.profissionalId,
        status: agendamento.status,
        dataHora: agendamento.dataHora.toISOString(),
        preco: Number(agendamento.preco),
      })),
    },
  });
}
