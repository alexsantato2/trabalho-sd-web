// src/components/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    // Adicionado: dark:bg-neutral-950, dark:border-neutral-800, dark:text-neutral-400 e a transição suave
    <footer className="bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-light text-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Coluna 1: Sobre a Marca */}
          <div className="space-y-4">
            <h3 className="text-neutral-900 dark:text-neutral-100 font-medium uppercase tracking-wider text-xs">Studio.</h3>
            <p className="leading-relaxed text-neutral-500 dark:text-neutral-400">
              Criando objetos atemporais e ambientes minimalistas para o cotidiano moderno.
            </p>
          </div>

          {/* Coluna 2: Links de Suporte */}
          <div className="space-y-3">
            <h3 className="text-neutral-900 dark:text-neutral-100 font-medium uppercase tracking-wider text-xs">Ajuda</h3>
            <ul className="space-y-2 flex flex-col">
              <Link to="/envios" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Envios e Entregas</Link>
              <Link to="/trocas" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Trocas e Devoluções</Link>
              <Link to="/contato" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Contato</Link>
            </ul>
          </div>

          {/* Coluna 3: Redes Sociais */}
          <div className="space-y-3">
            <h3 className="text-neutral-900 dark:text-neutral-100 font-medium uppercase tracking-wider text-xs">Social</h3>
            <ul className="space-y-2 flex flex-col">
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Instagram</a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Pinterest</a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">TikTok</a>
            </ul>
          </div>

          {/* Coluna 4: Newsletter */}
          <div className="space-y-4">
            <h3 className="text-neutral-900 dark:text-neutral-100 font-medium uppercase tracking-wider text-xs">Newsletter</h3>
            <p className="text-neutral-500 dark:text-neutral-400">Assine para receber lançamentos e conteúdos exclusivos.</p>
            <form className="flex border-b border-neutral-300 dark:border-neutral-700 pb-1" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Seu e-mail" 
                className="w-full bg-transparent pr-3 py-1 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none text-sm"
              />
              <button type="submit" className="text-xs uppercase font-medium tracking-wider text-neutral-900 dark:text-neutral-100 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors">
                Enviar
              </button>
            </form>
          </div>

        </div>

        {/* Direitos Autorais Súteis */}
        <div className="mt-16 pt-8 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 gap-4">
          <p>© 2026 Studio. Todos os direitos reservados.</p>
          <p>Feito com React & Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
}