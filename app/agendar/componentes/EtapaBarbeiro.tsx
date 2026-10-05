"use client";

import Icone from "@/app/componentes/Icones";

interface Profissional {
    id: string;
    nome: string;
}

interface Props {
    profissionais: Profissional[];
    selecionado: Profissional | null;
    onSelect: (profissional: Profissional) => void;
    onNext: () => void;
    cores: { primary: string; secondary: string };
}

export default function EtapaBarbeiro({ profissionais, selecionado, onSelect, onNext, cores, }: Props) {
    
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
                    <Icone tipo="tesoura" className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Escolha o Profissional
                    </h2>
                    <p className="text-sm text-slate-500">
                        Selecione o barbeiro que você prefere
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    {profissionais.map((profissional) => (
                        <button
                            key={profissional.id}
                            type="button"
                            onClick={() => onSelect(profissional)}
                            className={`rounded-2xl border p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${selecionado?.id === profissional.id
                                ? "bg-slate-900 text-white shadow-sm"
                                : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300"
                                }`}
                            style={
                                selecionado?.id === profissional.id
                                    ? { borderColor: cores.secondary, boxShadow: `0 10px 25px -18px ${cores.secondary}` }
                                    : undefined
                            }
                        >
                            <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold ${selecionado?.id === profissional.id ? "bg-white/10 text-white" : "bg-white text-slate-700"
                                }`}>
                                {profissional.nome.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold">
                                {profissional.nome}
                            </span>
                        </button>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={!selecionado}
                    className="mt-4 w-full rounded-xl px-6 py-3 text-white font-medium transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: cores.secondary }}
                >
                    Continuar
                </button>
            </form>
        </div>
    );
}