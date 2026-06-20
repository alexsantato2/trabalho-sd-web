package projetowebsd.ecommerceback.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import projetowebsd.ecommerceback.dto.user.UpdateProfileRequestDTO;
import projetowebsd.ecommerceback.dto.user.UserResponseDTO;
import projetowebsd.ecommerceback.service.UserService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Perfil do usuário logado e gestão administrativa de usuários")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(
        summary = "Obter perfil do usuário autenticado",
        description = "Retorna os dados do usuário identificado pelo token JWT. Acessível por CUSTOMER e ADMIN."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Perfil retornado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}")))
    })
    public ResponseEntity<UserResponseDTO> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getUsername()));
    }

    @PatchMapping("/me")
    @Operation(
        summary = "Atualizar nome do usuário autenticado",
        description = "Altera o nome de exibição do usuário logado. E-mail e papel não podem ser alterados via API. Acessível por CUSTOMER e ADMIN."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Perfil atualizado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Nome inválido ou ausente",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"name\": \"Nome é obrigatório\"}"))),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}")))
    })
    public ResponseEntity<UserResponseDTO> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequestDTO request
    ) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), request));
    }

    @GetMapping
    @Operation(
        summary = "Listar todos os usuários",
        description = "Retorna todos os usuários cadastrados na plataforma. Requer ADMIN."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista de usuários",
            content = @Content(mediaType = "application/json")),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}"))),
        @ApiResponse(responseCode = "403", description = "Sem permissão — requer ADMIN",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Acesso negado\"}")))
    })
    public ResponseEntity<List<UserResponseDTO>> listAll() {
        return ResponseEntity.ok(userService.listAll());
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Buscar usuário por ID",
        description = "Retorna os dados de um usuário específico pelo UUID. Requer ADMIN."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuário encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}"))),
        @ApiResponse(responseCode = "403", description = "Sem permissão — requer ADMIN",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Acesso negado\"}"))),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Usuário não encontrado\"}")))
    })
    public ResponseEntity<UserResponseDTO> findById(
            @Parameter(description = "UUID do usuário", required = true) @PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }
}
