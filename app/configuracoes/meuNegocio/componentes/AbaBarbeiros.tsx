"use client";

import { useState } from "react";
import Image from "next/image";
import { Barbeiro } from "../types";

interface Props {
  barbeiros: Barbeiro[];
  setBarbeiros: (barbeiros: Barbeiro[]) => void;
  onSave: (barbeiro: Barbeiro, editando: boolean) => Promise<Barbeiro>;
  onDelete: (id: string) => Promise<void>;
}

export default function AbaBarbeiros({ barbeiros, setBarbeiros, onSave, onDelete }: Props) {
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Barbeiro | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState<Partial<Barbeiro>>({
    nome: "",
    telefone: "",
    email: "",
    foto: null,
    ativo: true,
  });

  const handleOpenModal = (barbeiro?: Barbeiro) => {
    if (barbeiro) {
      setEditando(barbeiro);
      setForm(barbeiro);
    } else {
      setEditando(null);
      setForm({ nome: "", telefone: "", email: "", foto: null, ativo: true });
    }
    setModalAberto(true);
  };

  const handleCloseModal = () => {
    setModalAberto(false);
    setEditando(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    try {
      const barbeiroSalvo = await onSave({
        id: editando?.id ?? "",
        nome: form.nome ?? "",
        telefone: form.telefone ?? "",
        email: form.email ?? "",
        foto: form.foto ?? null,
        ativo: form.ativo !== false,
      }, Boolean(editando));
      setBarbeiros(editando
        ? barbeiros.map((barbeiro) => barbeiro.id === editando.id ? barbeiroSalvo : barbeiro)
        : [...barbeiros, barbeiroSalvo]);
      handleCloseModal();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível salvar o funcionário.");
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      setErro("");
      try {
        await onDelete(id);
        setBarbeiros(barbeiros.filter((barbeiro) => barbeiro.id !== id));
      } catch (error) {
        setErro(error instanceof Error ? error.message : "Não foi possível excluir o funcionário.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Funcionários</h2>
          <p className="mt-1 text-sm text-slate-500">Gerencie os profissionais do seu negócio</p>
        </div>
        <button onClick={() => handleOpenModal()} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2">
          + Novo Funcionário
        </button>
      </div>
      {erro && <p role="alert" className="text-sm text-red-600">{erro}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {barbeiros.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 md:col-span-2">Nenhum funcionário cadastrado.</p>
        ) : (
          barbeiros.map((barbeiro) => (
            <div key={barbeiro.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-full items-start justify-between gap-4">
                <div>
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-center text-xs text-slate-400">
                    {barbeiro.foto ? (
                      <Image
                        src={barbeiro.foto}
                        alt={barbeiro.nome}
                        width={56}
                        height={56}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>Sem foto</span>
                    )}
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-950">{barbeiro.nome}</h3>
                  <p className="mt-1 text-sm text-slate-500">{barbeiro.telefone}</p>
                  <p className="text-sm text-slate-500">{barbeiro.email}</p>
                  <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${barbeiro.ativo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {barbeiro.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(barbeiro)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(barbeiro.id)}
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

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-950">{editando ? "Editar Funcionário" : "Novo Funcionário"}</h2>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Nome Completo *
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
                    Telefone *
                    <input
                      type="tel"
                      name="telefone"
                      value={form.telefone || ""}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    E-mail
                    <input
                      type="email"
                      name="email"
                      value={form.email || ""}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                    />
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      name="ativo"
                      checked={form.ativo !== false}
                      onChange={handleChange}
                    />
                    Funcionário ativo
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