import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Entre na sua conta para consultar agendamentos." }, { status: 401 });
  }

  const agendamentos = await prisma.agendamento.findMany({
    where: session.type === "cliente"
      ? { clienteId: session.id }
      : { estabelecimento: { proprietarioId: session.id } },
    orderBy: { dataHora: "desc" },
    include: {
      estabelecimento: { select: { slug: true, name: true } },
      servico: { select: { nome: true, duracao: true } },
      profissional: { select: { nome: true } },
    },
  });

  return NextResponse.json({ agendamentos });
}