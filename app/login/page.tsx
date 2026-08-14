"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function RadarGraphic() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="size-[280px] sm:size-[340px] lg:size-[380px]"
      aria-hidden
    >
      {[60, 100, 140, 180, 220, 260].map((r) => (
        <circle
          key={r}
          cx="200"
          cy="200"
          r={r}
          fill="none"
          stroke="rgba(30, 90, 168, 0.22)"
          strokeWidth="1"
        />
      ))}
      {[
        [200, 100],
        [270, 155],
        [130, 185],
        [240, 230],
        [160, 260],
        [290, 210],
        [200, 300],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="3.5"
          fill="rgba(30, 90, 168, 0.45)"
        />
      ))}
      <circle cx="200" cy="200" r="5" fill="rgba(30, 90, 168, 0.6)" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao fazer login"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Marca — fundo escuro, texto à direita do painel */}
      <section className="relative flex flex-1 flex-col justify-center overflow-hidden bg-mansure-black px-8 py-14 sm:px-12 lg:min-h-screen lg:py-0 lg:pl-12 lg:pr-8 xl:pl-16 xl:pr-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
        >
          <div className="absolute top-1/3 left-1/2 size-72 -translate-x-1/2 rounded-full bg-mansure-blue/15 blur-[100px]" />
        </div>

        <div className="relative z-10 flex w-full justify-center lg:justify-end">
          <div className="w-full max-w-md text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-mansure-gray-medium">
              MANSURE
            </p>

            <div className="relative mt-5 lg:mt-6">
              <div
                className="pointer-events-none absolute top-1/2 left-0 -z-10 -translate-y-1/2 opacity-80"
                aria-hidden
              >
                <RadarGraphic />
              </div>

              <h1 className="relative text-4xl font-black leading-none tracking-tight text-mansure-light sm:text-5xl lg:text-6xl">
                KOSMOS
              </h1>
            </div>

            <p className="mt-3 text-sm font-bold uppercase tracking-[0.22em] text-mansure-blue sm:text-base">
              Controle de Produção
            </p>

            <p className="mt-8 text-lg font-semibold leading-snug text-mansure-light sm:text-xl">
              Inteligência operacional com clareza.
            </p>

            <p className="mt-3 max-w-sm text-sm leading-relaxed text-mansure-gray-medium sm:text-base">
              Mapeamento de peças, registro de produção e rastreabilidade em um
              só lugar.
            </p>
          </div>
        </div>
      </section>

      {/* Login — tom ~12% mais claro que o painel esquerdo */}
      <section className="flex flex-1 items-center justify-center bg-[#121820] px-6 py-14 sm:px-8 lg:min-h-screen lg:justify-start lg:pl-14 lg:pr-10 xl:pl-20 xl:pr-12">
        <div className="w-full max-w-[360px] text-left">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-mansure-light">Entrar</h2>
            <p className="mt-2 text-sm text-mansure-gray-medium">
              Acesse o painel operacional da Kosmos Controle de Produção.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mansure-gray-medium"
              >
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className="h-12 rounded-lg border-white/10 bg-[#141b26] text-left text-mansure-light placeholder:text-mansure-gray-medium focus-visible:border-mansure-blue focus-visible:ring-mansure-blue/20"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mansure-gray-medium"
              >
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-12 rounded-lg border-white/10 bg-[#141b26] pr-12 text-left text-mansure-light placeholder:text-mansure-gray-medium focus-visible:border-mansure-blue focus-visible:ring-mansure-blue/20"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-mansure-gray-medium transition hover:text-mansure-light"
                  aria-label={
                    showPassword ? "Ocultar senha" : "Mostrar senha"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-5" strokeWidth={2} />
                  ) : (
                    <Eye className="size-5" strokeWidth={2} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="mansurePrimary"
              className="group h-12 w-full rounded-lg text-base font-semibold"
            >
              {isSubmitting ? (
                "Entrando..."
              ) : (
                <>
                  Entrar
                  <ArrowRight className="size-5 transition group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-10 text-left text-xs text-mansure-gray-medium">
            Acesso restrito à equipe interna
          </p>
        </div>
      </section>
    </div>
  );
}
