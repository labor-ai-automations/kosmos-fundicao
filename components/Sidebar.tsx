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
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-mansure-gray-light/10",
          collapsed ? "justify-center px-2 py-4" : "justify-between px-4 py-5"
        )}
      >
        <Link
          href="/dashboard"
          className={cn("block min-w-0", collapsed && "text-center")}
        >
          {collapsed ? (
            <span className="text-lg font-black text-mansure-blue">K</span>
          ) : (
            <>
              <span className="text-xl font-black tracking-tight text-mansure-light">
                KOSMOS
              </span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-mansure-blue">
                Fundição
              </span>
            </>
          )}
        </Link>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggle}
            className="shrink-0 text-mansure-gray-medium hover:bg-mansure-gray-dark/30 hover:text-mansure-light"
            title="Recolher menu"
          >
            <ChevronLeft className="size-4" />
          </Button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center border-b border-mansure-gray-light/10 py-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggle}
            className="text-mansure-gray-medium hover:bg-mansure-gray-dark/30 hover:text-mansure-light"
            title="Expandir menu"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      {!collapsed && (
        <p className="px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-mansure-gray-medium">
          Navegação principal
        </p>
      )}

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-1 py-2">
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
                "mx-1 flex items-center rounded-lg py-2.5 text-xs font-medium transition-all duration-200",
                collapsed ? "justify-center px-2" : "gap-2.5 px-3",
                active
                  ? "border-l-4 border-mansure-blue bg-mansure-blue/20 text-mansure-light"
                  : "border-l-4 border-transparent text-mansure-gray-medium hover:bg-mansure-gray-dark/30 hover:text-mansure-light"
              )}
            >
              <Icon className="size-[18px] shrink-0" strokeWidth={2} />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-mansure-gray-light/10 p-3">
        {user && (
          <div
            className={cn(
              "mb-3 flex items-center gap-2.5",
              collapsed && "justify-center"
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mansure-blue text-xs font-bold text-mansure-light">
              {getInitials(user.nome)}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-mansure-light">
                  {user.nome}
                </p>
                <p className="truncate text-xs text-mansure-gray-medium">
                  {user.email || "Usuário"}
                </p>
              </div>
            )}
          </div>
        )}
        <Button
          variant="outline"
          size={collapsed ? "icon-sm" : "sm"}
          onClick={handleLogout}
          title={collapsed ? "Sair" : undefined}
          className={cn(
            "border-mansure-gray-light/20 bg-mansure-gray-dark/20 text-mansure-light hover:border-mansure-error/50 hover:bg-mansure-error/10 hover:text-mansure-error",
            collapsed ? "mx-auto flex" : "w-full"
          )}
        >
          <LogOut className="size-4" strokeWidth={2} />
          {!collapsed && "Sair"}
        </Button>
      </div>
    </aside>
  );
}
