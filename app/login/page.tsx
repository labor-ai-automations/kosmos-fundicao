"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-mansure-black via-mansure-black to-mansure-blue/30">
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 1200 800" className="h-full w-full" aria-hidden>
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="1200" height="800" fill="url(#grid)" />
        </svg>
      </div>

      <div className="absolute top-20 right-20 size-96 rounded-full bg-mansure-blue opacity-10 blur-3xl" />
      <div className="absolute bottom-0 left-0 size-96 rounded-full bg-mansure-blue opacity-5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 px-8 py-12 shadow-2xl backdrop-blur-lg">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black tracking-tight text-white">
              KOSMOS
            </h1>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.25em] text-mansure-light">
              Fundição
            </p>
            <p className="mt-4 text-xs font-light text-gray-300">
              Inteligência que transforma dados em decisões
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="h-11 rounded-lg border-white/20 bg-white/10 text-white placeholder:text-gray-400 focus:border-mansure-blue focus:bg-white/15"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-white"
              >
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 rounded-lg border-white/20 bg-white/10 pr-10 text-white placeholder:text-gray-400 focus:border-mansure-blue focus:bg-white/15"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition hover:text-white"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" strokeWidth={2} />
                  ) : (
                    <Eye className="size-5" strokeWidth={2} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-mansure-blue font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-mansure-blue/90 active:scale-[0.98]"
            >
              <LogIn className="size-4" strokeWidth={2} />
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-gray-400">
              Versão 1.0 — Sistema de Controle de Produção
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
