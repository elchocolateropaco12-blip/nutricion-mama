import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import RegistrarSW from "@/components/RegistrarSW";
import "./globals.css";

/**
 * Atkinson Hyperlegible, diseñada por el Braille Institute para diferenciar
 * caracteres que se confunden en baja visión. Se usa para TODO el texto,
 * incluidos los números. Meter una segunda familia decorativa aquí trabajaría
 * en contra del único requisito que no se negocia en esta app: que se lea.
 */
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "La comida de mamá",
  description: "Registro diario de comidas, adaptado a su tratamiento.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "La comida de mamá",
  },
};

export const viewport: Viewport = {
  themeColor: "#2E6A57",
  width: "device-width",
  initialScale: 1,
  // Sin maximumScale: bloquear el zoom en una app de accesibilidad
  // es exactamente lo contrario de lo que queremos.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={atkinson.variable}>
      <body className="min-h-dvh bg-papel text-tinta antialiased">
        {children}
        <RegistrarSW />
      </body>
    </html>
  );
}
