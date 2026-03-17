import { useState } from "react";

export default function AutocompleteInput({
  value,
  onChange,
  onSelect,
  options = [],
  placeholder = ""
}) {
  const [filtrados, setFiltrados] = useState([]);
  const [indice, setIndice] = useState(-1);

  function filtrar(texto) {
    const t = texto.toLowerCase();

    const res = options.filter(o =>
      o.nome.toLowerCase().includes(t) ||
      o.codigo?.includes(t) ||
      o.apelido?.toLowerCase().includes(t)
    );

    setFiltrados(res.slice(0, 10));
  }

  return (
    <div className="relative">
      <input
        className="border rounded p-2 w-full"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v);
          filtrar(v);
          setIndice(-1);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setIndice(i => Math.min(i + 1, filtrados.length - 1));
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();
            setIndice(i => Math.max(i - 1, 0));
          }

          if (e.key === "Enter" && indice >= 0) {
            e.preventDefault();
            const item = filtrados[indice];
            onSelect(item);
            setFiltrados([]);
            setIndice(-1);
          }
        }}
      />

      {filtrados.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white border rounded shadow max-h-48 overflow-y-auto z-50">
          {filtrados.map((item, i) => (
            <div
              key={item.id}
              className={`p-2 cursor-pointer ${
                i === indice ? "bg-blue-200" : "hover:bg-gray-200"
              }`}
              onClick={() => {
                onSelect(item);
                setFiltrados([]);
                setIndice(-1);
              }}
            >
              {item.codigo} - {item.nome}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}