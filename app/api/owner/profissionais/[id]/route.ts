import { NextResponse } from "next/server";
import { getCurrentOwner } from "@/lib/owner";
import { getPrisma } from "@/lib/prisma";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Context) {
  const owner = await getCurrentOwner();
  const estabelecimentoId = owner?.estabelecimentos[0]?.id;
  if (!estabelecimentoId) {
    return NextResponse.json({ error: "Faça login para gerenciar os funcionários." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const prisma = getPrisma();
    const profissionalExistente = await prisma.profissional.findFirst({ where: { id, estabelecimentoId } });
    if (!profissionalExistente) {
      return NextResponse.json({ error: "Funcionário não encontrado." }, { status: 404 });
    }

    const body = await request.json();
    const { nome, telefone, email, foto, ativo } = body ?? {};
    if (
      typeof nome !== "string" || !nome.trim() ||
      typeof telefone !== "string" || !telefone.trim() ||
      (email !== undefined && typeof email !== "string") ||
      (foto !== undefined && foto !== null && typeof foto !== "string") ||
      typeof ativo !== "boolean"
    ) {
      return NextResponse.json({ error: "Confira os dados do funcionário." }, { status: 400 });
    }

    const profissional = await prisma.profissional.update({
      where: { id },
      data: {
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: typeof email === "string" ? email.trim() : "",
        fotoUrl: foto ?? null,
        ativo,
      },
    });
    return NextResponse.json({ profissional: { ...profissional, foto: profissional.fotoUrl } });
  } catch {
    return NextResponse.json({ error: "Não foi possível atualizar o funcionário." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const owner = await getCurrentOwner();
  const estabelecimentoId = owner?.estabelecimentos[0]?.id;
  if (!estabelecimentoId) {
    return NextResponse.json({ error: "Faça login para gerenciar os funcionários." }, { status: 401 });
  }

  const { id } = await params;
  const prisma = getPrisma();
  const profissional = await prisma.profissional.findFirst({ where: { id, estabelecimentoId } });
  if (!profissional) return NextResponse.json({ error: "Funcionário não encontrado." }, { status: 404 });

  try {
    await prisma.profissional.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Este funcionário já possui agendamentos e não pode ser excluído." }, { status: 409 });
  }
}