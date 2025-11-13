import './globals.css';
import { getThemeByEmpresa } from '@/lib/theme';

export default async function RootLayout({ children }) {

  // Pegaremos o tema depois do login (via cookie)
  const id_empresa = 1; 

  const theme = await getThemeByEmpresa(id_empresa);

  const cssVars = {
    '--cor-primaria': theme.primaria,
    '--cor-primaria-light': theme.primariaLight,
    '--cor-bg': theme.bg,
    '--cor-card': theme.card,
    '--cor-texto': theme.texto,
    '--cor-subtexto': theme.subtexto,
  };

  return (
    <html lang="pt-BR">
      <body style={cssVars}>
        {children}
      </body>
    </html>
  );
}
