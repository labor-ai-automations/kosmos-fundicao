"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { MapeamentoPdfData } from "@/lib/pdf/types";
import { registerPdfFonts } from "@/lib/pdf/register-fonts";
import { RelatorioMapeamento } from "@/lib/pdf/templates/RelatorioMapeamento";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-mansure-light">
        <p className="text-mansure-gray-dark">Carregando visualizador...</p>
      </div>
    ),
  }
);

interface MapeamentoPDFViewerProps {
  codigo: string;
  includeTimeline: boolean;
  onBack: () => void;
}

export function MapeamentoPDFViewer({
  codigo,
  includeTimeline,
  onBack,
}: MapeamentoPDFViewerProps) {
  const [data, setData] = useState<(MapeamentoPdfData & { includeTimeline: boolean }) | null>(null);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/images/fama-logo.png")
      .then((res) => (res.ok ? res.blob() : Promise.reject()))
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      )
      .then(setLogoSrc)
      .catch(() => setLogoSrc(""));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const carregar = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/mapeamento/pdf-data/${encodeURIComponent(codigo)}?includeTimeline=${includeTimeline}`
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Erro ao carregar dados");
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Erro ao carregar preview"
          );
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    carregar();
    return () => {
      cancelled = true;
    };
  }, [codigo, includeTimeline]);

  const handleDownload = async () => {
    try {
      const res = await fetch(
        `/api/mapeamento/pdf/${encodeURIComponent(codigo)}?includeTimeline=${includeTimeline}`
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Erro ao baixar PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mapeamento-${codigo.replace(/[^\w.-]+/g, "_")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("PDF exportado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao baixar PDF");
    }
  };

  if (loading || logoSrc === null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-mansure-black/95">
        <p className="text-mansure-light">Carregando relatório...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-mansure-black/95">
        <p className="text-mansure-light">Não foi possível carregar o preview.</p>
        <Button type="button" variant="mansurePrimary" onClick={onBack}>
          Voltar
        </Button>
      </div>
    );
  }

  registerPdfFonts();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-mansure-light">
      <div className="flex items-center justify-between border-b border-mansure-gray-light bg-mansure-light px-4 py-3">
        <Button
          type="button"
          size="sm"
          variant="mansureOutline"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
        <p className="text-sm font-semibold text-mansure-black">
          Preview — {codigo}
        </p>
        <Button
          type="button"
          size="sm"
          variant="mansurePrimary"
          onClick={handleDownload}
          className="gap-2"
        >
          <Download className="size-4" />
          Baixar
        </Button>
      </div>

      <div className="min-h-0 flex-1">
        <PDFViewer style={{ width: "100%", height: "100%" }} showToolbar key={logoSrc}>
          <RelatorioMapeamento
            codigo={data.codigo}
            especificacoes={data.especificacoes}
            status={data.status}
            timeline={data.timeline}
            secoes={data.secoes}
            dataGeracao={data.dataGeracao}
            operador={data.operador}
            includeTimeline={includeTimeline}
            logoSrc={logoSrc}
          />
        </PDFViewer>
      </div>
    </div>
  );
}
