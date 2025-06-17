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
                    <div className="min-h-screen flex flex-col">
                      <div className="flex-1">
                        {children}
                      </div>
                      
                      {/* Footer */}
                      <footer className="bg-white border-t border-gray-200 py-4 px-4">
                        <div className="max-w-7xl mx-auto">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">
                              Desenvolvido por{' '}
                              <span className="font-medium text-gray-700">Gabriel Teles</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Ecxus Stock © {new Date().getFullYear()}
                            </p>
                          </div>
                        </div>
                      </footer>
                    </div>
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
