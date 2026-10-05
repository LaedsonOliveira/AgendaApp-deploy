
export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracao: number;
  barbeiros: string[];
  ativo: boolean;
}

export interface Barbeiro {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  foto: string | null;
  ativo: boolean;
}

export interface HorarioDia {
  dia: string;
  ativo: boolean;
  abertura: string;
  fechamento: string;
  almocoInicio?: string;
  almocoFim?: string;
}

export interface DadosNegocio {
  nome: string;
  descricao: string;
  telefone: string;
  email: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Personalizacao {
  nomeNegocio: string;
  corPrimaria: string;
  corSecundaria: string;
  logo: string | null;
  banner: string | null;
  mensagemBoasVindas: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
}