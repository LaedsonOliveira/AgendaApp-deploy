import { getPrisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const buildUniqueSlug = async (base: string) => {
  const prisma = getPrisma();
  const safeBase = slugify(base) || "meu-negocio";
  let slug = safeBase;
  let counter = 1;

  while (true) {
    const existing = await prisma.estabelecimento.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${safeBase}-${counter}`;
    counter += 1;
  }
};

export async function createOwnerWithEstabelecimento(input: {
  name: string;
  email: string;
  telefone: string;
  password: string;
  estabelecimentoName?: string;
  slug?: string;
}) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const telefone = input.telefone.trim();
  const estabelecimentoName = (input.estabelecimentoName?.trim() || name || "Meu Negócio").trim();

  if (!name || !email || !telefone || input.password.length < 8) {
    throw new Error("Nome, e-mail, telefone e senha com pelo menos 8 caracteres são obrigatórios.");
  }

  const prisma = getPrisma();
  const existingOwner = await prisma.proprietario.findFirst({
    where: {
      OR: [{ email }, { telefone }],
    },
  });

  if (existingOwner) {
    throw new Error("Já existe um proprietário cadastrado com este e-mail ou telefone.");
  }

  const slug = await buildUniqueSlug(input.slug ?? estabelecimentoName);

  const owner = await prisma.proprietario.create({
    data: {
      name,
      email,
      telefone,
      passwordHash: await hashPassword(input.password),
      estabelecimentos: {
        create: {
          name: estabelecimentoName || "Meu Negócio",
          slug,
          primaryColor: "#1a1a2e",
        },
      },
    },
    include: {
      estabelecimentos: true,
    },
  });

  return owner;
}

export async function authenticateOwnerByCredentials(input: {
  email: string;
  password: string;
}) {
  const prisma = getPrisma();
  const email = input.email.trim().toLowerCase();

  const owner = await prisma.proprietario.findUnique({
    where: { email },
    include: { estabelecimentos: true },
  });

  if (!owner?.passwordHash || !(await verifyPassword(input.password, owner.passwordHash))) {
    return null;
  }

  return owner;
}

export async function getCurrentOwner() {
  const cookieStore = await import("next/headers").then(({ cookies }) => cookies());
  const ownerId = (await cookieStore).get("barbearia_owner_id")?.value;

  if (!ownerId) return null;

  const prisma = getPrisma();
  return prisma.proprietario.findUnique({
    where: { id: ownerId },
    include: {
      estabelecimentos: true,
    },
  });
}

export async function getEstabelecimentoBySlug(slug: string) {
  const prisma = getPrisma();
  return prisma.estabelecimento.findUnique({
    where: { slug },
    include: {
      servicos: {
        where: { ativo: true },
        orderBy: { nome: "asc" },
        include: { profissionais: { select: { id: true } } },
      },
      profissionais: { where: { ativo: true }, orderBy: { nome: "asc" } },
      horarios: true,
      agendamentos: {
        where: { dataHora: { gte: new Date() } },
        select: {
          dataHora: true,
          profissionalId: true,
          servico: { select: { duracao: true } },
        },
      },
    },
  });
}

export async function getPublicEstabelecimentoBySlug(slug: string) {
  const prisma = getPrisma();
  return prisma.estabelecimento.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      telefone: true,
      email: true,
      endereco: true,
      cidade: true,
      estado: true,
      cep: true,
      logoUrl: true,
      banner: true,
      primaryColor: true,
      welcomeMessage: true,
      instagram: true,
      facebook: true,
      whatsapp: true,
      horarios: { orderBy: { dia: "asc" } },
      servicos: {
        where: { ativo: true },
        orderBy: { nome: "asc" },
        select: {
          id: true,
          nome: true,
          descricao: true,
          preco: true,
          duracao: true,
        },
      },
    },
  });
}

export async function getPublicEstabelecimentos() {
  const prisma = getPrisma();
  return prisma.estabelecimento.findMany({
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      logoUrl: true,
      banner: true,
      primaryColor: true,
    },
  });
}

export async function getEstabelecimentoByOwner(ownerId: string) {
  const prisma = getPrisma();
  return prisma.estabelecimento.findFirst({
    where: { proprietarioId: ownerId },
    include: {
      servicos: true,
      profissionais: true,
      agendamentos: {
        take: 20,
        orderBy: { dataHora: "asc" },
      },
    },
  });
}
