"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  registroProducaoVickSchema,
  type RegistroProducaoVickFormData,
} from "@/lib/validators/registroProducaoSchema";
import { cn } from "@/lib/utils";
import type { z } from "zod";
import { ObservacaoField } from "@/components/ObservacaoField";
import {
  PesoRegistroField,
  parseOptionalNumber,
} from "@/components/PesoRegistroField";

const historyColumns: HistoryColumn<ProducaoVick>[] = [
  {
    key: "data",
    header: "Data",
    render: (row) => formatDateDisplay(row.data),
  },
  {
    key: "codigo",
    header: "Código",
    render: (row) =>
      row.eh_meia_placa && row.codigo_2
        ? `${row.codigo} + ${row.codigo_2}`
        : row.codigo,
  },
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
  onFormStateChange,
}: ProducaoFormProps = {}) {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<ItemVick | null>(null);
  const [selectedItemPar, setSelectedItemPar] = useState<ItemVick | null>(null);
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
    formState: { errors, isSubmitting, isValid },
  } = useForm<
    z.input<typeof registroProducaoVickSchema>,
    unknown,
    RegistroProducaoVickFormData
  >({
    resolver: zodResolver(registroProducaoVickSchema),
    mode: "onChange",
    defaultValues: {
      data: todayDbString(),
      codigo: "",
      codigo_2: null,
      percas: 0,
      setup: false,
      eh_manual: false,
      eh_meia_placa: false,
      pedido_estoque: "Pedido",
      observacao: "",
    },
  });

  const codigo = watch("codigo") ?? "";
  const codigoPar = watch("codigo_2") ?? "";
  const ehMeiaPlaca = watch("eh_meia_placa");

  useEffect(() => {
    onFormStateChange?.({ isValid, isSubmitting });
  }, [isValid, isSubmitting, onFormStateChange]);

  useEffect(() => {
    if (!ehMeiaPlaca) {
      setValue("codigo_2", null, { shouldValidate: true });
      setSelectedItemPar(null);
    }
  }, [ehMeiaPlaca, setValue]);

  // Se Código A mudar para o mesmo do Par, limpa o Par
  useEffect(() => {
    if (
      codigo.trim() &&
      codigoPar.trim() &&
      codigo.trim() === codigoPar.trim()
    ) {
      setValue("codigo_2", null, { shouldValidate: true });
      setSelectedItemPar(null);
    }
  }, [codigo, codigoPar, setValue]);

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

  const onSubmit = async (data: RegistroProducaoVickFormData) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      await insertProducaoVick({
        data: data.data,
        codigo: data.codigo.trim(),
        codigo_2: data.eh_meia_placa ? data.codigo_2?.trim() ?? null : null,
        eh_meia_placa: data.eh_meia_placa,
        eh_manual: data.eh_manual,
        tipo_placa: data.eh_meia_placa ? "meia_placa" : null,
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
        codigo_2: null,
        qtde_caixas: 0,
        percas: 0,
        setup: false,
        eh_manual: false,
        eh_meia_placa: false,
        pedido_estoque: "Pedido",
        observacao: "",
      });
      setSelectedItem(null);
      setSelectedItemPar(null);
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

  const renderItemDetails = (item: ItemVick) => (
    <div className="grid grid-cols-2 gap-3 rounded-lg border border-mansure-gray-light bg-mansure-light p-4 text-sm sm:grid-cols-3">
      <div>
        <span className="text-xs font-semibold uppercase text-mansure-dark">
          Árvore
        </span>
        <p className="font-medium text-mansure-black">{item.arvore ?? "—"}</p>
      </div>
      <div>
        <span className="text-xs font-semibold uppercase text-mansure-dark">
          P.P
        </span>
        <p className="font-medium text-mansure-black">{item.pp ?? "—"}</p>
      </div>
      <div>
        <span className="text-xs font-semibold uppercase text-mansure-dark">
          Macho
        </span>
        <p className="font-medium text-mansure-black">
          {item.macho ? "SIM" : "NÃO"}
        </p>
      </div>
      <div>
        <span className="text-xs font-semibold uppercase text-mansure-dark">
          Macho 1
        </span>
        <p className="font-medium text-mansure-black">{item.macho_1 ?? "—"}</p>
      </div>
      <div>
        <span className="text-xs font-semibold uppercase text-mansure-dark">
          Macho 2
        </span>
        <p className="font-medium text-mansure-black">{item.macho_2 ?? "—"}</p>
      </div>
    </div>
  );

  const formBody = (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        modal ? "space-y-5" : "kosmos-form-panel space-y-5"
      )}
    >
      <div
        className={cn(
          modal && "grid gap-5 md:grid-cols-2 md:items-start"
        )}
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

        {modal && (
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
        )}
      </div>

      <input type="hidden" {...register("codigo")} />

      <ItemCodigoPicker
        ambiente="vick"
        label="Código"
        codigo={codigo || selectedItem?.codigo?.toString() || ""}
        onSelect={(item) => handleSelectItem(item as ItemVick)}
        error={errors.codigo?.message}
      >
        {selectedItem && renderItemDetails(selectedItem)}
      </ItemCodigoPicker>

      <div
        className={cn(
          "space-y-3 rounded-lg border border-mansure-gray-light bg-mansure-light/80 p-4",
          modal && "md:flex md:flex-wrap md:items-center md:gap-x-8 md:gap-y-3 md:space-y-0"
        )}
      >
        <div className="flex items-center gap-2">
          <Controller
            name="eh_manual"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="eh_manual"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          <Label htmlFor="eh_manual" className="kosmos-label cursor-pointer">
            Manual (Vick Manual)
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Controller
            name="eh_meia_placa"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="eh_meia_placa"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          <Label htmlFor="eh_meia_placa" className="kosmos-label cursor-pointer">
            Meia Placa
          </Label>
        </div>

        {ehMeiaPlaca && (
          <p
            className={cn(
              "text-xs italic text-mansure-gray-medium",
              modal && "md:basis-full"
            )}
          >
            A quantidade de caixas vale para o conjunto (Código + Código Par).
          </p>
        )}
      </div>

      {ehMeiaPlaca && (
        <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <Controller
            name="codigo_2"
            control={control}
            render={({ field }) => (
              <ItemCodigoPicker
                ambiente="vick"
                label="Código Par *"
                codigo={field.value ?? ""}
                excludeCodigo={codigo.trim() || undefined}
                onSelect={(item) => {
                  field.onChange(String(item.codigo ?? ""));
                  setSelectedItemPar(item as ItemVick);
                }}
                error={errors.codigo_2?.message}
              >
                {selectedItemPar && renderItemDetails(selectedItemPar)}
              </ItemCodigoPicker>
            )}
          />
        </div>
      )}

      <div
        className={cn(
          "grid gap-5 sm:grid-cols-2",
          modal && "md:grid-cols-3"
        )}
      >
        <div className="space-y-2">
          <Label className="kosmos-label">Quantidade de Caixas *</Label>
          <DecimalInput min={1} {...register("qtde_caixas")} />
          {errors.qtde_caixas && (
            <p className="text-sm text-red-400">
              {errors.qtde_caixas.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="kosmos-label">Peças (perdas)</Label>
          <DecimalInput min={0} {...register("percas")} />
        </div>

        {modal && codigo && (
          <PesoRegistroField
            label="Peso Peça"
            value={pesoRegistro}
            onChange={setPesoRegistro}
          />
        )}
      </div>

      {!modal && codigo && (
        <PesoRegistroField
          label="Peso Peça"
          value={pesoRegistro}
          onChange={setPesoRegistro}
        />
      )}

      <div
        className={cn(
          modal && "grid gap-5 md:grid-cols-2 md:items-center"
        )}
      >
        <div className="flex items-center gap-2">
          <Controller
            name="setup"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="setup"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          <Label htmlFor="setup" className="kosmos-label">
            Setup realizado
          </Label>
        </div>

        {!modal && (
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
        )}
      </div>

      <ObservacaoField
        {...register("observacao")}
        error={errors.observacao?.message}
      />

      {!hideSubmit && (
        <Button
          type="submit"
          disabled={isSubmitting || !isValid}
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
