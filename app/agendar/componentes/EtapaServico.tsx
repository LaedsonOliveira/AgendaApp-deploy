"use client";

import Icone from "@/app/componentes/Icones";

interface Servico {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  duracao: number;
  profissionais: string[];
}

interface Props {
  servicos: Servico[];
  selecionado: Servico | null;
  onSelect: (servico: Servico) => void;
  onNext: () => void;
  onBack: () => void;
  cores: { primary: string; secondary: string };
}

export default function EtapaServico({ servicos, selecionado, onSelect, onNext, onBack, cores,}: Props) {
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selecionado) onNext();
  };

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg shadow-sm"
          style={{ backgroundColor: `${cores.secondary}1A`, color: cores.secondary }}
        >
          <Icone tipo="ferramentas" className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Escolha o Serviço
          </h2>
          <p className="text-sm text-slate-500">
            Selecione o serviço que você deseja
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {servicos.map((servico) => (
          <button
            key={servico.id}
            type="button"
            onClick={() => onSelect(servico)}
            className={`flex w-full items-start justify-between gap-3 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${selecionado?.id === servico.id
              ? "bg-slate-900 text-white"
              : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300"
              }`}
            style={
              selecionado?.id === servico.id
                ? { borderColor: cores.secondary, boxShadow: `0 12px 28px -20px ${cores.secondary}` }
                : undefined
            }
          >
            <div className="min-w-0">
              <span className="font-semibold">{servico.nome}</span>
              {servico.descricao && (
                <p className={`mt-1 text-xs ${selecionado?.id === servico.id ? "text-slate-200" : "text-slate-500"}`}>
                  {servico.descricao}
                </p>
              )}
              <div className={`mt-2 flex gap-3 text-[11px] ${selecionado?.id === servico.id ? "text-slate-300" : "text-slate-500"}`}>
                <span>{servico.duracao} min</span>
              </div>
            </div>
            <span
              className="shrink-0 rounded-full px-3 py-1.5 text-sm font-bold text-white"
              style={{ backgroundColor: cores.secondary }}
            >
              R$ {servico.preco.toFixed(2)}
            </span>
          </button>
        ))}

        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={!selecionado}
            className="flex-1 rounded-xl px-6 py-3 text-white font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: cores.secondary }}
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
}