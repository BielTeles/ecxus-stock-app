import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProductProvider } from "@/contexts/ProductContextV3";
import { ProductionProvider } from "@/contexts/ProductionContext";
import { ProductionOrderProvider } from "@/contexts/ProductionOrderContext";
import { SupplierProvider } from "@/contexts/SupplierContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AlertProvider } from "@/contexts/AlertContext";
import MigrationStatus from '@/components/MigrationStatus';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ecxus Stock - Gerenciamento de Componentes Eletrônicos",
  description: "Sistema de gerenciamento de estoque para componentes eletrônicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SettingsProvider>
          <ProductProvider>
            <SupplierProvider>
              <ProductionProvider>
                <ProductionOrderProvider>
                  <AlertProvider>
                    {children}
                  </AlertProvider>
                </ProductionOrderProvider>
              </ProductionProvider>
            </SupplierProvider>
          </ProductProvider>
        </SettingsProvider>
        <MigrationStatus />
      </body>
    </html>
  );
}
