import "./globals.css";

export const metadata = {
  title: "FinanceFlow",
  description: "Gerencie suas finanças de forma simples e moderna",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
