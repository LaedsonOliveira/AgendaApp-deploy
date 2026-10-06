import { NextResponse } from "next/server";
import { getCurrentOwner } from "@/lib/owner";
import { getPrisma } from "@/lib/prisma";

const diasValidos = new Set([
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
]);

export async function PATCH(request: Request) {
  const owner = await getCurrentOwner();
  const estabelecimentoId = owner?.estabelecimentos[0]?.id;
  if (!estabelecimentoId) {
    return NextResponse.json({ error: "Faça login para atualizar os horários." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const horarios = body?.horarios;
    if (!Array.isArray(horarios) || horarios.length !== diasValidos.size) {
      return NextResponse.json({ error: "Informe os horários dos sete dias da semana." }, { status: 400 });
    }

    const diasRecebidos = new Set<string>();
    for (const horario of horarios) {
      if (
        !horario ||
        typeof horario.dia !== "string" || !diasValidos.has(horario.dia) || diasRecebidos.has(horario.dia) ||
        typeof horario.ativo !== "boolean" ||
        typeof horario.abertura !== "string" || !/^\d{2}:\d{2}$/.test(horario.abertura) ||
        typeof horario.fechamento !== "string" || !/^\d{2}:\d{2}$/.test(horario.fechamento) ||
        (horario.almocoInicio !== undefined && horario.almocoInicio !== "" && !/^\d{2}:\d{2}$/.test(horario.almocoInicio)) ||
        (horario.almocoFim !== undefined && horario.almocoFim !== "" && !/^\d{2}:\d{2}$/.test(horario.almocoFim))
      ) {
        return NextResponse.json({ error: "Confira os horários informados." }, { status: 400 });
      }
      diasRecebidos.add(horario.dia);
    }

    const prisma = getPrisma();
    const salvos = await prisma.$transaction(
      horarios.map((horario) => prisma.horarioFuncionamento.upsert({
        where: {
          estabelecimentoId_dia: { estabelecimentoId, dia: horario.dia },
        },
        create: {
          estabelecimentoId,
          dia: horario.dia,
          ativo: horario.ativo,
          abertura: horario.abertura,
          fechamento: horario.fechamento,
          almocoInicio: horario.almocoInicio || null,
          almocoFim: horario.almocoFim || null,
        },
        update: {
          ativo: horario.ativo,
          abertura: horario.abertura,
          fechamento: horario.fechamento,
          almocoInicio: horario.almocoInicio || null,
          almocoFim: horario.almocoFim || null,
        },
      }))
    );
    return NextResponse.json({ horarios: salvos });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar os horários." }, { status: 400 });
  }
}