import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "../components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/lib/context/ToastContext";
import "./globals.css";

export const metadata = {
  title: "ConfiaTour - Turismo en el Corredor Bioceánico",
  description: "Plataforma de turismo regional colaborativo para el corredor Bioceánico",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body suppressHydrationWarning={true}>
          <ToastProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
            <WhatsAppButton />
            <Footer />
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
