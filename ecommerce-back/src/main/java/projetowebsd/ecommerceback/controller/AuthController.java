package projetowebsd.ecommerceback.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projetowebsd.ecommerceback.dto.auth.AuthResponseDTO;
import projetowebsd.ecommerceback.dto.auth.LoginRequestDTO;
import projetowebsd.ecommerceback.dto.auth.RefreshRequestDTO;
import projetowebsd.ecommerceback.dto.auth.RegisterRequestDTO;
import projetowebsd.ecommerceback.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Registro, login e renovação de tokens JWT")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(
        summary = "Cadastrar novo usuário",
        description = "Cria um novo usuário com papel CUSTOMER. Retorna access token e refresh token prontos para uso imediato."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuário criado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos (campo ausente ou formato errado)",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"email\": \"E-mail inválido\", \"password\": \"Senha deve ter ao menos 6 caracteres\"}"))),
        @ApiResponse(responseCode = "422", description = "E-mail já cadastrado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"E-mail já está em uso\"}")))
    })
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(
        summary = "Autenticar usuário e obter tokens JWT",
        description = "Autentica com e-mail e senha. Retorna access token (curta duração) e refresh token (longa duração). " +
                      "Use o access token no header `Authorization: Bearer <token>`."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Autenticação bem-sucedida",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"email\": \"E-mail inválido\"}"))),
        @ApiResponse(responseCode = "422", description = "Credenciais inválidas (e-mail não existe ou senha incorreta)",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Credenciais inválidas\"}")))
    })
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    @Operation(
        summary = "Renovar access token usando refresh token",
        description = "Emite um novo access token sem exigir senha. Use quando o access token expirar. " +
                      "O refresh token permanece válido até sua própria expiração."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Novo access token emitido",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"refreshToken\": \"Refresh token é obrigatório\"}"))),
        @ApiResponse(responseCode = "422", description = "Refresh token inválido ou expirado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Refresh token inválido ou expirado\"}")))
    })
    public ResponseEntity<AuthResponseDTO> refresh(@Valid @RequestBody RefreshRequestDTO request) {
        return ResponseEntity.ok(authService.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    @Operation(
        summary = "Invalidar refresh token (logout)",
        description = "Revoga o refresh token no servidor. O access token não pode ser revogado — " +
                      "aguarde expirar naturalmente ou descarte-o no cliente."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Logout realizado com sucesso",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"message\": \"Logout realizado com sucesso\"}"))),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"refreshToken\": \"Refresh token é obrigatório\"}")))
    })
    public ResponseEntity<Map<String, String>> logout(@Valid @RequestBody RefreshRequestDTO request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.ok(Map.of("message", "Logout realizado com sucesso"));
    }
}
