import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { orderService } from '../../services/orderService';
import { useWebSocket } from '../../hooks/useWebSocket';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const { isDark, toggleDark } = useTheme();
  const navigate = useNavigate();
  
  const [pendingCount, setPendingCount] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const { lastOrderNotification } = useWebSocket({ isAdmin: isAdmin ? true : undefined });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdowns se clicar fora do menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setIsMoreMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    orderService.getPendingCount().then(({ count }) => setPendingCount(count)).catch(() => {});
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !lastOrderNotification) return;
    orderService.getPendingCount().then(({ count }) => setPendingCount(count)).catch(() => {});
  }, [lastOrderNotification, isAdmin]);

  // --- CONFIGURAÇÃO DA IDENTIDADE (Padrão AWS identity) ---
  const identity = {
    to: "/",
    title: "Studio",
    label: "."
  };

  // --- CONFIGURAÇÃO DOS UTILITÁRIOS (Mimetizando as Utilities da AWS) ---
  const utilities = [
    {
      id: "theme",
      type: "button",
      text: isDark ? '☀' : '☾',
      ariaLabel: isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro',
      onClick: toggleDark,
      disableUtilityCollapse: true // Itens críticos não colapsam no mobile
    },
    {
      id: "cart",
      type: "button",
      text: "Carrinho",
      ariaLabel: count > 0 ? `Carrinho, ${count} itens` : 'Carrinho vazio',
      to: "/cart",
      badge: count > 0 ? count : null,
      disableUtilityCollapse: true
    },
    // Exibido apenas se for Admin
    ...(isAdmin ? [{
      id: "admin",
      type: "button",
      text: "Admin",
      ariaLabel: `${pendingCount} pedidos pendentes`,
      to: "/admin",
      badge: pendingCount > 0 ? (pendingCount > 9 ? '9+' : pendingCount) : null,
      disableUtilityCollapse: false
    }] : []),
    // Menu Dropdown do Usuário Autenticado
    ...(isAuthenticated ? [{
      id: "user-profile",
      type: "menu-dropdown",
      text: user?.name || "Cliente",
      icon: "👤",
      disableUtilityCollapse: false,
      items: [
        { id: "orders", text: "Meus pedidos", to: "/orders" },
        { id: "profile", text: "Meu perfil", to: "/profile" },
        { id: "signout", text: "Sair", onClick: logout, variant: "danger" }
      ]
    }] : [{
      id: "login",
      type: "button",
      text: "Entrar",
      to: "/login",
      disableUtilityCollapse: false
    }])
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800 transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between" ref={dropdownRef}>

          {/* Identity Component */}
          <div className="flex-shrink-0">
            <Link to={identity.to} className="text-xl font-bold tracking-widest text-neutral-900 dark:text-neutral-100 uppercase">
              {identity.title}<span className="font-light text-neutral-500">{identity.label}</span>
            </Link>
          </div>

          {/* Links Auxiliares Centrais (Desktop) */}
          <div className="hidden md:flex space-x-8 text-sm uppercase tracking-wider font-medium">
            <Link to="/" className="text-neutral-900 dark:text-neutral-100 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors">
              Início
            </Link>
            <Link to="/about" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Sobre
            </Link>
          </div>

          {/* Utilities Component Group */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {utilities.map((utility) => {
              // Renderização de Botões Normais / Links (Desktop)
              if (utility.type === "button") {
                const isCollapsedClass = utility.disableUtilityCollapse ? "" : "hidden md:inline-flex";
                const content = (
                  <span className="relative flex items-center gap-1">
                    {utility.text}
                    {utility.badge && (
                      <span className="flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100 text-[10px] font-bold text-white dark:text-neutral-900 leading-none">
                        {utility.badge}
                      </span>
                    )}
                  </span>
                );

                return utility.to ? (
                  <Link
                    key={utility.id}
                    to={utility.to}
                    className={`${isCollapsedClass} p-2 text-sm uppercase tracking-wider font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors`}
                    aria-label={utility.ariaLabel}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    key={utility.id}
                    onClick={utility.onClick}
                    className={`${isCollapsedClass} p-2 text-sm uppercase tracking-wider font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors`}
                    aria-label={utility.ariaLabel}
                  >
                    {utility.text}
                  </button>
                );
              }

              // Renderização de Menus Dropdown Corporativos (Desktop)
              if (utility.type === "menu-dropdown") {
                return (
                  <div key={utility.id} className="relative hidden md:block">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === utility.id ? null : utility.id)}
                      className="flex items-center gap-2 p-2 text-sm uppercase tracking-wider font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                      aria-expanded={activeDropdown === utility.id}
                    >
                      <span>{utility.icon}</span>
                      <span>{utility.text}</span>
                      <span className="text-[10px] opacity-50 transition-transform duration-200" style={{ transform: activeDropdown === utility.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                    </button>

                    {activeDropdown === utility.id && (
                      <div className="absolute right-0 mt-2 w-56 rounded-md shadow-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* Header do Perfil igualzinho ao da AWS */}
                        <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{utility.text}</p>
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">{utility.description}</p>
                        </div>
                        <div className="py-1">
                          {utility.items?.map((item) => {
                            const baseClass = "w-full text-left px-4 py-2 text-sm transition-colors ";
                            const colorClass = item.variant === "danger" 
                              ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30" 
                              : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60";

                            return item.to ? (
                              <Link key={item.id} to={item.to} className={`${baseClass} ${colorClass} block`} onClick={() => setActiveDropdown(null)}>
                                {item.text}
                              </Link>
                            ) : (
                              <button key={item.id} onClick={() => { item.onClick?.(); setActiveDropdown(null); }} className={`${baseClass} ${colorClass}`}>
                                {item.text}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}

            {/* --- OVERFLOW MENU AUTOMÁTICO (Mais) --- */}
            <div className="relative md:hidden">
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="text-sm uppercase tracking-wider font-semibold text-neutral-900 dark:text-neutral-100 p-2 flex items-center gap-1"
                aria-expanded={isMoreMenuOpen}
              >
                Mais
                <span className="text-[9px] opacity-60">▼</span>
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-md shadow-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 z-50">
                  <div className="py-1 flex flex-col text-sm">
                    {/* Links que sumiram no mobile */}
                    <Link to="/" className="px-4 py-2.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60" onClick={() => setIsMoreMenuOpen(false)}>Início</Link>
                    <Link to="/about" className="px-4 py-2.5 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60" onClick={() => setIsMoreMenuOpen(false)}>Sobre</Link>
                    
                    {/* Injeção dos itens colapsáveis da utility list no menu "Mais" */}
                    {utilities.filter(u => !u.disableUtilityCollapse).map((utility) => {
                      if (utility.type === "button" && utility.to) {
                        return (
                          <Link key={utility.id} to={utility.to} className="px-4 py-2.5 font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 flex justify-between items-center" onClick={() => setIsMoreMenuOpen(false)}>
                            <span>{utility.text}</span>
                            {utility.badge && <span className="bg-red-500 text-white rounded-full px-1.5 text-xs font-bold">{utility.badge}</span>}
                          </Link>
                        );
                      }
                      if (utility.type === "menu-dropdown") {
                        return (
                          <div key={utility.id} className="border-t border-neutral-100 dark:border-neutral-800 mt-1 pt-1">
                            <div className="px-4 py-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider">{utility.text}</div>
                            {utility.items?.map(item => (
                              item.to ? (
                                <Link key={item.id} to={item.to} className="px-6 py-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 block" onClick={() => setIsMoreMenuOpen(false)}>
                                  {item.text}
                                </Link>
                              ) : (
                                <button key={item.id} onClick={() => { item.onClick?.(); setIsMoreMenuOpen(false); }} className="w-full text-left px-6 py-2 text-red-600 dark:text-red-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60">
                                  {item.text}
                                </button>
                              )
                            ))}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </nav>
  );
}