import React from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  formatStatusOperacional,
  STATUS_OPERACIONAL_LABELS,
  type MapeamentoStatusOperacional,
} from "@/lib/mapeamento-status";
import { COLORS, PDF_CONFIG } from "../styles";
import type { MapeamentoPdfData, MapeamentoPdfSecao } from "../types";

export interface RelatorioMapeamentoProps extends MapeamentoPdfData {
  includeTimeline: boolean;
  logoSrc?: string;
}

const FOOTER_TEXT =
  "Confidencial — Uso interno | Desenvolvido por Mansure Technologies";

const styles = StyleSheet.create({
  page: {
    padding: PDF_CONFIG.pageMargins,
    paddingBottom: 52,
    fontFamily: "Montserrat",
    backgroundColor: COLORS.fundo_claro,
    fontSize: 10,
    color: COLORS.preto,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: PDF_CONFIG.pageMargins,
    right: PDF_CONFIG.pageMargins,
    fontSize: 7,
    color: COLORS.cinza_texto,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.cinza_claro,
    paddingTop: 6,
  },
  capaTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: COLORS.azul_primario,
  },
  capaLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    marginBottom: 20,
  },
  kosmosBrandBlock: {
    alignItems: "flex-start",
  },
  kosmosLogoText: {
    fontSize: 26,
    fontWeight: 700,
    color: COLORS.preto,
    letterSpacing: 1.5,
  },
  kosmosTagline: {
    fontSize: 9,
    fontWeight: 600,
    color: COLORS.azul_primario,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    marginTop: 4,
  },
  kosmosAccentBar: {
    marginTop: 6,
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.azul_primario,
  },
  capaLogoDivider: {
    width: 1,
    height: 48,
    backgroundColor: COLORS.cinza_claro,
  },
  capaLogoFama: {
    width: 88,
    height: 32,
    objectFit: "contain",
  },
  capaTitle: {
    fontSize: 29,
    fontWeight: 700,
    color: COLORS.preto,
    marginTop: 4,
  },
  capaMaquinaPill: {
    marginTop: 12,
    marginBottom: 6,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 999,
    backgroundColor: COLORS.azul_primario,
  },
  capaMaquinaText: {
    fontSize: 22,
    fontWeight: 700,
    color: COLORS.branco,
    letterSpacing: 3,
    textTransform: "uppercase",
    textAlign: "center",
  },
  capaCodigo: {
    fontSize: 19,
    fontWeight: 700,
    color: COLORS.azul_primario,
    marginTop: 20,
  },
  capaMeta: {
    fontSize: 9,
    color: COLORS.cinza_texto,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.preto,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.azul_primario,
  },
  subSectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.azul_primario,
    marginBottom: 6,
    marginTop: 4,
  },
  twoCols: {
    flexDirection: "row",
    gap: 16,
  },
  col: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: "48%",
    fontWeight: 700,
    color: COLORS.preto,
    fontSize: 9,
  },
  value: {
    width: "52%",
    color: COLORS.cinza_texto,
    fontSize: 9,
  },
  card: {
    backgroundColor: COLORS.branco,
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.azul_primario,
  },
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.branco,
    marginBottom: 8,
  },
  badgeDisponivel: { backgroundColor: COLORS.verde_disponivel },
  badgeManutencao: { backgroundColor: COLORS.amarelo_manutencao },
  badgeNeutro: { backgroundColor: COLORS.cinza_texto },
  timelineItem: {
    marginBottom: 6,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.azul_primario,
  },
  secaoBlock: {
    marginBottom: 14,
  },
  secaoTitulo: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.preto,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cinza_claro,
  },
  fotoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  fotoBox: {
    width: "48%",
    marginBottom: 6,
  },
  foto: {
    width: "100%",
    height: 145,
    objectFit: "contain",
    backgroundColor: COLORS.branco,
    borderRadius: 4,
  },
  fotoLegenda: {
    fontSize: 7,
    color: COLORS.cinza_texto,
    marginTop: 3,
  },
});

