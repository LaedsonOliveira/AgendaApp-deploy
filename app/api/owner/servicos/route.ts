import { NextResponse } from "next/server";
import { getCurrentOwner } from "@/lib/owner";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const owner = await getCurrentOwner();
  const estabelecimentoId = owner?.estabelecimentos[0]?.id;
  if (!estabelecimentoId) {
    return NextResponse.json({ error: "Faça login para gerenciar os serviços." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nome, descricao, preco, duracao, barbeiros, ativo } = body ?? {};
    if (
      typeof nome !== "string" || !nome.trim() ||
      typeof preco !== "number" || !Number.isFinite(preco) || preco < 0 ||
      typeof duracao !== "number" || !Number.isInteger(duracao) || duracao < 5 ||
      typeof ativo !== "boolean" ||
      (descricao !== undefined && typeof descricao !== "string") ||
      (barbeiros !== undefined && (!Array.isArray(barbeiros) || barbeiros.some((id: unknown) => typeof id !== "string")))
    ) {
      return NextResponse.json({ error: "Confira os dados do serviço." }, { status: 400 });
    }

    const profissionalIds: string[] = barbeiros ?? [];
    const profissionais = await prisma.profissional.findMany({
      where: { id: { in: profissionalIds }, estabelecimentoId },
      select: { id: true },
    });
    if (profissionais.length !== new Set(profissionalIds).size) {
      return NextResponse.json({ error: "Há funcionários inválidos neste serviço." }, { status: 400 });
    }

    const servico = await prisma.servico.create({
      data: {
        nome: nome.trim(),
        descricao: typeof descricao === "string" ? descricao.trim() : null,
        preco,
        duracao,
        ativo,
        estabelecimentoId,
        profissionais: { connect: profissionais.map(({ id }) => ({ id })) },
      },
      include: { profissionais: { select: { id: true } } },
    });
    return NextResponse.json({ servico: {
      ...servico,
      preco: Number(servico.preco),
      descricao: servico.descricao ?? "",
      barbeiros: servico.profissionais.map(({ id }) => id),
    } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível criar o serviço." }, { status: 400 });
  }
}