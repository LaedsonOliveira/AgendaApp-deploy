"use client";

import { useState } from "react";
import { Servico, Barbeiro } from "../types";

interface Props {
  servicos: Servico[];
  setServicos: (servicos: Servico[]) => void;
  barbeiros: Barbeiro[];
  onSave: (servico: Servico, editando: boolean) => Promise<Servico>;
  onDelete: (id: string) => Promise<void>;
}

export default function AbaServicos({ servicos, setServicos, barbeiros, onSave, onDelete }: Props) {
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Servico | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState<Partial<Servico>>({
    nome: "",
    descricao: "",
    preco: 0,
    duracao: 30,
    barbeiros: [],
    ativo: true,
  });

  const handleOpenModal = (servico?: Servico) => {
    if (servico) {
      setEditando(servico);
      setForm(servico);
    } else {
      setEditando(null);
      setForm({ nome: "", descricao: "", preco: 0, duracao: 30, barbeiros: [], ativo: true });
    }
    setModalAberto(true);
  };

  const handleCloseModal = () => {
    setModalAberto(false);
    setEditando(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked :
        type === "number" ? Number(value) : value,
    });
  };

  const handleBarbeiroToggle = (barbeiroId: string) => {
    const current = form.barbeiros || [];
    const updated = current.includes(barbeiroId)
      ? current.filter(id => id !== barbeiroId)
      : [...current, barbeiroId];
    setForm({ ...form, barbeiros: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      const servicoSalvo = await onSave({
        id: editando?.id ?? "",
        nome: form.nome ?? "",
        descricao: form.descricao ?? "",
        preco: Number(form.preco ?? 0),
        duracao: Number(form.duracao ?? 30),
        barbeiros: form.barbeiros ?? [],
        ativo: form.ativo !== false,
      }, Boolean(editando));
      setServicos(editando
        ? servicos.map((servico) => servico.id === editando.id ? servicoSalvo : servico)
        : [...servicos, servicoSalvo]);
      handleCloseModal();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível salvar o serviço.");
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      setErro("");
      try {
        await onDelete(id);
        setServicos(servicos.filter((servico) => servico.id !== id));
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Não foi possível excluir o serviço.");
      }
    }
  };

  const barbeirosAtivos = barbeiros.filter(b => b.ativo);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Serviços</h2>
          <p className="mt-1 text-sm text-slate-500">Gerencie os serviços oferecidos pelo seu negócio</p>
        </div>
        <button onClick={() => handleOpenModal()} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2">
          + Novo Serviço
        </button>
      </div>
      {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}

      {/* Lista de Serviços */}
      <div className="grid gap-4 md:grid-cols-2">
        {servicos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 md:col-span-2">Nenhum serviço cadastrado. Clique em &quot;Novo Serviço&quot; para começar.</p>
        ) : (
          servicos.map((servico) => (
            <div key={servico.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-full flex-col justify-between gap-5">
                <div>
                  <h3 className="font-semibold text-slate-950">{servico.nome}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{servico.descricao}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">R$ {servico.preco.toFixed(2)}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{servico.duracao} min</span>
                    {servico.barbeiros.map(id => {
                      const barbeiro = barbeiros.find(b => b.id === id);
                      return barbeiro ? (
                        <span key={id} className="rounded-full border border-slate-200 px-2.5 py-1 text-slate-600">{barbeiro.nome}</span>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="flex gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(servico)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(servico.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-950">{editando ? "Editar Serviço" : "Novo Serviço"}</h2>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Nome do Serviço *
                    <input
                      type="text"
                      name="nome"
                      value={form.nome || ""}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Descrição
                    <textarea
                      name="descricao"
                      value={form.descricao || ""}
                      onChange={handleChange}
                      rows={2}
                      className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                </div>

                <div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Preço (R$) *
                      <input
                        type="number"
                        name="preco"
                        value={form.preco || 0}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        required
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Duração (min) *
                      <input
                        type="number"
                        name="duracao"
                        value={form.duracao || 30}
                        onChange={handleChange}
                        min="5"
                        step="5"
                        required
                        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Funcionários que fazem este serviço</label>
                  <div className="mt-2 space-y-2">
                    {barbeirosAtivos.length === 0 ? (
                      <p>Nenhum funcionário ativo. Cadastre funcionários primeiro.</p>
                    ) : (
                      barbeirosAtivos.map((barbeiro) => (
                        <label key={barbeiro.id} className="flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            checked={form.barbeiros?.includes(barbeiro.id) || false}
                            onChange={() => handleBarbeiroToggle(barbeiro.id)}
                          />
                          {barbeiro.nome}
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={form.ativo !== false}
                      onChange={handleChange}
                    />
                    Serviço ativo (visível para clientes)
                  </label>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                  {erro && <p role="alert" className="mr-auto text-sm text-red-600">{erro}</p>}
                  <button type="button" onClick={handleCloseModal} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Cancelar
                  </button>
                  <button type="submit" disabled={salvando} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
                    {salvando ? "Salvando..." : editando ? "Atualizar" : "Adicionar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}