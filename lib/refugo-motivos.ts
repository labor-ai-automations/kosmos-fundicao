/** Siglas de motivo de refugo (cadastro oficial + opções legadas). */
export const REFUGO_MOTIVOS = [
  "CV",
  "DE",
  "FF",
  "IA",
  "IE",
  "MQ",
  "PB",
  "PI",
  "TRINCA",
  "POROSIDADE",
  "RECHUPE",
  "DIMENSIONAL",
  "OUTRO",
] as const;

export type RefugoMotivo = (typeof REFUGO_MOTIVOS)[number];
