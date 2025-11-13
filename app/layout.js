 import "./globals.css";

export const metadata = {
  title: "FinanceFlow",
  description: "Gerenciamento financeiro inteligente",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
