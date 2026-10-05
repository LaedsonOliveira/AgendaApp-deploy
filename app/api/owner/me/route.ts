import { NextResponse } from "next/server";
import { getCurrentOwner } from "@/lib/owner";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const owner = await getCurrentOwner();

  if (!owner) {
    return NextResponse.json({ owner: null }, { status: 200 });
  }

  const estabelecimentoAtual = owner.estabelecimentos[0];
  const estabelecimento = estabelecimentoAtual
    ? await prisma.estabelecimento.findUnique({
        where: { id: estabelecimentoAtual.id },
        include: {
          servicos: {
            orderBy: { nome: "asc" },
            include: { profissionais: { select: { id: true } } },
          },
          profissionais: { orderBy: { nome: "asc" } },
          horarios: true,
        },
      })
    : null;

  return NextResponse.json({
    owner: {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      telefone: owner.telefone,
      estabelecimento: estabelecimento
        ? {
            ...estabelecimento,
            servicos: estabelecimento.servicos.map((servico) => ({
              ...servico,
              preco: Number(servico.preco),
              barbeiros: servico.profissionais.map((profissional) => profissional.id),
            })),
          }
        : null,
    },
  });
}

export async function PATCH(request: Request) {
  const owner = await getCurrentOwner();
  if (!owner) {
    return NextResponse.json({ error: "Faça login para atualizar o estabelecimento." }, { status: 401 });
  }

  const estabelecimento = owner.estabelecimentos[0];
  if (!estabelecimento) {
    return NextResponse.json({ error: "Estabelecimento não encontrado." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data: {
      name?: string;
      description?: string;
      telefone?: string;
      email?: string;
      cnpj?: string;
      endereco?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
      logoUrl?: string | null;
      banner?: string | null;
      primaryColor?: string;
      secondaryColor?: string;
      welcomeMessage?: string;
      instagram?: string;
      facebook?: string;
      whatsapp?: string;
    } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return NextResponse.json({ error: "Informe o nome do estabelecimento." }, { status: 400 });
      }
      data.name = body.name.trim();
    }

    for (const field of [
      "description",
      "telefone",
      "email",
      "cnpj",
      "endereco",
      "cidade",
      "estado",
      "cep",
      "welcomeMessage",
      "instagram",
      "facebook",
      "whatsapp",
    ] as const) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string") {
          return NextResponse.json({ error: "Dados do estabelecimento inválidos." }, { status: 400 });
        }
        data[field] = body[field].trim();
      }
    }

    for (const field of ["logoUrl", "banner"] as const) {
      const value = body[field];
      if (value !== undefined) {
        if (value !== null && typeof value !== "string") {
          return NextResponse.json({ error: "Imagem inválida." }, { status: 400 });
        }
        data[field] = value;
      }
    }

    for (const field of ["primaryColor", "secondaryColor"] as const) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string" || !/^#[0-9a-f]{6}$/i.test(body[field])) {
          return NextResponse.json({ error: "Cor inválida." }, { status: 400 });
        }
        data[field] = body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nenhuma alteração informada." }, { status: 400 });
    }

    const updated = await prisma.estabelecimento.update({
      where: { id: estabelecimento.id },
      data,
    });

    return NextResponse.json({ estabelecimento: updated });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar a personalização." }, { status: 400 });
  }
}
