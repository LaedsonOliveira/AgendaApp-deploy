import { NextResponse } from "next/server";
import { getCurrentOwner } from "@/lib/owner";
import { prisma } from "@/lib/prisma";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Context) {
  const owner = await getCurrentOwner();
  const estabelecimentoId = owner?.estabelecimentos[0]?.id;
  if (!estabelecimentoId) {
    return NextResponse.json({ error: "Faça login para gerenciar os serviços." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const atual = await prisma.servico.findFirst({ where: { id, estabelecimentoId } });
    if (!atual) return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });

    const body = await request.json();
    const { nome, descricao, preco, duracao, barbeiros, ativo } = body ?? {};
    if (
      typeof nome !== "string" || !nome.trim() ||
      typeof preco !== "number" || !Number.isFinite(preco) || preco < 0 ||
      typeof duracao !== "number" || !Number.isInteger(duracao) || duracao < 5 ||
      typeof ativo !== "boolean" ||
      (descricao !== undefined && typeof descricao !== "string") ||
      !Array.isArray(barbeiros) || barbeiros.some((profissionalId: unknown) => typeof profissionalId !== "string")
    ) {
      return NextResponse.json({ error: "Confira os dados do serviço." }, { status: 400 });
    }

    const profissionalIds: string[] = barbeiros;
    const profissionais = await prisma.profissional.findMany({
      where: { id: { in: profissionalIds }, estabelecimentoId },
      select: { id: true },
    });
    if (profissionais.length !== new Set(profissionalIds).size) {
      return NextResponse.json({ error: "Há funcionários inválidos neste serviço." }, { status: 400 });
    }

    const servico = await prisma.servico.update({
      where: { id },
      data: {
        nome: nome.trim(),
        descricao: typeof descricao === "string" ? descricao.trim() : null,
        preco,
        duracao,
        ativo,
        profissionais: { set: profissionais.map(({ id: profissionalId }) => ({ id: profissionalId })) },
      },
      include: { profissionais: { select: { id: true } } },
    });
    return NextResponse.json({ servico: {
      ...servico,
      preco: Number(servico.preco),
      descricao: servico.descricao ?? "",
      barbeiros: servico.profissionais.map(({ id: profissionalId }) => profissionalId),
    } });
  } catch {
    return NextResponse.json({ error: "Não foi possível atualizar o serviço." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const owner = await getCurrentOwner();
  const estabelecimentoId = owner?.estabelecimentos[0]?.id;
  if (!estabelecimentoId) {
    return NextResponse.json({ error: "Faça login para gerenciar os serviços." }, { status: 401 });
  }

  const { id } = await params;
  const servico = await prisma.servico.findFirst({ where: { id, estabelecimentoId } });
  if (!servico) return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });

  try {
    await prisma.servico.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Este serviço já possui agendamentos e não pode ser excluído." }, { status: 409 });
  }
}