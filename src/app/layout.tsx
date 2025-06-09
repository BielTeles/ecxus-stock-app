import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProductProvider } from "@/contexts/ProductContext";
import { ProductionProvider } from "@/contexts/ProductionContext";
import { ProductionOrderProvider } from "@/contexts/ProductionOrderContext";
import { SupplierProvider } from "@/contexts/SupplierContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import DevInitializer from '@/components/DevInitializer';
import DebugProducts from '@/components/DebugProducts';

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
                  {children}
                  <DebugProducts />
                </ProductionOrderProvider>
              </ProductionProvider>
            </SupplierProvider>
          </ProductProvider>
        </SettingsProvider>
        <DevInitializer />
      </body>
    </html>
  );
}
