 import { useTranslation } from "react-i18next";

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.resolvedLanguage || i18n.language || "pt-BR"}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="rounded-lg border border-blue-700 px-3 py-2 text-sm font-bold text-white  bg-[#061f4a]"
    >
      <option value="pt-BR">🇧🇷 Português</option>
      <option value="en-US">🇺🇸 English</option>
      <option value="es-ES">🇪🇸 Español</option>
    </select>
  );
}