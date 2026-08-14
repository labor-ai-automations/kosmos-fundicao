"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Database,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Mapeamento de Peças",
    href: "/dashboard/mapeamento",
    icon: Camera,
  },
  {
    label: "Registro de Produção",
    href: "/dashboard/producao",
    icon: ClipboardList,
  },
  {
    label: "Cadastro de Itens",
    href: "/dashboard/itens",
    icon: Database,
  },
];

function getInitials(nome: string) {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return nome.slice(0, 2).toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { collapsed, toggle } = useSidebar();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao sair"
      );
    }
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-mansure-gray-light/10 bg-mansure-black transition-all duration-300 md:flex",
        collapsed ? "w-[4.5rem]" : "w-72"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-mansure-gray-light/10",
          collapsed ? "justify-center px-2 py-5" : "justify-between px-5 py-6"
        )}
      >
        <Link
          href="/dashboard"
          className={cn("group block min-w-0", collapsed && "text-center")}
        >
          {collapsed ? (
            <span className="text-2xl font-black text-mansure-blue">K</span>
          ) : (
            <div className="space-y-1">
              <span className="block text-3xl font-black leading-none tracking-tight text-mansure-light">
                KOSMOS
              </span>
              <span className="block text-sm font-semibold uppercase tracking-[0.28em] text-mansure-blue">
                Controle de Produção
              </span>
              <span className="mt-2 block h-0.5 w-10 rounded-full bg-gradient-to-r from-mansure-blue to-mansure-blue/20 transition-all group-hover:w-14" />
            </div>
          )}
        </Link>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="shrink-0 text-mansure-gray-medium hover:bg-mansure-gray-dark/30 hover:text-mansure-light"
            title="Recolher menu"
          >
            <ChevronLeft className="size-5" />
          </Button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center border-b border-mansure-gray-light/10 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="text-mansure-gray-medium hover:bg-mansure-gray-dark/30 hover:text-mansure-light"
            title="Expandir menu"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      )}

      {!collapsed && (
        <p className="px-5 pt-5 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-mansure-gray-medium">
          Navegação principal
        </p>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {navItems.map(({ label, href, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center rounded-xl text-sm font-semibold transition-all duration-200",
                collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3.5",
                active
                  ? "bg-mansure-blue/20 text-mansure-light shadow-[inset_3px_0_0_0] shadow-mansure-blue"
                  : "text-mansure-gray-medium hover:bg-mansure-gray-dark/40 hover:text-mansure-light"
              )}
            >
              <Icon className="size-5 shrink-0" strokeWidth={2} />
              {!collapsed && <span className="truncate leading-snug">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-mansure-gray-light/10 p-4">
        {user && (
          <div
            className={cn(
              "mb-4 flex items-center gap-3",
              collapsed && "justify-center"
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mansure-blue text-sm font-bold text-mansure-light ring-2 ring-mansure-blue/30">
              {getInitials(user.nome)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-mansure-light">
                  {user.nome}
                </p>
                <p className="truncate text-sm text-mansure-gray-medium">
                  {user.email || "Usuário"}
                </p>
              </div>
            )}
          </div>
        )}
        <Button
          variant="outline"
          size={collapsed ? "icon" : "default"}
          onClick={handleLogout}
          title={collapsed ? "Sair" : undefined}
          className={cn(
            "border-mansure-gray-light/20 bg-mansure-gray-dark/20 text-sm font-medium text-mansure-light hover:border-mansure-error/50 hover:bg-mansure-error/10 hover:text-mansure-error",
            collapsed ? "mx-auto flex size-10" : "h-11 w-full"
          )}
        >
          <LogOut className="size-[18px]" strokeWidth={2} />
          {!collapsed && "Sair"}
        </Button>
      </div>
    </aside>
  );
}
