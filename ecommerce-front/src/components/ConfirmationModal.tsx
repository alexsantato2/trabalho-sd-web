import { useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;        
  description?: string;  
  cancelText?: string;   
  confirmText?: string;  
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Esvaziar carrinho",                 
  description = "Esta ação removerá todos os itens guardados no seu carrinho de compras atual. Esta operação não pode ser desfeita.",
  cancelText = "Cancelar",                     
  confirmText = "Esvaziar"                     
}: ConfirmationModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4" 
      role="alert" 
      aria-modal="true"
    >
      {/* 1. OVERLAY / BACKDROP - Com transição suave e escurecimento regulado */}
      <div 
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md animate-fade-in" 
        onClick={onClose} 
      />

      {/* 2. CAIXA DO MODAL 
        - Mudado para rounded-2xl (16px) para indicar um container de propósito maior.
        - Mantido o shadow-xl para representar a elevação máxima sobre a página.
      */}
      <div 
        className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10 border border-neutral-200 dark:border-neutral-800 animate-modal-appear"
      >
        
        {/* Header - Dividido por uma linha sutil de 1px (border-b) */}
        {/* p-6 equivale a 24px (x-large), dando o respiro correto para o título */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xl font-light p-1 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content / Body */}
        {/* p-6 mantém o ritmo visual idêntico ao do cabeçalho */}
        <div className="p-6 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {description}
        </div>

        {/* Footer 
          - gap-2 equivale a 8px (x-small), a distância oficial da AWS entre botões em faixas de ação.
          - p-4 equivale a 16px (medium), criando um bloco compacto e estruturado.
        */}
        <div className="flex justify-end gap-2 p-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800">
          
          {/* Botão Cancelar: Estilo secundário limpo, apenas com efeito de hover adaptativo */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            {cancelText}
          </button>

          {/* Botão Confirmar: Solid/Dark fill vermelho com texto branco (Máximo Contraste) 
            - Arredondamento rounded-lg (8px) combinando com o padrão de elementos interativos.
          */}
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}