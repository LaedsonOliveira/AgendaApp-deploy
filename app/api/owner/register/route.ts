import { NextResponse } from "next/server";
import { createOwnerWithEstabelecimento } from "@/lib/owner";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, telefone, password, estabelecimentoName, slug } = body ?? {};

    if (!name || !email || !telefone || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Informe nome, e-mail, telefone e uma senha com pelo menos 8 caracteres." },
        { status: 400 }
      );
    }

    const owner = await createOwnerWithEstabelecimento({
      name,
      email,
      telefone,
      password,
      estabelecimentoName,
      slug,
    });

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
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.delete("barbearia_cliente_id");

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar conta.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
