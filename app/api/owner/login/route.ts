import { NextResponse } from "next/server";
import { authenticateOwnerByCredentials } from "@/lib/owner";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Informe e-mail e senha." },
        { status: 400 }
      );
    }

    const owner = await authenticateOwnerByCredentials({ email, password });

    if (!owner) {
      return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      owner: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        telefone: owner.telefone,
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

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao entrar.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
