export const MACHARIAS_OPCOES = [
  { value: "HV2", label: "HV2" },
  { value: "MANUAL", label: "MANUAL" },
  { value: "SEMIAUTOMÁTICA", label: "SEMIAUTOMÁTICA" },
  { value: "ORIGETEC", label: "ORIGETEC" },
] as const;

export const FUNCOES_OPCOES = [
  { value: "PRODUZIR", label: "PRODUZIR" },
  { value: "PREPARAÇÃO", label: "PREPARAÇÃO" },
] as const;

export const TURNOS_OPCOES = [
  { value: "MANHÃ", label: "MANHÃ" },
  { value: "TARDE", label: "TARDE" },
  { value: "NOITE", label: "NOITE" },
] as const;

export type MachariaType = (typeof MACHARIAS_OPCOES)[number]["value"];
export type FuncaoType = (typeof FUNCOES_OPCOES)[number]["value"];

export const MACHARIA_VALUES = MACHARIAS_OPCOES.map((o) => o.value) as [
  MachariaType,
  ...MachariaType[],
];

export const FUNCAO_VALUES = FUNCOES_OPCOES.map((o) => o.value) as [
  FuncaoType,
  ...FuncaoType[],
];

export const TURNO_VALUES = TURNOS_OPCOES.map((o) => o.value) as [
  string,
  ...string[],
];

export function calcularDuracaoMacharia(
  horaInicial: string,
  horaFinal: string
): string {
  if (!horaInicial || !horaFinal) return "—";

  const [hI, mI] = horaInicial.split(":").map(Number);
  const [hF, mF] = horaFinal.split(":").map(Number);

  if ([hI, mI, hF, mF].some((n) => Number.isNaN(n))) return "—";

  let minutos = hF * 60 + mF - (hI * 60 + mI);
  if (minutos < 0) minutos += 24 * 60;

  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;

  return `${horas}h ${mins}m`;
}
