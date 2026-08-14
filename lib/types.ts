export interface Usuario {
  id: string;
  email: string;
  nome: string | null;
  criado_em: string;
}

export interface ItemVick {
  id: string;
  codigo: string;
  arvore: number | null;
  pp: number | null;
  macho: boolean;
  macho_1: number | null;
  macho_2: number | null;
  peso_peca: number | null;
}

export interface ItemColdbox {
  id: string;
  codigo: string;
  arvore: number | null;
  peso: number | null;
  macho: boolean;
  peso_macho: number | null;
}

export interface ItemMacharia {
  id: string;
  codigo: string;
  peso_1: number | null;
  peso_2: number | null;
  gasagem: number | null;
  macho_1: number | null;
  macho_2: number | null;
  qtde_ferramenta: number | null;
  tempo_total: string | null;
}

export type ItemAmbiente = "vick" | "coldbox" | "macharia";

export type InsertItemVick = Omit<ItemVick, "id">;
export type InsertItemColdbox = Omit<ItemColdbox, "id">;
export type InsertItemMacharia = Omit<ItemMacharia, "id">;

export type UpdateItemVick = Partial<InsertItemVick>;
export type UpdateItemColdbox = Partial<InsertItemColdbox>;
export type UpdateItemMacharia = Partial<InsertItemMacharia>;

export interface ProducaoVick {
  id: string;
  data: string;
  codigo: string;
  codigo_2?: string | null;
  eh_meia_placa?: boolean;
  eh_manual?: boolean;
  tipo_placa?: string | null;
  qtde_caixas: number;
  percas: number;
  setup: boolean;
  pedido_estoque: "Pedido" | "Estoque";
  peso_registro: number | null;
  observacao: string | null;
  criado_em: string;
  criado_por: string;
  deleted_at: string | null;
  archived_at?: string | null;
  archived_by?: string | null;
}

export interface ProducaoColdbox {
  id: string;
  data: string;
  operador: string;
  local: string;
  codigo: string;
  qtde_caixas: number;
  percas: number;
  ciclo: number;
  pedido_estoque: "Pedido" | "Estoque";
  peso_registro: number | null;
  peso_macho_registro: number | null;
  observacao: string | null;
  criado_em: string;
  criado_por: string;
  deleted_at: string | null;
  archived_at?: string | null;
  archived_by?: string | null;
}

export interface ProducaoMacharia {
  id: string;
  data: string;
  colaborador: string;
  maquina: string;
  funcao: string;
  turno: string;
  codigo: string;
  hora_inicial: string;
  hora_final: string;
  qtde_feita: number;
  qtde_perdida: number;
  peso_registro: number | null;
  peso_registro_2: number | null;
  observacao: string | null;
  criado_em: string;
  criado_por: string;
  deleted_at: string | null;
  archived_at?: string | null;
  archived_by?: string | null;
}

export interface Refugo {
  id: string;
  data: string;
  codigo: string;
  fundicao: string;
  qtde_perdida: number;
  motivo: string;
  observacao: string | null;
  peso_registro: number | null;
  criado_em: string;
  criado_por: string;
  deleted_at: string | null;
}

export type ProductionTable =
  | "producao_vick"
  | "producao_coldbox"
  | "producao_macharia"
  | "refugo";

export type InsertProducaoVick = Omit<
  ProducaoVick,
  "id" | "criado_em" | "deleted_at"
>;

export type InsertProducaoColdbox = Omit<
  ProducaoColdbox,
  "id" | "criado_em" | "deleted_at"
>;

export type InsertProducaoMacharia = Omit<
  ProducaoMacharia,
  "id" | "criado_em" | "deleted_at"
>;

export type InsertRefugo = Omit<Refugo, "id" | "criado_em" | "deleted_at">;

export interface AuthUser {
  id: string;
  email: string;
  nome: string;
}

export interface RecordsFilter {
  data?: string;
  dataFrom?: string;
  dataTo?: string;
  search?: string;
  pesoMin?: number;
  pesoMax?: number;
  caixasMin?: number;
  caixasMax?: number;
  setup?: boolean;
  ehMeiaPlaca?: boolean;
  ehManual?: boolean;
  pedidoEstoque?: string[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  /** Quando true, retorna apenas registros arquivados (somente tabelas arquiváveis) */
  archivedOnly?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type RecordWithUser = {
  criado_por_nome?: string | null;
  criado_por_email?: string | null;
};

export interface MapeamentoPeca {
  id: string;
  codigo: string;
  secao: string;
  imagens: import("./mapeamento-config").MapeamentoFoto[];
  endereco_fisico: string | null;
  criado_em: string;
  criado_por: string | null;
  atualizado_em: string;
  atualizado_por: string | null;
  deleted_at: string | null;
}

export interface MapeamentoRegistro {
  id: string;
  codigo: string;
  /** Progresso das 6 seções: rascunho | completo */
  status: "rascunho" | "completo";
  status_atual: import("./mapeamento-status").MapeamentoStatusOperacional | null;
  status_definido_em: string | null;
  secoes_preenchidas: import("./mapeamento-config").SecoesPreenchidas;
  criado_em: string;
  criado_por: string | null;
  atualizado_em: string;
  atualizado_por: string | null;
  deleted_at: string | null;
}

export type {
  MapeamentoAnexo,
  MapeamentoStatusOperacional,
  MapeamentoTimelineItem,
  MapeamentoVickConfig,
} from "./mapeamento-status";

export type {
  MapeamentoFoto,
  MapeamentoSecaoId,
  SecoesPreenchidas,
} from "./mapeamento-config";

export type MapeamentoItemSpecs = {
  codigo: string;
  origem: "vick" | "coldbox" | "macharia";
  peso_peca?: number | null;
  peso?: number | null;
  arvore?: number | null;
  macho?: boolean | null;
  pp?: number | null;
};
