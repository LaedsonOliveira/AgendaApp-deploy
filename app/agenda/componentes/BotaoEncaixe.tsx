// components/agenda/BotaoEncaixe.tsx
"use client";



interface Props {
  onClick: () => void;
}

export default function BotaoEncaixe({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto flex w-full touch-manipulation items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 active:scale-[0.98] sm:w-auto sm:mx-0"
    >
      
      <span className="text-center">Encaixe</span>
    </button>
  );
}