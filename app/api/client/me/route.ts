import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  const clienteId = (await cookies()).get("barbearia_cliente_id")?.value;
  if (!clienteId) return NextResponse.json({ cliente: null });

  const prisma = getPrisma();
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    select: { id: true, nome: true, email: true, telefone: true },
  });
  return NextResponse.json({ cliente });
}