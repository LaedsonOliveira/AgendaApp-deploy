import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOwner } from "@/lib/owner";
import { getCurrentSession } from "@/lib/session";

const statusMap: Record<string, "PENDENTE" | "CONFIRMADO" | "CANCELADO" | "CONCLUIDO"> = {
  Pendente: "PENDENTE",
  Pago: "CONFIRMADO",
  Cancelado: "CANCELADO",
  Finalizado: "CONCLUIDO",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const owner = await getCurrentOwner();

    if (!owner) {
      return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
    }

    const body = await request.json();
    const status = body?.status;

    if (!status) {
      return NextResponse.json({ error: "Status obrigatório." }, { status: 400 });
    }

    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
      include: { estabelecimento: true },
    });

    if (!agendamento) {
      return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
    }

    const isOwner = agendamento.estabelecimento.proprietarioId === owner.id;

    if (!isOwner) {
      return NextResponse.json({ error: "Você não pode alterar este agendamento." }, { status: 403 });
    }

    const mappedStatus = statusMap[String(status)] ?? "PENDENTE";

    const updated = await prisma.agendamento.update({
      where: { id },
      data: { status: mappedStatus },
    });

    return NextResponse.json({ success: true, agendamento: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar agendamento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const owner = await getCurrentOwner();

    if (!owner) {
      return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
    }

    const agendamento = await prisma.agendamento.findUnique({
      where: { id },
      include: { estabelecimento: true },
    });

    if (!agendamento) {
      return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
    }

    if (agendamento.estabelecimento.proprietarioId !== owner.id) {
      return NextResponse.json({ error: "Você não pode excluir este agendamento." }, { status: 403 });
    }

    await prisma.agendamento.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir agendamento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Entre na sua conta para consultar agendamentos." }, { status: 401 });
  }

  const { id } = await params;
  const agendamento = await prisma.agendamento.findFirst({
    where: session.type === "cliente"
      ? { id, clienteId: session.id }
      : { id, estabelecimento: { proprietarioId: session.id } },
    include: { estabelecimento: { select: { slug: true, name: true } }, servico: true, profissional: true },
  });

  if (!agendamento) {
    return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ agendamento });
}
