# ─── Estágio 1: build com npm ─────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Copia manifesto de dependências primeiro para aproveitar o cache de camadas
COPY package.json package-lock.json ./
RUN npm ci

# Recebe as variáveis de ambiente do Vite como build args
# (Vite as embute no bundle em tempo de compilação)
ARG VITE_API_BASE_URL=http://localhost:8080/api
ARG VITE_WS_URL=http://localhost:8080/ws
ARG VITE_VIACEP_BASE_URL=https://viacep.com.br/ws

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_VIACEP_BASE_URL=$VITE_VIACEP_BASE_URL

# Copia o código-fonte e gera o bundle de produção
COPY . .
RUN npm run build

# ─── Estágio 2: servir com nginx ──────────────────────────────────────────────
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
