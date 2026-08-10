"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import {
  getRecentMacharia,
  insertProducaoMacharia,
  softDeleteMacharia,
} from "@/lib/api-calls";
import {
  formatDateDisplay,
  formatTimeRange,
} from "@/lib/auth";
import { todayDbString } from "@/lib/date-utils";
import type { ItemMacharia, ProducaoMacharia } from "@/lib/types";
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

const MAQUINAS = ["LIXAR", "ESMERILAR", "FURAR", "SERRAR", "POLIR"] as const;
const FUNCOES = ["PREPARAÇÃO", "ACABAMENTO", "MONTAGEM", "INSPEÇÃO"] as const;
const TURNOS = ["MANHÃ", "TARDE", "NOITE"] as const;

const machariaSchema = z
  .object({
    data: z.string().min(1, "Data obrigatória"),
    colaborador: z.string().min(1, "Colaborador obrigatório"),
    maquina: z.string().min(1, "Máquina obrigatória"),
    funcao: z.string().min(1, "Função obrigatória"),
    turno: z.string().min(1, "Turno obrigatório"),
    codigo: z.string().min(1, "Código obrigatório"),
    hora_inicial: z.string().min(1, "Hora inicial obrigatória"),
    hora_final: z.string().min(1, "Hora final obrigatória"),
    qtde_feita: zDecimal(0),
    qtde_perdida: zDecimal(0),
    observacao: observacaoFieldSchema,
  })
  .refine((data) => data.hora_final > data.hora_inicial, {
    message: "Hora final deve ser maior que hora inicial",
    path: ["hora_final"],
  });

type MachariaFormData = z.infer<typeof machariaSchema>;

const historyColumns: HistoryColumn<ProducaoMacharia>[] = [
  {
    key: "data",
    header: "Data",
    render: (row) => formatDateDisplay(row.data),
  },
  {
    key: "colaborador",
    header: "Colaborador",
    render: (row) => row.colaborador,
  },
  { key: "maquina", header: "Máquina", render: (row) => row.maquina },
  {
    key: "qtde_feita",
    header: "Qtde Feita",
    render: (row) => row.qtde_feita,
  },
  {
    key: "horario",
    header: "Horário",
    render: (row) => formatTimeRange(row.hora_inicial, row.hora_final),
  },
  {
    key: "peso_registro",
    header: "Peso 1",
    render: (row) => row.peso_registro ?? "—",
  },
];

export function FormMacharia({
  modal = false,
  onSaved,
  formId = PRODUCAO_FORM_IDS.macharia,
  hideSubmit = false,
}: ProducaoFormProps = {}) {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<ItemMacharia | null>(null);
  const [pesoRegistro, setPesoRegistro] = useState<number | null>(null);
  const [pesoRegistro2, setPesoRegistro2] = useState<number | null>(null);
  const [history, setHistory] = useState<ProducaoMacharia[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof machariaSchema>, unknown, MachariaFormData>({
    resolver: zodResolver(machariaSchema),
    defaultValues: {
      data: todayDbString(),
      codigo: "",
      maquina: MAQUINAS[0],
      funcao: FUNCOES[0],
      turno: TURNOS[0],
      qtde_perdida: 0,
      observacao: "",
    },
  });

  const codigo = watch("codigo") ?? "";

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      setHistory(await getRecentMacharia(user.id));
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

  const handleSelectItem = (item: ItemMacharia) => {
    setSelectedItem(item);
    setPesoRegistro(parseOptionalNumber(item.peso_1));
    setPesoRegistro2(parseOptionalNumber(item.peso_2));
    setValue("codigo", String(item.codigo ?? ""), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (data: MachariaFormData) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      await insertProducaoMacharia({
        ...data,
        peso_registro: pesoRegistro,
        peso_registro_2: pesoRegistro2,
        criado_por: user.id,
      });
      toast.success("Registro salvo com sucesso");
      reset({
        data: todayDbString(),
        colaborador: "",
        maquina: MAQUINAS[0],
        funcao: FUNCOES[0],
        turno: TURNOS[0],
        codigo: "",
        hora_inicial: "",
        hora_final: "",
        qtde_feita: 0,
        qtde_perdida: 0,
        observacao: "",
      });
      setSelectedItem(null);
      setPesoRegistro(null);
      setPesoRegistro2(null);
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
    await softDeleteMacharia(id);
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
            </div>
            <div className="space-y-2">
              <Label className="kosmos-label">Colaborador</Label>
              <Input
                className="kosmos-input"
                {...register("colaborador")}
              />
              {errors.colaborador && (
                <p className="text-sm text-red-400">{errors.colaborador.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="kosmos-label">Máquina</Label>
              <Controller
                name="maquina"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="kosmos-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MAQUINAS.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="kosmos-label">Função</Label>
              <Controller
                name="funcao"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="kosmos-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FUNCOES.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className="kosmos-label">Turno</Label>
              <Controller
                name="turno"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="kosmos-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TURNOS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <input type="hidden" {...register("codigo")} />

          <ItemCodigoPicker
            ambiente="macharia"
            codigo={codigo || selectedItem?.codigo?.toString() || ""}
            onSelect={(item) => handleSelectItem(item as ItemMacharia)}
            error={errors.codigo?.message}
          >
            {selectedItem && (
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-mansure-gray-light bg-mansure-light p-4 text-sm sm:grid-cols-3">
                <div>
                  <span className="text-xs font-semibold uppercase text-mansure-dark">
                    Gasagem
                  </span>
                  <p className="font-medium text-mansure-black">
                    {selectedItem.gasagem ?? "—"}
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
                <div>
                  <span className="text-xs font-semibold uppercase text-mansure-dark">
                    Qtde Ferramenta
                  </span>
                  <p className="font-medium text-mansure-black">
                    {selectedItem.qtde_ferramenta ?? "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase text-mansure-dark">
                    Tempo Total
                  </span>
                  <p className="font-medium text-mansure-black">
                    {selectedItem.tempo_total ?? "—"}
                  </p>
                </div>
              </div>
            )}
          </ItemCodigoPicker>

          {codigo && (
            <div className="grid gap-3 sm:grid-cols-2">
              <PesoRegistroField
                label="Peso 1"
                value={pesoRegistro}
                onChange={setPesoRegistro}
              />
              <PesoRegistroField
                label="Peso 2"
                value={pesoRegistro2}
                onChange={setPesoRegistro2}
              />
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="kosmos-label">Hora Inicial</Label>
              <Input
                type="time"
                className="kosmos-input"
                {...register("hora_inicial")}
              />
            </div>
            <div className="space-y-2">
              <Label className="kosmos-label">Hora Final</Label>
              <Input
                type="time"
                className="kosmos-input"
                {...register("hora_final")}
              />
              {errors.hora_final && (
                <p className="text-sm text-red-400">{errors.hora_final.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="kosmos-label">Qtde Feita</Label>
              <DecimalInput {...register("qtde_feita")} />
              {errors.qtde_feita && (
                <p className="text-sm text-red-400">{errors.qtde_feita.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="kosmos-label">Qtde Perdida</Label>
              <DecimalInput {...register("qtde_perdida")} />
            </div>
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
