# ecommerce-front

Interface web do e-commerce, desenvolvida com React 19 para a disciplina de Sistemas Distribuídos e Desenvolvimento Web (USP).

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- React Router v7
- Axios
- STOMP.js + SockJS (WebSocket)

## Pré-requisitos

- Node.js 20+
- npm 10+

## Setup

1. Instalar dependências:
   ```bash
   npm install
   ```

2. Copiar o arquivo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

3. Iniciar o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

A aplicação sobe em `http://localhost:5173`.

> O backend precisa estar rodando em `http://localhost:8080` antes de usar a aplicação.

## Variáveis de ambiente (`.env`)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_API_BASE_URL` | URL base da API REST | `http://localhost:8080/api` |
| `VITE_WS_URL` | URL do endpoint WebSocket | `http://localhost:8080/ws` |
| `VITE_VIACEP_BASE_URL` | URL base da API ViaCEP | `https://viacep.com.br/ws` |

## Rotas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Público | Catálogo com busca e filtros |
| `/product/:id` | Público | Detalhe do produto + avaliações |
| `/login` | Público | Login |
| `/register` | Público | Cadastro |
| `/cart` | Autenticado | Carrinho |
| `/checkout` | Autenticado | Finalizar compra (preenchimento por CEP) |
| `/orders` | Autenticado | Histórico de pedidos |
| `/profile` | Autenticado | Perfil do usuário |
| `/admin` | Admin | Dashboard |
| `/admin/products` | Admin | Gestão de produtos |
| `/admin/orders` | Admin | Gestão de pedidos |
| `/admin/users` | Admin | Listagem de usuários |

## Funcionalidades

- Autenticação JWT com refresh token automático
- Catálogo com busca por nome, filtro por categoria e paginação
- Carrinho de compras (estado local)
- Checkout com preenchimento automático de endereço via ViaCEP
- Histórico de pedidos com atualização em tempo real via WebSocket
- Avaliações de produtos (estrelas + comentário)
- Modo escuro / claro com persistência
- Skeleton loading nos estados de carregamento
- Badge de pedidos pendentes no menu admin (tempo real)
- Upload de imagens de produtos (armazenadas no banco)

## Estrutura

```
src/
├── components/   → componentes reutilizáveis
├── contexts/     → AuthContext, CartContext, ThemeContext
├── hooks/        → useWebSocket
├── pages/        → páginas por rota
│   └── admin/    → páginas do painel admin
├── services/     → clientes Axios por recurso
├── types/        → interfaces TypeScript
├── utils/        → imageUrl e outros utilitários
└── router/       → definição das rotas
```
