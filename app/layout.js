import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import "./globals.css";

export const metadata = {
  title: "ConfiaTour - Turismo Regional Colaborativo",
  description:
    "Plataforma colaborativa para experiencias turísticas auténticas en el corredor bioceánico",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      localization={esES}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#10B981", // Ajusta este color según tu diseño
          colorPrimaryText: "#FFFFFF",
          colorBackground: "#FFFFFF",
          colorInputBackground: "#F9FAFB",
          colorInputText: "#1F2937",
          colorText: "#1F2937",
          colorTextSecondary: "#6B7280",
          colorSuccess: "#10B981",
          colorDanger: "#EF4444",
          colorWarning: "#F59E0B",
          borderRadius: "8px",
          fontFamily: "Inter, system-ui, sans-serif",
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: "#10B981",
            borderColor: "#10B981",
            color: "#FFFFFF",
            "&:hover, &:focus": {
              backgroundColor: "#059669",
              borderColor: "#059669",
            },
          },
          formButtonSecondary: {
            borderColor: "#D1D5DB",
            color: "#374151",
            "&:hover, &:focus": {
              backgroundColor: "#F9FAFB",
            },
          },
          card: {
            borderRadius: "12px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            border: "1px solid #E5E7EB",
          },
          headerTitle: {
            color: "#1F2937",
            fontWeight: "700",
            fontSize: "24px",
          },
          headerSubtitle: {
            color: "#6B7280",
            fontSize: "16px",
          },
          socialButtonsBlockButton: {
            borderColor: "#D1D5DB",
            color: "#374151",
            "&:hover": {
              backgroundColor: "#F9FAFB",
            },
          },
          formFieldInput: {
            borderColor: "#D1D5DB",
            "&:focus": {
              borderColor: "#10B981",
              boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
            },
          },
          footerActionLink: {
            color: "#10B981",
            "&:hover": {
              color: "#059669",
            },
          },
        },
      }}
    >
      <html lang="es">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
