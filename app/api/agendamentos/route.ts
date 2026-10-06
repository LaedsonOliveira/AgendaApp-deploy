import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Entre na sua conta para agendar." }, { status: 401 });
    }

    const {
      estabelecimentoId,
      profissionalId,
      servicoId,
      dataHora,
      clienteNome,
      clienteFone,
      clienteEmail,
      descricao,
    } = body ?? {};

    if (!estabelecimentoId || !profissionalId || !servicoId || !dataHora) {
      return NextResponse.json(
        { error: "Dados do agendamento incompletos." },
        { status: 400 }
      );
    }

    const cliente = session.type === "cliente" ? session.cliente : null;
    const clienteNomeFinal = cliente?.nome ?? (session.type === "proprietario" ? session.name : String(clienteNome ?? "").trim());
    const clienteFoneFinal = cliente?.telefone ?? (session.type === "proprietario" ? session.telefone : String(clienteFone ?? "").trim());

    if (!clienteNomeFinal || !clienteFoneFinal) {
      return NextResponse.json(
        { error: "Nome e telefone do cliente são obrigatórios." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const [estabelecimento, profissional, servico] = await Promise.all([
      prisma.estabelecimento.findUnique({ where: { id: estabelecimentoId } }),
      prisma.profissional.findUnique({ where: { id: profissionalId } }),
      prisma.servico.findUnique({
        where: { id: servicoId },
        include: { profissionais: { select: { id: true } } },
      }),
    ]);

    if (!estabelecimento) {
      return NextResponse.json({ error: "Estabelecimento não encontrado." }, { status: 404 });
    }

    if (!profissional || profissional.estabelecimentoId !== estabelecimentoId) {
      return NextResponse.json({ error: "Profissional inválido para este estabelecimento." }, { status: 400 });
    }

    if (!servico || servico.estabelecimentoId !== estabelecimentoId) {
      return NextResponse.json({ error: "Serviço inválido para este estabelecimento." }, { status: 400 });
    }

    if (servico.profissionais.length && !servico.profissionais.some(({ id }) => id === profissionalId)) {
      return NextResponse.json({ error: "Este profissional não oferece o serviço selecionado." }, { status: 400 });
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        clienteNome: clienteNomeFinal,
        clienteFone: clienteFoneFinal,
        clienteEmail: cliente?.email ?? (clienteEmail ? String(clienteEmail).trim() : null),
        clienteId: cliente?.id,
        descricao: descricao ? String(descricao).trim() : null,
        dataHora: new Date(dataHora),
        preco: Number(servico.preco),
        status: "PENDENTE",
        estabelecimentoId,
        profissionalId,
        servicoId,
      },
      include: {
        profissional: true,
        servico: true,
      },
    });

    return NextResponse.json({
      success: true,
      agendamento: {
        id: agendamento.id,
        clienteNome: agendamento.clienteNome,
        clienteFone: agendamento.clienteFone,
        dataHora: agendamento.dataHora,
        status: agendamento.status,
        preco: Number(agendamento.preco),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar agendamento.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