function Footer() {
  return (
    <Text style={styles.footer} fixed>
      {FOOTER_TEXT}
    </Text>
  );
}

function formatPeso(value: number | null | undefined) {
  if (value == null) return "—";
  return `${value} kg`;
}

function statusLabel(status: string | null | undefined) {
  if (!status) return "Aguardando definição";
  return (
    STATUS_OPERACIONAL_LABELS[status as MapeamentoStatusOperacional] ?? status
  );
}

function formatMaquina(origem: string | undefined) {
  if (!origem) return "Origem não identificada";
  const map: Record<string, string> = {
    VICK: "VICK",
    COLDBOX: "COLDBOX",
    MACHARIA: "MACHARIA",
  };
  return map[origem.toUpperCase()] ?? origem.toUpperCase();
}

function chunkSecoes(secoes: MapeamentoPdfSecao[], size: number) {
  const chunks: MapeamentoPdfSecao[][] = [];
  for (let i = 0; i < secoes.length; i += size) {
    chunks.push(secoes.slice(i, i + size));
  }
  return chunks;
}

function SecaoBlock({ secao }: { secao: MapeamentoPdfSecao }) {
  return (
    <View style={styles.secaoBlock}>
      <Text style={styles.secaoTitulo}>{secao.titulo}</Text>

      {secao.endereco_fisico ? (
        <View style={styles.card}>
          <Text style={{ fontSize: 8, fontWeight: 700, color: COLORS.azul_primario }}>
            Endereço físico
          </Text>
          <Text style={{ fontSize: 9, marginTop: 2 }}>{secao.endereco_fisico}</Text>
        </View>
      ) : null}

      {secao.imagens.length > 0 ? (
        <View style={styles.fotoGrid}>
          {secao.imagens.map((foto, idx) => (
            <View key={idx} style={styles.fotoBox}>
              <Image
                src={
                  foto.base64.startsWith("data:")
                    ? foto.base64
                    : `data:image/jpeg;base64,${foto.base64}`
                }
                style={styles.foto}
              />
              <Text style={styles.fotoLegenda}>
                Foto {idx + 1}
                {foto.observacao ? `: ${foto.observacao}` : ""}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ fontSize: 8, color: COLORS.cinza_texto, fontStyle: "italic" }}>
          Nenhuma imagem registrada.
        </Text>
      )}
    </View>
  );
}

function FichaEStatusPage({
  especificacoes,
  status,
  timeline,
  includeTimeline,
}: Pick<
  RelatorioMapeamentoProps,
  "especificacoes" | "status" | "timeline" | "includeTimeline"
>) {
  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Resumo do Mapeamento</Text>

      <View style={styles.twoCols}>
        <View style={styles.col}>
          <Text style={styles.subSectionTitle}>Ficha técnica</Text>
          <View style={styles.card}>
            <Text style={{ fontSize: 9, fontWeight: 700 }}>Origem</Text>
            <Text style={{ fontSize: 9, color: COLORS.cinza_texto }}>
              {especificacoes.origem ?? "Não informado"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Peso da peça:</Text>
            <Text style={styles.value}>
              {formatPeso(especificacoes.peso_peca ?? especificacoes.peso)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Árvore:</Text>
            <Text style={styles.value}>
              {especificacoes.arvore != null ? String(especificacoes.arvore) : "—"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Macho:</Text>
            <Text style={styles.value}>
              {especificacoes.macho != null
                ? especificacoes.macho
                  ? "SIM"
                  : "NÃO"
                : "—"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PP:</Text>
            <Text style={styles.value}>{formatPeso(especificacoes.pp)}</Text>
          </View>

          <Text style={{ ...styles.subSectionTitle, marginTop: 10 }}>
            Configuração Vick
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Meia placa:</Text>
            <Text style={styles.value}>
              {especificacoes.eh_meia_placa ? "SIM" : "NÃO"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Manual:</Text>
            <Text style={styles.value}>
              {especificacoes.eh_manual ? "SIM" : "NÃO"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Segundo código:</Text>
            <Text style={styles.value}>
              {especificacoes.segundo_codigo ?? "—"}
            </Text>
          </View>
        </View>

        <View style={styles.col}>
          <Text style={styles.subSectionTitle}>Status operacional</Text>
          <View
            style={[
              styles.badge,
              status.status_atual === "disponivel"
                ? styles.badgeDisponivel
                : status.status_atual === "em_manutencao"
                  ? styles.badgeManutencao
                  : styles.badgeNeutro,
            ]}
          >
            <Text>{statusLabel(status.status_atual).toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Definido em:</Text>
            <Text style={styles.value}>
              {status.status_definido_em
                ? new Date(status.status_definido_em).toLocaleString("pt-BR")
                : "—"}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Última alteração por:</Text>
            <Text style={styles.value}>{status.criado_por_nome ?? "—"}</Text>
          </View>

          {includeTimeline && timeline && timeline.length > 0 && (
            <>
              <Text style={{ ...styles.subSectionTitle, marginTop: 10 }}>
                Histórico de status
              </Text>
              {timeline.map((item) => (
                <View key={item.id} style={styles.timelineItem}>
                  <Text style={{ fontWeight: 700, fontSize: 8 }}>
                    {new Date(item.criado_em).toLocaleString("pt-BR")} —{" "}
                    {formatStatusOperacional(
                      item.status as MapeamentoStatusOperacional
                    )}
                  </Text>
                  <Text
                    style={{
                      fontSize: 7,
                      color: COLORS.cinza_texto,
                      marginTop: 1,
                    }}
                  >
                    {item.criado_por_nome}
                    {item.observacao ? ` — ${item.observacao}` : ""}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      </View>

      <Footer />
    </Page>
  );
}

export function RelatorioMapeamento({
  codigo,
  especificacoes,
  status,
  timeline = [],
  secoes = [],
  dataGeracao,
  operador,
  includeTimeline,
  logoSrc,
}: RelatorioMapeamentoProps) {
  const secoesPorPagina = chunkSecoes(secoes, 3);
  const famaLogo = logoSrc?.trim() ?? "";

  return (
    <Document
      title={`Mapeamento ${codigo}`}
      author="Mansure Technologies"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.capaTopBar} fixed />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 36,
          }}
        >
          <View style={styles.capaLogoRow}>
            <View style={styles.kosmosBrandBlock}>
              <Text style={styles.kosmosLogoText}>KOSMOS</Text>
              <Text style={styles.kosmosTagline}>Controle de Produção</Text>
              <View style={styles.kosmosAccentBar} />
            </View>
            {famaLogo ? (
              <>
                <View style={styles.capaLogoDivider} />
                <Image src={famaLogo} style={styles.capaLogoFama} />
              </>
            ) : null}
          </View>
          <Text style={styles.capaTitle}>MAPEAMENTO DE PEÇA</Text>
          <View style={styles.capaMaquinaPill}>
            <Text style={styles.capaMaquinaText}>
              {formatMaquina(especificacoes.origem)}
            </Text>
          </View>
          <Text style={styles.capaCodigo}>Código: {codigo}</Text>
          <Text style={{ ...styles.capaMeta, marginTop: 40 }}>
            Gerado em: {dataGeracao}
          </Text>
          <Text style={styles.capaMeta}>Operador: {operador}</Text>
        </View>
        <Footer />
      </Page>

      <FichaEStatusPage
        especificacoes={especificacoes}
        status={status}
        timeline={timeline}
        includeTimeline={includeTimeline}
      />

      {secoesPorPagina.map((grupo, pageIdx) => (
        <Page key={`secoes-${pageIdx}`} size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>
            Mapeamento visual
            {secoesPorPagina.length > 1
              ? ` (${pageIdx + 1}/${secoesPorPagina.length})`
              : ""}
          </Text>
          {grupo.map((secao) => (
            <SecaoBlock key={secao.secao} secao={secao} />
          ))}
          <Footer />
        </Page>
      ))}
    </Document>
  );
}
