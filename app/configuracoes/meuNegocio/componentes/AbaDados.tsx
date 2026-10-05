"use client";

import { useState } from "react";
import { DadosNegocio } from "../types";

interface Props {
  dados: DadosNegocio;
  setDados: (dados: DadosNegocio) => void;
  onSave: () => Promise<void>;
}

export default function AbaDados({ dados, setDados, onSave }: Props) {
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDados({ ...dados, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setFeedback("");
    try {
      await onSave();
      setFeedback("Dados salvos.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar os dados.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Nome do Negócio *
            <input
              type="text"
              name="nome"
              value={dados.nome}
              onChange={handleChange}
              placeholder="Ex: Meu Negócio"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Telefone *
            <input
              type="tel"
              name="telefone"
              value={dados.telefone}
              onChange={handleChange}
              placeholder="(81) 99999-9999"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            E-mail *
            <input
              type="email"
              name="email"
              value={dados.email}
              onChange={handleChange}
              placeholder="contato@meunegocio.com"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            CNPJ
            <input
              type="text"
              name="cnpj"
              value={dados.cnpj}
              onChange={handleChange}
              placeholder="12.345.678/0001-90"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Endereço
            <input
              type="text"
              name="endereco"
              value={dados.endereco}
              onChange={handleChange}
              placeholder="Rua Exemplo, 123"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Cidade
            <input
              type="text"
              name="cidade"
              value={dados.cidade}
              onChange={handleChange}
              placeholder="Recife"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Estado
            <input
              type="text"
              name="estado"
              value={dados.estado}
              onChange={handleChange}
              placeholder="PE"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            CEP
            <input
              type="text"
              name="cep"
              value={dados.cep}
              onChange={handleChange}
              placeholder="50000-000"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>
        <div>
          <label>
            Descrição
            <textarea
              name="descricao"
              value={dados.descricao}
              onChange={handleChange}
              rows={3}
              placeholder="O melhor negócio da região com profissionais experientes"
              className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="flex items-center gap-3">
          {feedback && <p role="status" className="text-sm text-slate-600">{feedback}</p>}
          <button type="submit" disabled={salvando} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2">
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </form>
  );
}