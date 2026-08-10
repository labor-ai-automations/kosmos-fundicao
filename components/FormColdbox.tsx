"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import {
  getRecentColdbox,
  insertProducaoColdbox,
  softDeleteColdbox,
} from "@/lib/api-calls";
import { formatDateDisplay } from "@/lib/auth";
import { todayDbString } from "@/lib/date-utils";
import type { ItemColdbox, ProducaoColdbox } from "@/lib/types";
import { DatePicker } from "@/components/DatePicker";
import { ItemCodigoPicker } from "@/components/ItemCodigoPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRODUCAO_FORM_IDS,
  type ProducaoFormProps,
} from "@/lib/producao-form-props";
import {
  HistoryTable,
  type HistoryColumn,
} from "@/components/HistoryTable";
import { zDecimal } from "@/lib/number-utils";
import { observacaoFieldSchema } from "@/lib/producao-observacao";
import { ObservacaoField } from "@/components/ObservacaoField";
import {
  PesoRegistroField,
  parseOptionalNumber,
} from "@/components/PesoRegistroField";
import { DecimalInput } from "@/components/DecimalInput";

const coldboxSchema = z.object({
  data: z.string().min(1, "Data obrigatória"),
  operador: z.string().min(1, "Operador obrigatório"),
  local: z.string().min(1, "Local obrigatório"),
  codigo: z.string().min(1, "Código obrigatório"),
  qtde_caixas: zDecimal(0),
  percas: zDecimal(0),
  ciclo: zDecimal(0),
  pedido_estoque: z.enum(["Pedido", "Estoque"]),
  observacao: observacaoFieldSchema,
});

type ColdboxFormData = z.infer<typeof coldboxSchema>;

const historyColumns: HistoryColumn<ProducaoColdbox>[] = [
  {
    key: "data",
    header: "Data",
    render: (row) => formatDateDisplay(row.data),
  },
  { key: "codigo", header: "Código", render: (row) => row.codigo },
  {
    key: "qtde_caixas",
    header: "Qtde",
    render: (row) => row.qtde_caixas,
  },
  { key: "percas", header: "Percas", render: (row) => row.percas },
  { key: "ciclo", header: "Ciclo", render: (row) => `${row.ciclo}s` },
  {
    key: "peso_registro",
    header: "Peso",
    render: (row) => row.peso_registro ?? "—",
  },
];

