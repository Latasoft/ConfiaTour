import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "../components/Navbar";
import "./globals.css";

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
        </body>
      </html>
    </ClerkProvider>
  );
}
