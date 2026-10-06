import { NextResponse } from "next/server";
import { authenticateOwnerByCredentials } from "@/lib/owner";
import { verifyPassword } from "@/lib/password";
import { getPrisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const owner = await authenticateOwnerByCredentials({ email: normalizedEmail, password });
    if (owner) {
      const response = NextResponse.json({
        user: {
          type: "proprietario",
          id: owner.id,
          name: owner.name,
          email: owner.email,
          estabelecimento: owner.estabelecimentos[0] ?? null,
        },
      });
      response.cookies.set("barbearia_owner_id", owner.id, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.delete("barbearia_cliente_id");
      return response;
    }

    const prisma = getPrisma();
    const client = await prisma.cliente.findUnique({ where: { email: normalizedEmail } });
    if (!client || !(await verifyPassword(password, client.passwordHash))) {
      return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    }

    const response = NextResponse.json({
      user: {
        type: "cliente",
        id: client.id,
        name: client.nome,
        email: client.email,
      },
    });
    response.cookies.set("barbearia_cliente_id", client.id, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.delete("barbearia_owner_id");
    return response;
  } catch {
    return NextResponse.json({ error: "Não foi possível entrar. Tente novamente." }, { status: 400 });
  }
}