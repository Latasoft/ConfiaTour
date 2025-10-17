import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "../components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";
import Footer from "@/components/Footer";
export const metadata = {
  title: "Confia Tour",
  description: "Tu aplicación de turismo de confianza",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body suppressHydrationWarning={true}>
          <Navbar />
          <main className="pt-16">{children}</main>
          <WhatsAppButton />
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
