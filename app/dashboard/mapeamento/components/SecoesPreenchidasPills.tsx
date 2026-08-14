import {
  getSecoesPreenchidas,
  type SecoesPreenchidas,
} from "@/lib/mapeamento-config";

interface SecoesPreenchidasPillsProps {
  secoes: Partial<SecoesPreenchidas> | null | undefined;
}

export function SecoesPreenchidasPills({ secoes }: SecoesPreenchidasPillsProps) {
  const preenchidas = getSecoesPreenchidas(secoes);

  if (preenchidas.length === 0) {
    return <span className="text-sm text-mansure-gray-medium">—</span>;
  }

  return (
    <div className="flex max-w-md flex-wrap gap-1.5">
      {preenchidas.map((secao) => (
        <span
          key={secao.id}
          className="inline-flex rounded-full bg-mansure-blue/10 px-2.5 py-0.5 text-xs font-medium text-mansure-blue"
        >
          {secao.nome}
        </span>
      ))}
    </div>
  );
}
