// components/agendamento/EtapaDadosCliente.tsx
"use client";

import { useState } from "react";

interface Props {
  nome: string;
  setNome: (nome: string) => void;
  telefone: string;
  setTelefone: (telefone: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  cores: { primary: string; secondary: string };
}

export default function EtapaDadosCliente({
  nome,
  setNome,
  telefone,
  setTelefone,
  onNext,
  onBack,
  loading,
  cores,
}: Props) {
  const [erroNome, setErroNome] = useState("");
  const [erroTelefone, setErroTelefone] = useState("");

  // ========================================
  // VALIDACAO DO NOME
  // ========================================
  const validarNome = (valor: string) => {
    const nomeLimpo = valor.trim();

    if (nomeLimpo.length === 0) {
      setErroNome("O nome e obrigatorio");
      return false;
    }

    if (nomeLimpo.length < 3) {
      setErroNome("O nome deve ter pelo menos 3 caracteres");
      return false;
    }

    if (nomeLimpo.length > 100) {
      setErroNome("O nome deve ter no maximo 100 caracteres");
      return false;
    }

    if (/\d/.test(nomeLimpo)) {
      setErroNome("O nome nao pode conter numeros");
      return false;
    }

    if (!/^[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]+$/.test(nomeLimpo)) {
      setErroNome("O nome contem caracteres invalidos");
      return false;
    }

    if (/(.)\1\1/.test(nomeLimpo)) {
      setErroNome("O nome contem letras repetidas em excesso");
      return false;
    }

    if (!nomeLimpo.replace(/\s/g, '').length) {
      setErroNome("O nome nao pode conter apenas espacos");
      return false;
    }

    setErroNome("");
    return true;
  };

  // ========================================
  // VALIDACAO DO TELEFONE
  // ========================================
  const validarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');

    if (numeros.length === 0) {
      setErroTelefone("O telefone e obrigatorio");
      return false;
    }

    if (numeros.length < 10) {
      setErroTelefone("O telefone deve ter pelo menos 10 digitos");
      return false;
    }

    if (numeros.length > 11) {
      setErroTelefone("O telefone deve ter no maximo 11 digitos");
      return false;
    }

    const ddd = parseInt(numeros.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
      setErroTelefone("DDD invalido");
      return false;
    }

    setErroTelefone("");
    return true;
  };

  // ========================================
  // FORMATACAO DO TELEFONE
  // ========================================
  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');

    if (numeros.length === 0) return '';

    if (numeros.length <= 2) {
      return `(${numeros}`;
    }
    if (numeros.length <= 6) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2)}`;
    }
    if (numeros.length <= 10) {
      return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
    }
    return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7, 11)}`;
  };

  // ========================================
  // HANDLERS
  // ========================================
  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setNome(valor);
    validarNome(valor);
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const apenasNumeros = valor.replace(/\D/g, '');

    if (apenasNumeros.length <= 11) {
      const formatado = formatarTelefone(valor);
      setTelefone(formatado);
      validarTelefone(formatado);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nomeValido = validarNome(nome);
    const telefoneValido = validarTelefone(telefone);

    if (nomeValido && telefoneValido) {
      onNext();
    }
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Seus Dados</h2>
      <p className="text-sm text-slate-500 mb-6">
        Preencha seus dados para confirmar o agendamento
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* NOME */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nome Completo *
          </label>
          <input
            type="text"
            value={nome}
            onChange={handleNomeChange}
            className={`w-full rounded-lg border px-4 py-3 outline-none transition ${erroNome
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
              }`}
            placeholder="Digite seu nome completo"
            maxLength={100}
            required
          />
          {erroNome && (
            <p className="mt-1 text-sm text-red-500">{erroNome}</p>
          )}
          {nome && !erroNome && nome.length > 0 && (
            <p className="mt-1 text-xs text-green-500">Nome valido</p>
          )}
        </div>

        {/* TELEFONE */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Telefone (WhatsApp) *
          </label>
          <input
            type="tel"
            value={telefone}
            onChange={handleTelefoneChange}
            className={`w-full rounded-lg border px-4 py-3 outline-none transition ${erroTelefone
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:ring-2 focus:ring-blue-500'
              }`}
            placeholder="(81) 99999-9999"
            maxLength={15}
            required
          />
          {erroTelefone && (
            <p className="mt-1 text-sm text-red-500">{erroTelefone}</p>
          )}
          {telefone && !erroTelefone && telefone.replace(/\D/g, '').length >= 10 && (
            <p className="mt-1 text-xs text-green-500">Telefone valido</p>
          )}
          <p className="mt-1 text-xs text-slate-400">
            {telefone && telefone.replace(/\D/g, '').length > 0
              ? `${telefone.replace(/\D/g, '').length} digitos`
              : 'Digite o telefone com DDD'}
          </p>
        </div>

        {/* BOTOES */}
        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={loading || !nome || !telefone || !!erroNome || !!erroTelefone}
            className="flex-1 rounded-lg px-6 py-3 text-white font-medium transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: cores.secondary }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Confirmando...
              </span>
            ) : (
              "Confirmar Agendamento"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}