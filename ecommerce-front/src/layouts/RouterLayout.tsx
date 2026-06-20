import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navigation/NavBar';
import Footer from '../components/Footer';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          {/* 1. Adicionamos 'flex flex-col' para empilhar verticalmente a Navbar, Main e Footer.
            2. O 'min-h-screen' garante que esse contêiner pai ocupe no mínimo 100% da altura do navegador.
          */}
          <div className="app-container min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
            <Navbar />
            
            {/* 3. Adicionamos 'flex-grow' (ou 'flex-1') no <main>. 
                 Isso faz com que a área de conteúdo principal estique e "empurre" o Footer 
                 obrigatoriamente para o final da janela se o conteúdo da página for pequeno.
            */}
            <main className="flex-grow">
              <Outlet />
            </main>
            
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}