"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import {
  getRecentRefugo,
  insertRefugo,
  softDeleteRefugo,
} from "@/lib/api-calls";
import { formatDateDisplay } from "@/lib/auth";
import { todayDbString } from "@/lib/date-utils";
import { REFUGO_MOTIVOS } from "@/lib/refugo-motivos";
import { getRefugoPesoPrincipal } from "@/lib/refugo-selector-config";
import type { Refugo } from "@/lib/types";
import { DatePicker } from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefugoCodigoPicker } from "@/components/RefugoCodigoPicker";
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

const FUNDICOES = [
  "AREIA VERDE",
  "AREIA QUÍMICA",
  "POLIESTIRENO",
  "COLDBOX",
] as const;

const refugoSchema = z.object({
  data: z.string().min(1, "Data obrigatória"),
  codigo: z.string().min(1, "Código obrigatório"),
  fundicao: z.string().min(1, "Fundição obrigatória"),
  qtde_perdida: zDecimal(0),
  motivo: z.string().min(1, "Motivo obrigatório"),
  observacao: observacaoFieldSchema,
});

type RefugoFormData = z.infer<typeof refugoSchema>;

const historyColumns: HistoryColumn<Refugo>[] = [
  {
    key: "data",
    header: "Data",
    render: (row) => formatDateDisplay(row.data),
  },
  { key: "codigo", header: "Código", render: (row) => row.codigo },
  {
    key: "fundicao",
    header: "Fundição",
    render: (row) => row.fundicao,
  },
  {
    key: "qtde_perdida",
    header: "Qtde",
    render: (row) => row.qtde_perdida,
  },
  { key: "motivo", header: "Motivo", render: (row) => row.motivo },
  {
    key: "peso_registro",
    header: "Peso",
    render: (row) => row.peso_registro ?? "—",
  },
];

export function FormRefugo({
  modal = false,
  onSaved,
  formId = PRODUCAO_FORM_IDS.refugo,
  hideSubmit = false,
}: ProducaoFormProps = {}) {
  const { user } = useAuth();
  const [pesoRegistro, setPesoRegistro] = useState<number | null>(null);
  const [history, setHistory] = useState<Refugo[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof refugoSchema>, unknown, RefugoFormData>({
    resolver: zodResolver(refugoSchema),
    defaultValues: {
      data: todayDbString(),
      fundicao: FUNDICOES[0],
      motivo: REFUGO_MOTIVOS[0],
      observacao: "",
    },
  });

  const codigo = watch("codigo");

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      setHistory(await getRecentRefugo(user.id));
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

  const onSubmit = async (data: RefugoFormData) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }

    try {
      await insertRefugo({
        ...data,
        peso_registro: pesoRegistro,
        criado_por: user.id,
      });
      toast.success("Registro salvo com sucesso");
      reset({
        data: todayDbString(),
        codigo: "",
        fundicao: FUNDICOES[0],
        qtde_perdida: 0,
        motivo: REFUGO_MOTIVOS[0],
        observacao: "",
      });
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
    await softDeleteRefugo(id);
    toast.success("Registro excluído");
    await loadHistory();
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

          <Controller
            name="codigo"
            control={control}
            render={({ field }) => (
              <RefugoCodigoPicker
                codigo={field.value ?? ""}
                onSelect={(item) => {
                  field.onChange(item.codigo);
                  setPesoRegistro(parseOptionalNumber(getRefugoPesoPrincipal(item)));
                  field.onBlur();
                }}
                error={errors.codigo?.message}
              />
            )}
          />

          {codigo && (
            <PesoRegistroField
              label="Peso Peça"
              value={pesoRegistro}
              onChange={setPesoRegistro}
            />
          )}

          <div className="space-y-2">
            <Label className="kosmos-label">Fundição</Label>
            <Controller
              name="fundicao"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="kosmos-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUNDICOES.map((f) => (
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
            <Label className="kosmos-label">Qtde Perdida</Label>
            <DecimalInput {...register("qtde_perdida")} />
            {errors.qtde_perdida && (
              <p className="text-sm text-red-400">{errors.qtde_perdida.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="kosmos-label">Motivo</Label>
            <Controller
              name="motivo"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="kosmos-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REFUGO_MOTIVOS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
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
