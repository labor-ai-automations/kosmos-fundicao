export interface MapeamentoPdfEspecificacoes {
  origem?: string;
  peso_peca?: number | null;
  peso?: number | null;
  arvore?: number | null;
  macho?: boolean | null;
  pp?: number | null;
  eh_meia_placa?: boolean;
  eh_manual?: boolean;
  segundo_codigo?: string | null;
}

export interface MapeamentoPdfStatus {
  status_atual: string | null;
  status_definido_em: string | null;
  criado_por_nome?: string | null;
}

export interface MapeamentoPdfTimelineItem {
  id: string;
  status: string;
  status_anterior?: string | null;
  observacao?: string | null;
  criado_em: string;
  criado_por_nome: string;
}

export interface MapeamentoPdfSecao {
  secao: string;
  titulo: string;
  endereco_fisico?: string | null;
  imagens: Array<{ base64: string; observacao: string }>;
}

export interface MapeamentoPdfData {
  codigo: string;
  especificacoes: MapeamentoPdfEspecificacoes;
  status: MapeamentoPdfStatus;
  timeline: MapeamentoPdfTimelineItem[];
  secoes: MapeamentoPdfSecao[];
  dataGeracao: string;
  operador: string;
}
