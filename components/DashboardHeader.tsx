"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/mapeamento": "Mapeamento de Peças",
  "/dashboard/itens": "Cadastro de Itens",
  "/dashboard/producao": "Registro de Produção",
  "/dashboard/records": "Registros",
};

function getPageTitle(pathname: string) {
  if (routeTitles[pathname]) return routeTitles[pathname];

  if (pathname.startsWith("/dashboard/mapeamento-detalhes/")) {
    return "Mapeamento de Peça";
  }

  if (pathname.startsWith("/dashboard/mapeamento/")) {
    return "Mapeamento de Peça";
  }

  if (pathname.startsWith("/dashboard/mapeamento-visual")) {
    return "Mapeamento de Peças";
  }

  if (pathname.startsWith("/dashboard/itens/")) {
    const ambiente = pathname.split("/").pop()?.toUpperCase();
    return ambiente ? `Itens ${ambiente}` : "Cadastro de Itens";
  }

  if (pathname.startsWith("/dashboard/producao/")) {
    const parts = pathname.split("/");
    const ambiente = parts[3];
    if (ambiente) {
      return ambiente.toUpperCase();
    }
    return "Registro de Produção";
  }

  for (const [path, title] of Object.entries(routeTitles)) {
    if (pathname.startsWith(path) && path !== "/dashboard") return title;
  }

  return "KOSMOS Fundição";
}

function getBreadcrumb(pathname: string) {
  if (pathname === "/dashboard") return "Início";
  if (pathname.startsWith("/dashboard/producao/")) {
    return "Produção / Histórico";
  }
  if (pathname.startsWith("/dashboard/producao")) {
    return "Produção / Seleção";
  }
  if (pathname.startsWith("/dashboard/itens/")) {
    return "Itens / Ambiente";
  }
  if (pathname.startsWith("/dashboard/itens")) {
    return "Itens / Seleção";
  }
  if (pathname.startsWith("/dashboard/mapeamento-detalhes/")) {
    return "Mapeamento / Seção";
  }
  if (pathname.startsWith("/dashboard/mapeamento")) {
    return "Mapeamento / Seleção";
  }
  if (pathname.startsWith("/dashboard/records")) {
    return "Registros / Consulta";
  }
  return "Fundição";
}

const mobileNav = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Mapeamento", href: "/dashboard/mapeamento" },
  { label: "Produção", href: "/dashboard/producao" },
  { label: "Itens", href: "/dashboard/itens" },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-mansure-gray-light/10 bg-mansure-black/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-mansure-light md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <Menu className="size-5" />
            </Button>
            <div>
              <p className="kosmos-page-breadcrumb">{getBreadcrumb(pathname)}</p>
              <h1 className="text-lg font-bold text-mansure-light">
                {getPageTitle(pathname)}
              </h1>
            </div>
          </div>
          {user && (
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex size-9 items-center justify-center rounded-full bg-mansure-blue text-sm font-bold text-mansure-light">
                {user.nome.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-mansure-gray-medium">
                {user.email || user.nome}
              </span>
            </div>
          )}
        </div>

        {mobileOpen && (
          <nav className="border-t border-mansure-gray-light/10 bg-mansure-black px-4 py-3 md:hidden">
            <div className="flex flex-wrap gap-2">
              {mobileNav.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    pathname === href || pathname.startsWith(`${href}/`)
                      ? "bg-mansure-blue text-mansure-light"
                      : "bg-mansure-gray-dark/30 text-mansure-gray-medium"
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
