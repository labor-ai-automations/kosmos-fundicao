"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import {
  getRecentVick,
  insertProducaoVick,
  softDeleteVick,
} from "@/lib/api-calls";
import { formatDateDisplay } from "@/lib/auth";
import { todayDbString } from "@/lib/date-utils";
import type { ItemVick, ProducaoVick } from "@/lib/types";
import { DatePicker } from "@/components/DatePicker";
import { ItemCodigoPicker } from "@/components/ItemCodigoPicker";
import { DecimalInput } from "@/components/DecimalInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

const vickSchema = z.object({
  data: z.string().min(1, "Data obrigatória"),
  codigo: z.string().min(1, "Código obrigatório"),
  qtde_caixas: zDecimal(0),
  percas: zDecimal(0),
  setup: z.boolean(),
  pedido_estoque: z.enum(["Pedido", "Estoque"]),
  observacao: observacaoFieldSchema,
});

type VickFormData = z.infer<typeof vickSchema>;

const historyColumns: HistoryColumn<ProducaoVick>[] = [
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
  {
    key: "setup",
    header: "Setup",
    render: (row) => (row.setup ? "Sim" : "Não"),
  },
  {
    key: "peso_registro",
    header: "Peso",
    render: (row) => row.peso_registro ?? "—",
  },
];

export function FormVick({
  modal = false,
  onSaved,
  formId = PRODUCAO_FORM_IDS.vick,
  hideSubmit = false,
}: ProducaoFormProps = {}) {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<ItemVick | null>(null);
  const [pesoRegistro, setPesoRegistro] = useState<number | null>(null);
  const [history, setHistory] = useState<ProducaoVick[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof vickSchema>, unknown, VickFormData>({
    resolver: zodResolver(vickSchema),
    defaultValues: {
      data: todayDbString(),
      codigo: "",
      percas: 0,
      setup: false,
      pedido_estoque: "Pedido",
      observacao: "",
    },
  });

  const codigo = watch("codigo") ?? "";

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const rows = await getRecentVick(user.id);
      setHistory(rows);
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

  const handleSelectItem = (item: ItemVick) => {
    setSelectedItem(item);
    setPesoRegistro(parseOptionalNumber(item.peso_peca));
    setValue("codigo", String(item.codigo ?? ""), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (data: VickFormData) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      await insertProducaoVick({
        data: data.data,
        codigo: data.codigo,
        qtde_caixas: data.qtde_caixas,
        percas: data.percas,
        setup: data.setup,
        pedido_estoque: data.pedido_estoque,
        peso_registro: pesoRegistro,
        observacao: data.observacao,
        criado_por: user.id,
      });

      toast.success("Registro salvo com sucesso");
      reset({
        data: todayDbString(),
        codigo: "",
        qtde_caixas: 0,
        percas: 0,
        setup: false,
        pedido_estoque: "Pedido",
        observacao: "",
      });
      setSelectedItem(null);
      setPesoRegistro(null);
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
    try {
      await softDeleteVick(id);
      toast.success("Registro excluído");
      await loadHistory();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir registro"
      );
      throw error;
    }
  };

  const formBody = (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className={modal ? "space-y-5" : "kosmos-form-panel space-y-5"}
    >
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

          <input type="hidden" {...register("codigo")} />

          <ItemCodigoPicker
            ambiente="vick"
            codigo={codigo || selectedItem?.codigo?.toString() || ""}
            onSelect={(item) => handleSelectItem(item as ItemVick)}
            error={errors.codigo?.message}
          >
            {selectedItem && (
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-mansure-gray-light bg-mansure-light p-4 text-sm sm:grid-cols-3">
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
                    P.P
                  </span>
                  <p className="font-medium text-mansure-black">
                    {selectedItem.pp ?? "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-mansure-dark">
                    Macho
                  </span>
                  <p className="font-medium text-mansure-black">
                    {selectedItem.macho ? "SIM" : "NÃO"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-mansure-dark">
                    Macho 1
                  </span>
                  <p className="font-medium text-mansure-black">
                    {selectedItem.macho_1 ?? "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-mansure-dark">
                    Macho 2
                  </span>
                  <p className="font-medium text-mansure-black">
                    {selectedItem.macho_2 ?? "—"}
                  </p>
                </div>
              </div>
            )}
          </ItemCodigoPicker>

          {codigo && (
            <PesoRegistroField
              label="Peso Peça"
              value={pesoRegistro}
              onChange={setPesoRegistro}
            />
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="kosmos-label">Qtde Caixas</Label>
              <DecimalInput
                min={0}
                {...register("qtde_caixas")}
              />
              {errors.qtde_caixas && (
                <p className="text-sm text-red-400">
                  {errors.qtde_caixas.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="kosmos-label">Percas</Label>
              <DecimalInput
                min={0}
                {...register("percas")}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Controller
              name="setup"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                />
              )}
            />
            <Label className="kosmos-label">Teve setup?</Label>
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
