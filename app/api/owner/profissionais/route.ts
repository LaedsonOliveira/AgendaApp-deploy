import { NextResponse } from "next/server";
import { getCurrentOwner } from "@/lib/owner";
import { getPrisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const owner = await getCurrentOwner();
  const estabelecimentoId = owner?.estabelecimentos[0]?.id;
  if (!estabelecimentoId) {
    return NextResponse.json({ error: "Faça login para gerenciar os funcionários." }, { status: 401 });
  }

  try {
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

    const prisma = getPrisma();
    const profissional = await prisma.profissional.create({
      data: {
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: typeof email === "string" ? email.trim() : "",
        fotoUrl: foto ?? null,
        ativo,
        estabelecimentoId,
      },
    });
    return NextResponse.json({ profissional: { ...profissional, foto: profissional.fotoUrl } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível criar o funcionário." }, { status: 400 });
  }
}