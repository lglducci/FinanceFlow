 import './globals.css';

export const metadata = {
  title: "FinanceFlow",
  description: "Controle financeiro simples e moderno."
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
