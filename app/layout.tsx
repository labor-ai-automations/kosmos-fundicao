import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "KOSMOS Controle de Produção",
  description: "Inteligência que transforma dados em decisões",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col font-sans"
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <Toaster theme="light" position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
