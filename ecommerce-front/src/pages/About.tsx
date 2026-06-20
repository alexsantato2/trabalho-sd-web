export default function About() {
  return (
    <div className="bg-white dark:bg-neutral-950 min-h-screen text-neutral-800 dark:text-neutral-100">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Cabeçalho do Projeto */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 block mb-2">
            Projeto Académico · Engenharia de Software
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-4">
            Sobre o E-Commerce
          </h1>
          <p className="text-base text-neutral-500 max-w-2xl mx-auto font-light">
            Uma plataforma conceptual desenvolvida para demonstrar a aplicação de arquiteturas modernas na Web, focando-se na performance, segurança e usabilidade.
          </p>
        </div>

        {/* Secção 1: O Conceito de Negócio */}
        <section className="space-y-4 mb-12 border-b border-neutral-100 dark:border-neutral-900 pb-8">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            A Proposta de Valor
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Fundado em 2026, em Ribeirão Preto, o nosso e-commerce começou sua trajetória para democratizar e integrar todo o Brasil, usando tecnologia, inovação, desenvolvimento web, sistemas distribuidos, interação de humanos e computadores, diversidade e inclusão. Oferecemos uma curadoria exclusiva de objetos decorativos e mobiliário minimalista, focados em qualidade, atemporalidade e sustentabilidade. Nosso objetivo é criar uma experiência de compra online que seja tão inspiradora quanto os ambientes que ajudamos a criar.
          </p>
        </section>

        {/* Secção 2: Especificações Técnicas (Para o Professor ver) */}
        <section className="mb-12 border-b border-neutral-100 dark:border-neutral-900 pb-8">
          <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-6">
            Arquitetura e Tecnologias
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="border border-neutral-200 dark:border-neutral-800 p-5 rounded bg-neutral-50/50 dark:bg-neutral-900/20">
              <h3 className="font-medium text-sm mb-2 text-neutral-900 dark:text-neutral-100">Frontend</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Desenvolvido em <b>React</b> com <b>Vite</b> e <b>TypeScript</b>. Interface responsiva estilizada com <b>Tailwind CSS</b>, consumindo APIs assíncronas de forma otimizada.
              </p>
            </div>
            <div className="border border-neutral-200 dark:border-neutral-800 p-5 rounded bg-neutral-50/50 dark:bg-neutral-900/20">
              <h3 className="font-medium text-sm mb-2 text-neutral-900 dark:text-neutral-100">Backend</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Construído com <b>Spring Boot (Java)</b>. Implementa segurança robusta com <b>Spring Security</b> e <b>JWT (Stateless)</b>, além de controlo de concorrência e paginação.
              </p>
            </div>
            <div className="border border-neutral-200 dark:border-neutral-800 p-5 rounded bg-neutral-50/50 dark:bg-neutral-900/20">
              <h3 className="font-medium text-sm mb-2 text-neutral-900 dark:text-neutral-100">Infraestrutura</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Utilizamos o <b>Docker</b> para containerização dos serviços, garantindo consistência e facilidade de implantação em diferentes ambientes.
              </p>
            </div>
          </div>
        </section>

        {/* Secção 3: Identificação do Grupo */}
        <section className="bg-neutral-50 dark:bg-neutral-900/50 p-8 rounded border border-neutral-100 dark:border-neutral-900">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4 text-center">
            Desenvolvimento do Trabalho
          </h2>
          <div className="text-center space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <p className="font-medium text-neutral-800 dark:text-neutral-200">Grupo de Trabalho nº 4</p>
            <p>Henrique B. kulkamp</p>
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