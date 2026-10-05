"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Personalizacao } from "../types";

interface Props {
  personalizacao: Personalizacao;
  setPersonalizacao: (personalizacao: Personalizacao) => void;
  onSave: () => Promise<void>;
}

export default function AbaPersonalizacao({ personalizacao, setPersonalizacao, onSave }: Props) {
  const previewLogo = personalizacao.logo || null;
  const previewBanner = personalizacao.banner || null;
  const [nomeLogo, setNomeLogo] = useState<string>("");
  const [nomeBanner, setNomeBanner] = useState<string>("");
  const [salvando, setSalvando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const truncarNome = (nome: string, tamanhoMaximo: number = 20) => {
    if (nome.length <= tamanhoMaximo) return nome;
    const extensao = nome.split('.').pop();
    const nomeSemExtensao = nome.substring(0, nome.lastIndexOf('.'));
    const parteVisivel = nomeSemExtensao.substring(0, tamanhoMaximo);
    return `${parteVisivel}...${extensao ? '.' + extensao : ''}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalizacao({ ...personalizacao, [name]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNomeLogo(truncarNome(file.name, 20));
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPersonalizacao({ ...personalizacao, logo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNomeBanner(truncarNome(file.name, 20));
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPersonalizacao({ ...personalizacao, banner: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removerLogo = () => {
    setPersonalizacao({ ...personalizacao, logo: null });
    setNomeLogo("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const removerBanner = () => {
    setPersonalizacao({ ...personalizacao, banner: null });
    setNomeBanner("");
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setMensagemErro("");
    try {
      await onSave();
    } catch (error) {
      setMensagemErro(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Personalização</h2>
        <p className="mt-1 text-sm text-slate-500">Personalize a aparência da página pública de agendamento</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preview */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-sm font-semibold text-slate-950">Preview da Página do Cliente</h3>
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <div
              className="aspect-[3/1] bg-slate-200 bg-cover bg-center"
              style={previewBanner ? { backgroundImage: `url(${previewBanner})` } : undefined}
            />

            <div className="relative space-y-3 px-6 pb-6 pt-12 text-center">
              {previewLogo ? (
                <Image
                  src={previewLogo}
                  alt="Logo"
                  width={64}
                  height={64}
                  unoptimized
                  className="absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white object-cover shadow-md"
                />
              ) : (
                <div className="absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-slate-100 text-xs text-slate-400 shadow-md">Sem logo</div>
              )}

              <h3 className="font-semibold text-slate-950">{personalizacao.nomeNegocio || "Meu Negócio"}</h3>

              <p className="mx-auto max-w-md text-sm leading-6 text-slate-500">{personalizacao.mensagemBoasVindas || "Bem-vindo! Agende seu horário."}</p>

              <div className="flex justify-center gap-2 pt-2 text-xs text-slate-600">
                <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">Corte</span>
                <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">Barba</span>
                <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">Combo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Uploads */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="text-sm font-semibold text-slate-950">Minha Logo</label>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-center text-xs text-slate-400">
                {previewLogo ? (
                  <Image
                    src={previewLogo}
                    alt="Logo"
                    width={80}
                    height={80}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>Sem logo</span>
                )}
              </div>

              <div className="min-w-0">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  id="logo-upload"
                  className="hidden"
                />
                <label htmlFor="logo-upload" className="inline-flex cursor-pointer rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
                  Upload Logo
                </label>
                {nomeLogo && (
                  <span className="ml-2 text-sm text-slate-600">
                    {nomeLogo}
                  </span>
                )}
                {previewLogo && (
                  <button type="button" onClick={removerLogo} className="ml-2 text-sm font-medium text-red-600 hover:text-red-700">
                    Remover
                  </button>
                )}
                <p className="mt-2 text-xs text-slate-400">Formatos: PNG, JPG, SVG</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="text-sm font-semibold text-slate-950">Banner de Fundo</label>
            <div className="mt-4 flex items-center gap-4">
              <div className="aspect-[3/1] min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-xs text-slate-400">
                {previewBanner && (
                  <Image
                    src={previewBanner}
                    alt="Banner"
                    width={600}
                    height={200}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                )}
                {!previewBanner && <span>Sem banner</span>}
              </div>

              <div className="shrink-0">
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  id="banner-upload"
                  className="hidden"
                />
                <label htmlFor="banner-upload" className="inline-flex cursor-pointer rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
                  Upload Banner
                </label>
                {nomeBanner && (
                  <span className="ml-2 text-sm text-slate-600">
                    {nomeBanner}
                  </span>
                )}
                {previewBanner && (
                  <button type="button" onClick={removerBanner} className="ml-2 text-sm font-medium text-red-600 hover:text-red-700">
                    Remover
                  </button>
                )}
                <p className="mt-2 text-xs text-slate-400"></p>
              </div>
            </div>
          </div>
        </div>
        {/* Mensagem */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <label className="block text-sm font-medium text-slate-700">Mensagem de Boas-vindas</label>
          <textarea
            name="mensagemBoasVindas"
            value={personalizacao.mensagemBoasVindas || ""}
            onChange={handleChange}
            rows={3}
            placeholder="Ex: Bem-vindo ao Meu Negócio! Agende seu horário e aproveite."
            className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {/* Redes Sociais */}
        <div className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nome do Negócio</label>
            <input
              type="text"
              name="nomeNegocio"
              value={personalizacao.nomeNegocio || ""}
              onChange={handleChange}
              placeholder="Ex: Meu Negócio"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Instagram</label>
            <input
              type="text"
              name="instagram"
              value={personalizacao.instagram || ""}
              onChange={handleChange}
              placeholder="@meunegocio"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">WhatsApp</label>
            <input
              type="text"
              name="whatsapp"
              value={personalizacao.whatsapp || ""}
              onChange={handleChange}
              placeholder="(81) 99999-9999"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <div className="flex items-center gap-3">
            {mensagemErro && <p role="alert" className="text-sm text-red-600">{mensagemErro}</p>}
            <button type="submit" disabled={salvando} className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2">
              {salvando ? "Salvando..." : "Salvar Personalização"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}