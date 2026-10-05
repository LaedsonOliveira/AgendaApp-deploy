import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("barbearia_owner_id");
  response.cookies.delete("barbearia_cliente_id");
  return response;
}