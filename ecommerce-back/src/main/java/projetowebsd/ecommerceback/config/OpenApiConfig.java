package projetowebsd.ecommerceback.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "E-Commerce API",
                version = "1.0",
                description = """
                        API REST do sistema de e-commerce desenvolvido para a disciplina de SD Web (USP).

                        ## Autenticação
                        A maioria dos endpoints requer um **Bearer token JWT** no header `Authorization`.
                        Use `POST /api/auth/login` para obter o token e clique em **Authorize** para configurá-lo no Swagger UI.

                        ## Papéis de usuário
                        | Papel | Acesso |
                        |-------|--------|
                        | **CUSTOMER** | Catálogo, compras, histórico de pedidos, avaliações e perfil próprio |
                        | **ADMIN** | Tudo do CUSTOMER + gestão de produtos, imagens, usuários e aprovação de pedidos |

                        ## Respostas de erro padrão
                        | Status | Significado |
                        |--------|-------------|
                        | 400 | Dados de entrada inválidos — resposta com mapa `{ campo: mensagem }` |
                        | 401 | Token JWT ausente, expirado ou inválido |
                        | 403 | Token válido mas sem permissão para o recurso |
                        | 404 | Recurso não encontrado |
                        | 422 | Regra de negócio violada (estoque insuficiente, e-mail duplicado, etc.) |
                        | 500 | Erro interno inesperado do servidor |
                        """,
                contact = @Contact(
                        name = "SD Web — USP",
                        email = "alexandresantato2@gmail.com"
                )
        ),
        servers = {
                @Server(url = "http://localhost:8080", description = "Servidor local de desenvolvimento")
        }
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER,
        description = "Token JWT obtido via POST /api/auth/login. Insira somente o token, sem o prefixo 'Bearer'."
)
public class OpenApiConfig {
}
