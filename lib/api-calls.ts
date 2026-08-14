import { createClient } from "@/lib/supabase/client";
import type {
  InsertProducaoColdbox,
  InsertProducaoMacharia,
  InsertProducaoVick,
  InsertRefugo,
  InsertItemColdbox,
  InsertItemMacharia,
  InsertItemVick,
  ItemColdbox,
  ItemMacharia,
  ItemVick,
  PaginatedResult,
  ProducaoColdbox,
  ProducaoMacharia,
  ProducaoVick,
  ProductionTable,
  RecordsFilter,
  Refugo,
  RecordWithUser,
  UpdateItemColdbox,
  UpdateItemMacharia,
  UpdateItemVick,
} from "@/lib/types";
import { isArchivableProductionTable } from "@/lib/archive-config";
import type { RefugoSelectorItem } from "@/lib/refugo-selector-config";

const PAGE_SIZE = 20;

function getClient() {
  return createClient();
}

// --- Itens VICK ---

export async function getItensVick(): Promise<ItemVick[]> {
  const { data, error } = await getClient()
    .from("itens_vick")
    .select("*")
    .order("codigo");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getItemVickByCodigo(
  codigo: string
): Promise<ItemVick | null> {
  const { data, error } = await getClient()
    .from("itens_vick")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

// --- Itens COLDBOX ---

export async function getItensColdbox(): Promise<ItemColdbox[]> {
  const { data, error } = await getClient()
    .from("itens_coldbox")
    .select("*")
    .order("codigo");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getItemColdboxByCodigo(
  codigo: string
): Promise<ItemColdbox | null> {
  const { data, error } = await getClient()
    .from("itens_coldbox")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

// --- Itens MACHARIA ---

export async function getItensMacharia(): Promise<ItemMacharia[]> {
  const { data, error } = await getClient()
    .from("itens_macharia")
    .select("*")
    .order("codigo");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getItemMachariaByCodigo(
  codigo: string
): Promise<ItemMacharia | null> {
  const { data, error } = await getClient()
    .from("itens_macharia")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

// --- CRUD Itens ---

export async function getItemCounts(): Promise<{
  vick: number;
  coldbox: number;
  macharia: number;
}> {
  const client = getClient();
  const [vick, coldbox, macharia] = await Promise.all([
    client.from("itens_vick").select("*", { count: "exact", head: true }),
    client.from("itens_coldbox").select("*", { count: "exact", head: true }),
    client.from("itens_macharia").select("*", { count: "exact", head: true }),
  ]);

  if (vick.error) throw new Error(vick.error.message);
  if (coldbox.error) throw new Error(coldbox.error.message);
  if (macharia.error) throw new Error(macharia.error.message);

  return {
    vick: vick.count ?? 0,
    coldbox: coldbox.count ?? 0,
    macharia: macharia.count ?? 0,
  };
}

export async function createItemVick(
  payload: InsertItemVick
): Promise<ItemVick> {
  const { data, error } = await getClient()
    .from("itens_vick")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateItemVick(
  id: string,
  payload: UpdateItemVick
): Promise<ItemVick> {
  const { data, error } = await getClient()
    .from("itens_vick")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteItemVick(id: string): Promise<void> {
  const { error } = await getClient().from("itens_vick").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createItemColdbox(
  payload: InsertItemColdbox
): Promise<ItemColdbox> {
  const { data, error } = await getClient()
    .from("itens_coldbox")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateItemColdbox(
  id: string,
  payload: UpdateItemColdbox
): Promise<ItemColdbox> {
  const { data, error } = await getClient()
    .from("itens_coldbox")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteItemColdbox(id: string): Promise<void> {
  const { error } = await getClient()
    .from("itens_coldbox")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createItemMacharia(
  payload: InsertItemMacharia
): Promise<ItemMacharia> {
  const { data, error } = await getClient()
    .from("itens_macharia")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateItemMacharia(
  id: string,
  payload: UpdateItemMacharia
): Promise<ItemMacharia> {
  const { data, error } = await getClient()
    .from("itens_macharia")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteItemMacharia(id: string): Promise<void> {
  const { error } = await getClient()
    .from("itens_macharia")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// --- Itens REFUGO (busca unificada) ---

export async function getAllCodigosRefugo(): Promise<string[]> {
  const items = await getItensRefugo();
  return items.map((item) => item.codigo);
}

export async function getItensRefugo(): Promise<RefugoSelectorItem[]> {
  const [vick, coldbox, macharia] = await Promise.all([
    getItensVick(),
    getItensColdbox(),
    getItensMacharia(),
  ]);

  const seen = new Set<string>();
  const items: RefugoSelectorItem[] = [];

  for (const item of vick) {
    if (seen.has(item.codigo)) continue;
    seen.add(item.codigo);
    items.push({
      id: item.id,
      codigo: item.codigo,
      origem: "VICK",
      arvore: item.arvore,
      pp: item.pp,
      macho: item.macho,
      macho_1: item.macho_1,
      macho_2: item.macho_2,
      peso_peca: item.peso_peca,
      peso: null,
      peso_macho: null,
      peso_1: null,
      peso_2: null,
      gasagem: null,
      qtde_ferramenta: null,
      tempo_total: null,
    });
  }

  for (const item of coldbox) {
    if (seen.has(item.codigo)) continue;
    seen.add(item.codigo);
    items.push({
      id: item.id,
      codigo: item.codigo,
      origem: "COLDBOX",
      arvore: item.arvore,
      pp: null,
      macho: item.macho,
      macho_1: null,
      macho_2: null,
      peso_peca: null,
      peso: item.peso,
      peso_macho: item.peso_macho,
      peso_1: null,
      peso_2: null,
      gasagem: null,
      qtde_ferramenta: null,
      tempo_total: null,
    });
  }

  for (const item of macharia) {
    if (seen.has(item.codigo)) continue;
    seen.add(item.codigo);
    items.push({
      id: item.id,
      codigo: item.codigo,
      origem: "MACHARIA",
      arvore: null,
      pp: null,
      macho: null,
      macho_1: item.macho_1,
      macho_2: item.macho_2,
      peso_peca: null,
      peso: null,
      peso_macho: null,
      peso_1: item.peso_1,
      peso_2: item.peso_2,
      gasagem: item.gasagem,
      qtde_ferramenta: item.qtde_ferramenta,
      tempo_total: item.tempo_total,
    });
  }

  return items.sort((a, b) => a.codigo.localeCompare(b.codigo));
}

export async function getPesoPecaForRefugo(
  codigo: string
): Promise<string | null> {
  const vick = await getItemVickByCodigo(codigo);
  if (vick) return vick.peso_peca?.toString() ?? null;

  const coldbox = await getItemColdboxByCodigo(codigo);
  if (coldbox) return coldbox.peso?.toString() ?? null;

  const macharia = await getItemMachariaByCodigo(codigo);
  if (macharia) return macharia.peso_1?.toString() ?? null;

  return null;
}

// --- Import CSV ---

const IMPORT_BATCH_SIZE = 100;

async function batchInsert(
  table: "itens_vick" | "itens_coldbox" | "itens_macharia",
  rows: Record<string, unknown>[],
  onProgress?: (percent: number) => void
): Promise<number> {
  let inserted = 0;

  for (let i = 0; i < rows.length; i += IMPORT_BATCH_SIZE) {
    const batch = rows.slice(i, i + IMPORT_BATCH_SIZE);
    const { error } = await getClient().from(table).insert(batch);
    if (error) throw new Error(error.message);
    inserted += batch.length;
    onProgress?.(Math.round((inserted / rows.length) * 100));
  }

  return inserted;
}

export async function importItensVick(
  rows: Record<string, unknown>[],
  onProgress?: (percent: number) => void
): Promise<number> {
  return batchInsert("itens_vick", rows, onProgress);
}

export async function importItensColdbox(
  rows: Record<string, unknown>[],
  onProgress?: (percent: number) => void
): Promise<number> {
  return batchInsert("itens_coldbox", rows, onProgress);
}

export async function importItensMacharia(
  rows: Record<string, unknown>[],
  onProgress?: (percent: number) => void
): Promise<number> {
  return batchInsert("itens_macharia", rows, onProgress);
}

// --- VICK produção ---

export async function insertProducaoVick(
  payload: InsertProducaoVick
): Promise<ProducaoVick> {
  const { data, error } = await getClient()
    .from("producao_vick")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getRecentVick(
  userId: string,
  limit = 10
): Promise<ProducaoVick[]> {
  const { data, error } = await getClient()
    .from("producao_vick")
    .select("*")
    .eq("criado_por", userId)
    .is("deleted_at", null)
    .order("criado_em", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function softDeleteVick(id: string): Promise<void> {
  const { error } = await getClient()
    .from("producao_vick")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function updateProducaoVick(
  id: string,
  payload: Partial<InsertProducaoVick>
): Promise<ProducaoVick> {
  const { data, error } = await getClient()
    .from("producao_vick")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// --- COLDBOX ---

export async function insertProducaoColdbox(
  payload: InsertProducaoColdbox
): Promise<ProducaoColdbox> {
  const { data, error } = await getClient()
    .from("producao_coldbox")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getRecentColdbox(
  userId: string,
  limit = 10
): Promise<ProducaoColdbox[]> {
  const { data, error } = await getClient()
    .from("producao_coldbox")
    .select("*")
    .eq("criado_por", userId)
    .is("deleted_at", null)
    .order("criado_em", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function softDeleteColdbox(id: string): Promise<void> {
  const { error } = await getClient()
    .from("producao_coldbox")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function updateProducaoColdbox(
  id: string,
  payload: Partial<InsertProducaoColdbox>
): Promise<ProducaoColdbox> {
  const { data, error } = await getClient()
    .from("producao_coldbox")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// --- MACHARIA ---

export async function insertProducaoMacharia(
  payload: InsertProducaoMacharia
): Promise<ProducaoMacharia> {
  const { data, error } = await getClient()
    .from("producao_macharia")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getRecentMacharia(
  userId: string,
  limit = 10
): Promise<ProducaoMacharia[]> {
  const { data, error } = await getClient()
    .from("producao_macharia")
    .select("*")
    .eq("criado_por", userId)
    .is("deleted_at", null)
    .order("criado_em", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function softDeleteMacharia(id: string): Promise<void> {
  const { error } = await getClient()
    .from("producao_macharia")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function updateProducaoMacharia(
  id: string,
  payload: Partial<InsertProducaoMacharia>
): Promise<ProducaoMacharia> {
  const { data, error } = await getClient()
    .from("producao_macharia")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// --- REFUGO ---

export async function insertRefugo(payload: InsertRefugo): Promise<Refugo> {
  const { data, error } = await getClient()
    .from("refugo")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getRecentRefugo(
  userId: string,
  limit = 10
): Promise<Refugo[]> {
  const { data, error } = await getClient()
    .from("refugo")
    .select("*")
    .eq("criado_por", userId)
    .is("deleted_at", null)
    .order("criado_em", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function softDeleteRefugo(id: string): Promise<void> {
  const { error } = await getClient()
    .from("refugo")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function updateRefugo(
  id: string,
  payload: Partial<InsertRefugo>
): Promise<Refugo> {
  const { data, error } = await getClient()
    .from("refugo")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getTodayRecentProduction(
  table: ProductionTable,
  limit = 3
): Promise<
  (ProducaoVick | ProducaoColdbox | ProducaoMacharia | Refugo)[]
> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await getClient()
    .from(table)
    .select("*")
    .eq("data", today)
    .is("deleted_at", null)
    .order("criado_em", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

// --- Records (paginated) ---

type RecordRow = (ProducaoVick | ProducaoColdbox | ProducaoMacharia | Refugo) &
  RecordWithUser;

async function attachUserNames<T extends { criado_por: string }>(
  rows: T[]
): Promise<(T & RecordWithUser)[]> {
  if (rows.length === 0) return rows;

  const userIds = [...new Set(rows.map((r) => r.criado_por))];
  const { data: users } = await getClient()
    .from("usuarios")
    .select("id, nome, email")
    .in("id", userIds);

  const userMap = new Map(
    (users ?? []).map((u) => [u.id, { nome: u.nome, email: u.email }])
  );

  const {
    data: { user: sessionUser },
  } = await getClient().auth.getUser();

  return rows.map((row) => {
    const profile = userMap.get(row.criado_por);
    const isSessionUser = sessionUser?.id === row.criado_por;

    return {
      ...row,
      criado_por_nome: profile?.nome ?? null,
      criado_por_email:
        profile?.email ??
        (isSessionUser ? (sessionUser.email ?? null) : null),
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyRecordsFilters(query: any, table: ProductionTable, filters: RecordsFilter) {
  let next = query.is("deleted_at", null);

  if (isArchivableProductionTable(table)) {
    if (filters.archivedOnly) {
      next = next.not("archived_at", "is", null);
    } else {
      next = next.is("archived_at", null);
    }
  }

  if (filters.data) {
    next = next.eq("data", filters.data);
  }
  if (filters.dataFrom) {
    next = next.gte("data", filters.dataFrom);
  }
  if (filters.dataTo) {
    next = next.lte("data", filters.dataTo);
  }
  if (filters.search?.trim()) {
    const term = filters.search.trim().replace(/[%_]/g, "");
    next = next.or(`codigo.ilike.%${term}%,observacao.ilike.%${term}%`);
  }
  if (filters.pesoMin != null) {
    next = next.gte("peso_registro", filters.pesoMin);
  }
  if (filters.pesoMax != null) {
    next = next.lte("peso_registro", filters.pesoMax);
  }
  if (
    filters.caixasMin != null &&
    (table === "producao_vick" || table === "producao_coldbox")
  ) {
    next = next.gte("qtde_caixas", filters.caixasMin);
  }
  if (
    filters.caixasMax != null &&
    (table === "producao_vick" || table === "producao_coldbox")
  ) {
    next = next.lte("qtde_caixas", filters.caixasMax);
  }
  if (filters.setup != null && table === "producao_vick") {
    next = next.eq("setup", filters.setup);
  }
  if (filters.ehMeiaPlaca != null && table === "producao_vick") {
    next = next.eq("eh_meia_placa", filters.ehMeiaPlaca);
  }
  if (filters.ehManual != null && table === "producao_vick") {
    next = next.eq("eh_manual", filters.ehManual);
  }
  if (
    filters.pedidoEstoque &&
    filters.pedidoEstoque.length > 0 &&
    (table === "producao_vick" || table === "producao_coldbox")
  ) {
    next = next.in("pedido_estoque", filters.pedidoEstoque);
  }

  return next;
}

const SORTABLE_COLUMNS: Partial<Record<ProductionTable, Record<string, string>>> = {
  producao_vick: {
    data: "data",
    codigo: "codigo",
    peso: "peso_registro",
    caixas: "qtde_caixas",
    percas: "percas",
    setup: "setup",
    meia_placa: "eh_meia_placa",
    manual: "eh_manual",
    pedido_estoque: "pedido_estoque",
    criado_em: "criado_em",
    archived_at: "archived_at",
  },
  producao_coldbox: {
    data: "data",
    codigo: "codigo",
    peso: "peso_registro",
    caixas: "qtde_caixas",
    percas: "percas",
    ciclo: "ciclo",
    operador: "operador",
    local: "local",
    pedido_estoque: "pedido_estoque",
    criado_em: "criado_em",
    archived_at: "archived_at",
  },
  producao_macharia: {
    data: "data",
    codigo: "codigo",
    peso: "peso_registro",
    peso_2: "peso_registro_2",
    qtde_feita: "qtde_feita",
    qtde_perdida: "qtde_perdida",
    colaborador: "colaborador",
    maquina: "maquina",
    funcao: "funcao",
    turno: "turno",
    hora_inicial: "hora_inicial",
    hora_final: "hora_final",
    criado_em: "criado_em",
    archived_at: "archived_at",
  },
  refugo: {
    data: "data",
    codigo: "codigo",
    peso: "peso_registro",
    fundicao: "fundicao",
    qtde_perdida: "qtde_perdida",
    motivo: "motivo",
    criado_em: "criado_em",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyRecordsSorting(query: any, table: ProductionTable, filters: RecordsFilter) {
  const sortColumn =
    filters.sortBy && SORTABLE_COLUMNS[table]?.[filters.sortBy]
      ? SORTABLE_COLUMNS[table]![filters.sortBy]
      : null;

  if (sortColumn) {
    return query
      .order(sortColumn, { ascending: filters.sortDirection === "asc" })
      .order("criado_em", { ascending: false });
  }

  return query.order("data", { ascending: false }).order("criado_em", { ascending: false });
}

export async function getAllRecords(
  table: ProductionTable,
  page = 1,
  filters: RecordsFilter = {},
  pageSize = PAGE_SIZE
): Promise<PaginatedResult<RecordRow>> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = getClient().from(table).select("*", { count: "exact" });
  query = applyRecordsFilters(query, table, filters);
  query = applyRecordsSorting(query, table, filters);

  const { data, error, count } = await query.range(from, to);

  if (error) throw new Error(error.message);

  const withUsers = await attachUserNames(data ?? []);

  return {
    data: withUsers as RecordRow[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getRecordsForExport(
  table: ProductionTable,
  filters: RecordsFilter = {},
  limit = 5000
): Promise<RecordRow[]> {
  let query = getClient().from(table).select("*");
  query = applyRecordsFilters(query, table, filters);
  query = applyRecordsSorting(query, table, filters);

  const { data, error } = await query.limit(limit);

  if (error) throw new Error(error.message);

  const withUsers = await attachUserNames(data ?? []);
  return withUsers as RecordRow[];
}

export async function softDeleteRecord(
  table: ProductionTable,
  id: string
): Promise<void> {
  const { error } = await getClient()
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export { PAGE_SIZE };
