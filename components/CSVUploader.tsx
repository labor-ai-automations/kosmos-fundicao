"use client";

import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import {
  getExpectedHeaders,
  mapHeaders,
  transformRow,
  validateHeaderMap,
  validateRows,
  type ImportAmbiente,
} from "@/lib/csv-mappers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CSVUploaderProps {
  ambiente: ImportAmbiente;
  onImport: (
    data: Record<string, unknown>[],
    onProgress: (percent: number) => void
  ) => Promise<number>;
}

export function CSVUploader({ ambiente, onImport }: CSVUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [headerMap, setHeaderMap] = useState<Record<string, string>>({});
  const [validatedRows, setValidatedRows] = useState<Record<string, unknown>[]>(
    []
  );
  const [isValidated, setIsValidated] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const previewColumns = Object.values(headerMap);

  const parseFile = useCallback(
    (selectedFile: File) => {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
      setIsValidated(false);
      setValidatedRows([]);
      setValidationErrors([]);

      Papa.parse<Record<string, unknown>>(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data;
          if (data.length === 0) {
            setError("CSV vazio ou sem dados válidos.");
            return;
          }

          const headers = Object.keys(data[0] ?? {});
          const mapped = mapHeaders(headers, ambiente);
          const headerError = validateHeaderMap(mapped, ambiente);

          if (headerError) {
            setError(headerError);
            setHeaderMap({});
            setPreview([]);
            return;
          }

          setHeaderMap(mapped);
          const transformed = data
            .slice(0, 5)
            .map((row) => transformRow(row, mapped));
          setPreview(transformed);
        },
        error: (parseError) => {
          setError(`Erro ao ler CSV: ${parseError.message}`);
        },
      });
    },
    [ambiente]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) parseFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".csv")) {
      parseFile(dropped);
    } else {
      setError("Apenas arquivos .csv são aceitos.");
    }
  };

  const handleValidate = () => {
    if (!file || Object.keys(headerMap).length === 0) {
      setError("Selecione um arquivo CSV válido primeiro.");
      return;
    }

    setLoading(true);
    setError(null);
    setValidationErrors([]);

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        const transformed = data.map((row) => transformRow(row, headerMap));
        const { valid, errors } = validateRows(transformed);

        if (!valid) {
          setValidationErrors(errors);
          setIsValidated(false);
          setValidatedRows([]);
          setError(`${errors.length} erro(s) de validação encontrado(s).`);
        } else {
          setValidatedRows(transformed);
          setIsValidated(true);
          setError(null);
          toast.success(`${transformed.length} linha(s) validadas com sucesso`);
        }
        setLoading(false);
      },
      error: (parseError) => {
        setError(`Erro ao validar: ${parseError.message}`);
        setLoading(false);
      },
    });
  };

  const handleImport = async () => {
    const rows = isValidated ? validatedRows : [];

    if (rows.length === 0) {
      setError("Valide os dados antes de importar.");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const count = await onImport(rows, setProgress);
      setSuccess(true);
      toast.success(`${count} item(ns) importado(s) com sucesso`);
      setFile(null);
      setPreview([]);
      setHeaderMap({});
      setValidatedRows([]);
      setIsValidated(false);
      if (inputRef.current) inputRef.current.value = "";
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : "Erro ao importar dados"
      );
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const formatCell = (value: unknown) => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "SIM" : "NÃO";
    return String(value);
  };

  return (
    <Card className="border-mansure-gray-light bg-white shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? "border-mansure-blue bg-mansure-blue/10"
              : "border-mansure-gray-light hover:bg-mansure-light/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="mx-auto mb-2 size-8 text-mansure-blue" />
          <p className="font-medium text-mansure-black">
            {file ? file.name : "Clique ou arraste um CSV aqui"}
          </p>
          <p className="mt-1 text-xs text-mansure-dark">
            Headers esperados: {getExpectedHeaders(ambiente).join(", ")}
          </p>
        </div>

        {preview.length > 0 && previewColumns.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-mansure-black">
              Preview (primeiras 5 linhas)
            </h3>
            <div className="overflow-x-auto rounded-lg border border-mansure-gray-light">
              <Table>
                <TableHeader>
                  <TableRow className="border-0 bg-mansure-blue hover:bg-mansure-blue">
                    {previewColumns.map((col) => (
                      <TableHead
                        key={col}
                        className="whitespace-nowrap font-semibold text-white"
                      >
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row, i) => (
                    <TableRow
                      key={i}
                      className="border-mansure-gray-light hover:bg-mansure-light/50"
                    >
                      {previewColumns.map((col) => (
                        <TableCell
                          key={`${i}-${col}`}
                          className="whitespace-nowrap text-sm text-mansure-gray-dark"
                        >
                          {formatCell(row[col])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <p className="font-medium">Erros de validação:</p>
            <ul className="mt-1 list-inside list-disc">
              {validationErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {error && !validationErrors.length && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            Importação concluída com sucesso!
          </div>
        )}

        {loading && progress > 0 && (
          <div className="space-y-1">
            <div className="h-2 overflow-hidden rounded-full bg-mansure-gray-light">
              <div
                className="h-full bg-mansure-blue transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-mansure-dark">{progress}%</p>
          </div>
        )}

        {isValidated && (
          <p className="text-sm font-medium text-green-600">
            {validatedRows.length} linha(s) prontas para importar
          </p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleValidate}
            disabled={preview.length === 0 || loading}
            className="h-11 flex-1 border-mansure-gray-light text-mansure-gray-dark"
          >
            {loading && !progress ? "Validando..." : "Validar"}
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!isValidated || loading}
            className="h-11 flex-1 bg-mansure-blue font-semibold hover:bg-mansure-blue/90"
          >
            {loading && progress > 0 ? "Importando..." : "Importar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
