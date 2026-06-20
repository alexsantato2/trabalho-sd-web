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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import projetowebsd.ecommerceback.dto.review.ReviewRequestDTO;
import projetowebsd.ecommerceback.dto.review.ReviewResponseDTO;
import projetowebsd.ecommerceback.service.ReviewService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Avaliações", description = "Avaliações de produtos por clientes com pedido aprovado")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    @Operation(
        summary = "Listar avaliações de um produto",
        description = "Retorna todas as avaliações publicadas para o produto informado. Endpoint público, sem necessidade de autenticação."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista de avaliações do produto",
            content = @Content(mediaType = "application/json")),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Produto não encontrado\"}")))
    })
    public ResponseEntity<List<ReviewResponseDTO>> list(
            @Parameter(description = "UUID do produto", required = true) @PathVariable UUID productId) {
        return ResponseEntity.ok(reviewService.listByProduct(productId));
    }

    @GetMapping("/check")
    @Operation(summary = "Verifica se o usuário logado já avaliou este produto",
            security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Boolean> checkIfUserReviewed(
            @PathVariable UUID productId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // userDetails.getUsername() geralmente traz o email ou login do JWT
        boolean hasReviewed = reviewService.hasUserReviewedProduct(productId, userDetails.getUsername());
        return ResponseEntity.ok(hasReviewed);
    }


    @PostMapping
    @Operation(
        summary = "Avaliar um produto",
        description = "Cria uma avaliação com nota (1–5) e comentário. " +
                      "Restrições: o usuário deve ter ao menos um pedido APPROVED contendo o produto; " +
                      "cada usuário só pode avaliar o mesmo produto uma única vez.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Avaliação criada com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ReviewResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"rating\": \"Nota mínima: 1\", \"comment\": \"Comentário é obrigatório\"}"))),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}"))),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Produto não encontrado\"}"))),
        @ApiResponse(responseCode = "422", description = "Usuário não comprou o produto ou já o avaliou",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Você já avaliou este produto\"}")))
    })
    public ResponseEntity<ReviewResponseDTO> create(
            @Parameter(description = "UUID do produto", required = true) @PathVariable UUID productId,
            @Valid @RequestBody ReviewRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.create(productId, request, userDetails.getUsername()));
    }
}
