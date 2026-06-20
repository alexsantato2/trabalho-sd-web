package projetowebsd.ecommerceback.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import projetowebsd.ecommerceback.exception.BusinessException;
import projetowebsd.ecommerceback.exception.ResourceNotFoundException;
import projetowebsd.ecommerceback.model.Product;
import projetowebsd.ecommerceback.repository.ProductRepository;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Tag(name = "Imagens", description = "Upload e acesso a imagens de produtos (armazenadas no banco de dados)")
public class ImageController {

    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final ProductRepository productRepository;

    @CacheEvict(value = "products", allEntries = true)
    @PostMapping(value = "/{productId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary = "Fazer upload de imagem para um produto",
        description = "Substitui (ou define pela primeira vez) a imagem do produto. " +
                      "A imagem é armazenada diretamente no banco de dados (bytea). " +
                      "Formatos aceitos: JPEG, PNG, WebP, GIF. Tamanho máximo: 5 MB. " +
                      "Invalida o cache de produtos ao concluir. Requer ADMIN.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Upload realizado com sucesso — sem corpo na resposta"),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}"))),
        @ApiResponse(responseCode = "403", description = "Sem permissão — requer ADMIN",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Acesso negado\"}"))),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Produto não encontrado\"}"))),
        @ApiResponse(responseCode = "422", description = "Arquivo ausente, muito grande ou tipo não suportado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Arquivo muito grande. Máximo permitido: 5 MB\"}")))
    })
    public ResponseEntity<Void> upload(
            @Parameter(description = "UUID do produto", required = true)
            @PathVariable UUID productId,

            @Parameter(description = "Arquivo de imagem (JPEG, PNG, WebP ou GIF — máx. 5 MB)", required = true)
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        if (file.isEmpty()) {
            throw new BusinessException("Arquivo vazio");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BusinessException("Arquivo muito grande. Máximo permitido: 5 MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BusinessException("Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + productId));

        product.setImageData(file.getBytes());
        product.setImageContentType(contentType);
        productRepository.save(product);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/{productId}")
    @Operation(
        summary = "Obter imagem de um produto",
        description = "Retorna os bytes da imagem com o Content-Type correto e header de cache de 24 horas (max-age=86400). " +
                      "Retorna 404 se o produto não existir ou não tiver imagem cadastrada. Endpoint público."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Imagem retornada com sucesso",
            content = {
                @Content(mediaType = "image/jpeg"),
                @Content(mediaType = "image/png"),
                @Content(mediaType = "image/webp"),
                @Content(mediaType = "image/gif")
            }),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado ou sem imagem cadastrada",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Produto não encontrado\"}")))
    })
    public ResponseEntity<byte[]> getImage(
            @Parameter(description = "UUID do produto", required = true) @PathVariable UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado: " + productId));

        if (product.getImageData() == null) {
            return ResponseEntity.notFound().build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(product.getImageContentType()));
        headers.setCacheControl("max-age=86400");

        return ResponseEntity.ok().headers(headers).body(product.getImageData());
    }
}
