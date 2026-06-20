# ─── Estágio 1: build com Maven ───────────────────────────────────────────────
# Requer Java 25 (Spring Boot 4.x). Se a imagem não existir no Docker Hub,
# verifique as tags disponíveis em: https://hub.docker.com/_/eclipse-temurin
FROM eclipse-temurin:25-jdk-alpine AS build

WORKDIR /app

# Copia o Maven Wrapper e o pom.xml primeiro para aproveitar o cache de camadas
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw

# Baixa dependências (camada separada — só re-executa se pom.xml mudar)
RUN ./mvnw dependency:go-offline -B -q

# Copia o código-fonte e compila
COPY src ./src
RUN ./mvnw package -DskipTests -B -q

# ─── Estágio 2: imagem de execução enxuta ─────────────────────────────────────
FROM eclipse-temurin:25-jdk-alpine

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
