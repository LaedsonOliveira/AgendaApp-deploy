import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
    }

    const prisma = getPrisma();
    const cliente = await prisma.cliente.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!cliente || !(await verifyPassword(password, cliente.passwordHash))) {
      return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      cliente: { id: cliente.id, nome: cliente.nome, email: cliente.email, telefone: cliente.telefone },
    });
    response.cookies.set("barbearia_cliente_id", cliente.id, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Não foi possível entrar. Tente novamente." }, { status: 400 });
  }
}