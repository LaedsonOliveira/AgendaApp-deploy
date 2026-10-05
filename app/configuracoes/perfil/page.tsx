"use client";

import React, { useState, ChangeEvent } from 'react';
import Image from 'next/image';

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
}

const Perfil: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    nome: 'teste',
    email: 'contato@meunegocio.com',
    telefone: '(81) 99999-9999',
    senha: '***********'
  });

  const [foto, setFoto] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Dados salvos:', formData);
    alert('Perfil atualizado com sucesso!');
  };

  const handleAlterarSenha = () => {
    alert('Redirecionar para página de alteração de senha');
  };

  return (
    <div className="mx-auto min-w-0 max-w-3xl pb-10 text-slate-900">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        {/* Cabeçalho */}
        <div className="border-b border-slate-100 pb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Meu Perfil</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Gerencie seus dados pessoais e informações da conta.</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Seção da Foto */}
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xs text-slate-400">
              {foto ? (
                <Image
                  src={foto}
                  alt="Foto de perfil"
                  width={80}
                  height={80}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>Sem foto</span>
              )}
            </div>
            <div>
              <label htmlFor="foto-input" className="inline-flex cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-within:ring-2 focus-within:ring-slate-300">
                Alterar foto
                <input
                  type="file"
                  id="foto-input"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* Campos do formulário */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-slate-700">Nome completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
              required
            />
          </div>

          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-slate-700">Telefone</label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Seção da Senha */}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="senha" className="block text-sm font-medium text-slate-700">Senha</label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 outline-none"
                disabled
              />
            </div>
            <button
              type="button"
              onClick={handleAlterarSenha}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
            >
              Alterar senha
            </button>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button type="submit" className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2">
              Salvar alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Perfil;