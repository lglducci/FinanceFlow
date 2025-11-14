import "./globals.css";

export const metadata = {
  title: "FinanceFlow",
  description: "Gerencie suas finanças de forma simples e moderna",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className="min-h-screen bg-[#f9fafb] text-gray-900 antialiased">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