export function FormColdbox({
  modal = false,
  onSaved,
  formId = PRODUCAO_FORM_IDS.coldbox,
  hideSubmit = false,
}: ProducaoFormProps = {}) {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<ItemColdbox | null>(null);
  const [pesoRegistro, setPesoRegistro] = useState<number | null>(null);
  const [pesoMachoRegistro, setPesoMachoRegistro] = useState<number | null>(
    null
  );
  const [history, setHistory] = useState<ProducaoColdbox[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof coldboxSchema>, unknown, ColdboxFormData>({
    resolver: zodResolver(coldboxSchema),
    defaultValues: {
      data: todayDbString(),
      local: "CD",
      codigo: "",
      percas: 0,
      pedido_estoque: "Pedido",
      observacao: "",
    },
  });

  const codigo = watch("codigo") ?? "";

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      setHistory(await getRecentColdbox(user.id));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao carregar histórico"
      );
    } finally {
      setLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    if (!modal) {
      loadHistory();
    }
  }, [loadHistory, modal]);

  const handleSelectItem = (item: ItemColdbox) => {
    setSelectedItem(item);
    setPesoRegistro(parseOptionalNumber(item.peso));
    setPesoMachoRegistro(parseOptionalNumber(item.peso_macho));
    setValue("codigo", String(item.codigo ?? ""), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (data: ColdboxFormData) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      await insertProducaoColdbox({
        ...data,
        peso_registro: pesoRegistro,
        peso_macho_registro: pesoMachoRegistro,
        criado_por: user.id,
      });
      toast.success("Registro salvo com sucesso");
      reset({
        data: todayDbString(),
        operador: "",
        local: "CD",
        codigo: "",
        qtde_caixas: 0,
        percas: 0,
        ciclo: 0,
        pedido_estoque: "Pedido",
        observacao: "",
      });
      setSelectedItem(null);
      setPesoRegistro(null);
      setPesoMachoRegistro(null);
      setValue("codigo", "");
      if (modal) {
        onSaved?.();
      } else {
        await loadHistory();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao salvar registro"
      );
    }
  };

  const handleDelete = async (id: string) => {
    await softDeleteColdbox(id);
    toast.success("Registro excluído");
    await loadHistory();
  };

  const formBody = (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className={modal ? "space-y-5" : "kosmos-form-panel space-y-5"}
    >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="kosmos-label">Data</Label>
              <Controller
                name="data"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              {errors.data && (
                <p className="text-sm text-red-400">{errors.data.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="kosmos-label">Operador</Label>
              <Input
                className="kosmos-input"
                {...register("operador")}
              />
              {errors.operador && (
                <p className="text-sm text-red-400">{errors.operador.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="kosmos-label">Local</Label>
            <Controller
              name="local"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="kosmos-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CD">CD</SelectItem>
                    <SelectItem value="OUTRO">Outro</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <input type="hidden" {...register("codigo")} />

          <ItemCodigoPicker
            ambiente="coldbox"
            codigo={codigo || selectedItem?.codigo?.toString() || ""}
            onSelect={(item) => handleSelectItem(item as ItemColdbox)}
            error={errors.codigo?.message}
          >
            {selectedItem && (
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-mansure-gray-light bg-mansure-light p-4 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-xs font-semibold uppercase text-mansure-dark">
                    Árvore
                  </span>
                  <p className="font-medium text-mansure-black">
                    {selectedItem.arvore ?? "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-mansure-dark">
                    Macho
                  </span>
                  <p className="font-medium text-mansure-black">
                    {selectedItem.macho ? "NÃO" : "SIM"}
                  </p>
                </div>
              </div>
            )}
          </ItemCodigoPicker>

          {codigo && (
            <div className="grid gap-3 sm:grid-cols-2">
              <PesoRegistroField
                label="Peso"
                value={pesoRegistro}
                onChange={setPesoRegistro}
              />
              <PesoRegistroField
                label="Peso Macho"
                value={pesoMachoRegistro}
                onChange={setPesoMachoRegistro}
              />
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="kosmos-label">Qtde Caixas</Label>
              <DecimalInput {...register("qtde_caixas")} />
              {errors.qtde_caixas && (
                <p className="text-sm text-red-400">{errors.qtde_caixas.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="kosmos-label">Percas</Label>
              <DecimalInput {...register("percas")} />
            </div>
            <div className="space-y-2">
              <Label className="kosmos-label">Ciclo (seg)</Label>
              <DecimalInput {...register("ciclo")} />
              {errors.ciclo && (
                <p className="text-sm text-red-400">{errors.ciclo.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="kosmos-label">Pedido/Estoque</Label>
            <Controller
              name="pedido_estoque"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) =>
                    field.onChange(val as "Pedido" | "Estoque")
                  }
                >
                  <SelectTrigger className="kosmos-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pedido">Pedido</SelectItem>
                    <SelectItem value="Estoque">Estoque</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <ObservacaoField
            {...register("observacao")}
            error={errors.observacao?.message}
          />

          {!hideSubmit && (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full bg-mansure-blue font-semibold text-mansure-light transition-all duration-300 hover:bg-mansure-blue/90"
            >
              {isSubmitting ? "Salvando..." : "Salvar registro"}
            </Button>
          )}
    </form>
  );

  if (modal) {
    return formBody;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3">{formBody}</div>

      <div className="lg:col-span-2">
        {loadingHistory ? (
          <div className="kosmos-side-panel p-8 text-center text-mansure-dark">
            Carregando histórico...
          </div>
        ) : (
          <HistoryTable
            columns={historyColumns}
            rows={history}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
