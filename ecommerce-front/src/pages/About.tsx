export default function About() {
  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen text-neutral-800 dark:text-neutral-100">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Cabeçalho do Projeto */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 block mb-2">
            Projeto de Sistemas Distribuídos e Desenvolvimento Web
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-4">
            Sobre o E-Commerce
          </h1>
          <p className="text-base text-neutral-500 max-w-2xl mx-auto font-light">
            Uma plataforma desenvolvida para demonstrar a aplicação de arquiteturas modernas na Web, focando na performance, segurança e usabilidade.
          </p>
        </div>

        {/* Secção 3: Identificação do Grupo */}
        <section className="bg-neutral-50 dark:bg-neutral-900/50 p-8 rounded border border-neutral-100 dark:border-neutral-900">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4 text-center">
            Desenvolvimento do Trabalho
          </h2>
          <div className="text-center space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <p className="font-medium text-neutral-800 dark:text-neutral-200">Grupo de Trabalho nº 4</p>
            <p>Henrique B. Kulkamp</p>
            <p>Mateus Ribeiro</p>
            <p>Alexandre Santato</p>
            {/* Podes adicionar aqui os outros membros se houver */}
            <p className="text-xs text-neutral-400 mt-4 pt-4 border-t border-neutral-200/60 dark:border-neutral-800">
              Universidade De São Paulo · 2026
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}