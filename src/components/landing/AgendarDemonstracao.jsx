export default function AgendarDemonstracao() {
  const whatsapp =
    "https://wa.me/5516992975836?text=Olá%2C%20quero%20agendar%20uma%20demonstração%20do%20FinanceFlow.";

  return (
    <section className="bg-[#061f4a] px-5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 px-6 py-8 text-center md:flex-row md:text-left">
        <div>
          <h2 className="text-2xl font-black text-white md:text-3xl">
            Veja o FinanceFlow funcionando na sua empresa
          </h2>

          <p className="mt-2 max-w-2xl text-base text-cyan-100">
            Agende uma demonstração online de 20 minutos, sem compromisso.
          </p>
        </div>

        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-500 px-6 py-4 text-base font-black text-white transition hover:bg-emerald-600"
        >
          Agendar demonstração
        </a>
      </div>
    </section>
  );
}