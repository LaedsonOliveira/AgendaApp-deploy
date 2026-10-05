import type { SVGProps } from "react";

export type TipoIcone =
  | "alerta"
  | "calendario"
  | "chevron-check"
  | "check"
  | "check-circle"
  | "cifrao"
  | "fechar"
  | "ferramentas"
  | "mais"
  | "relogio"
  | "tesoura"
  | "usuarios"
  | "encaixe";

export default function Icone({ tipo, ...props }: SVGProps<SVGSVGElement> & { tipo: TipoIcone }) {
  const paths: Record<TipoIcone, string> = {
    alerta: "M12 9v4m0 4h.01M10.3 3.8 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z",
    calendario: "M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13H4V6a1 1 0 0 1 1-1Zm3 8h3m-3 3h3",
    "chevron-check": "m5 12 4 4L19 6",
    check: "m5 12 4 4L19 6",
    "check-circle": "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-4-10 3 3 5-6",
    cifrao: "M3 7h18v10H3V7Zm4 3h.01M17 14h.01M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
    fechar: "m6 6 12 12M18 6 6 18",
    ferramentas: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18a2 2 0 1 0 3 3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.2 2.2-2.7-.6-.6-2.7 2.5-1.9Z",
    mais: "M12 5v14M5 12h14",
    relogio: "M12 7v5l3 2m7-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    tesoura: "m6 6 12 12M6 18 18 6M6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
    usuarios: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m6-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-3a3 3 0 0 0 0-6m4 13v-2a4 4 0 0 0-3-3.87",
    encaixe: "M12 2 3 14h7l-1 8 9-12h-7l1-8Z",
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d={paths[tipo]} />
    </svg>
  );
}
