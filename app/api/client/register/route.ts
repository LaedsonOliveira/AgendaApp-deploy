import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, telefone, password } = body ?? {};

    if (
      typeof nome !== "string" ||
      nome.trim().length < 2 ||
      typeof email !== "string" ||
      !email.includes("@") ||
      typeof telefone !== "string" ||
      !telefone.trim() ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return NextResponse.json(
        { error: "Informe nome, e-mail válido, telefone e senha com pelo menos 8 caracteres." },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefone.trim(),
        passwordHash: await hashPassword(password),
      },
    });

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
    response.cookies.delete("barbearia_owner_id");
    return response;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Já existe uma conta com este e-mail." }, { status: 409 });
    }
    return NextResponse.json({ error: "Não foi possível criar sua conta." }, { status: 500 });
  }
}