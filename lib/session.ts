import { cookies } from "next/headers";
import { getPrisma } from "@/lib/prisma";

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const ownerId = cookieStore.get("barbearia_owner_id")?.value;
  const clientId = cookieStore.get("barbearia_cliente_id")?.value;
  if (!ownerId && !clientId) return null;

  const prisma = getPrisma();

  if (ownerId) {
    const owner = await prisma.proprietario.findUnique({
      where: { id: ownerId },
      include: { estabelecimentos: true },
    });
    if (owner) {
      return {
        type: "proprietario" as const,
        id: owner.id,
        name: owner.name,
        email: owner.email,
        telefone: owner.telefone,
        estabelecimento: owner.estabelecimentos[0] ?? null,
        owner,
      };
    }
  }

  if (clientId) {
    const client = await prisma.cliente.findUnique({ where: { id: clientId } });
    if (client) {
      return {
        type: "cliente" as const,
        id: client.id,
        name: client.nome,
        email: client.email,
        telefone: client.telefone,
        cliente: client,
      };
    }
  }

  return null;
}