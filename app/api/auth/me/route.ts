import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      type: session.type,
      id: session.id,
      name: session.name,
      email: session.email,
      telefone: session.telefone,
      estabelecimento: session.type === "proprietario" ? session.estabelecimento : undefined,
    },
  });
}