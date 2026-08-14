import { z } from "zod";
import { zDecimal } from "@/lib/number-utils";
import { observacaoFieldSchema } from "@/lib/producao-observacao";

export const registroProducaoVickSchema = z
  .object({
    data: z.string().min(1, "Data obrigatória"),
    codigo: z.string().min(1, "Código A é obrigatório").trim(),
    codigo_2: z.string().nullable().optional(),
    qtde_caixas: zDecimal(1),
    percas: zDecimal(0),
    setup: z.boolean(),
    eh_manual: z.boolean().default(false),
    eh_meia_placa: z.boolean().default(false),
    pedido_estoque: z.enum(["Pedido", "Estoque"]),
    observacao: observacaoFieldSchema,
  })
  .refine(
    (data) => {
      if (data.eh_meia_placa && !data.codigo_2?.trim()) {
        return false;
      }
      return true;
    },
    {
      message: "Código Par é obrigatório quando Meia Placa está marcada",
      path: ["codigo_2"],
    }
  )
  .refine(
    (data) => {
      if (
        data.eh_meia_placa &&
        data.codigo_2?.trim() &&
        data.codigo.trim() === data.codigo_2.trim()
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Código Par deve ser diferente do Código A",
      path: ["codigo_2"],
    }
  );

export type RegistroProducaoVickFormData = z.infer<
  typeof registroProducaoVickSchema
>;

/** Alias para compatibilidade com o prompt original */
export const registroProducaoSchema = registroProducaoVickSchema;
export type RegistroProducaoFormData = RegistroProducaoVickFormData;
