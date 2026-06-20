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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import projetowebsd.ecommerceback.dto.product.ProductFilterDTO;
import projetowebsd.ecommerceback.dto.product.ProductRequestDTO;
import projetowebsd.ecommerceback.dto.product.ProductResponseDTO;
import projetowebsd.ecommerceback.dto.product.StockUpdateDTO;
import projetowebsd.ecommerceback.service.ProductService;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Produtos", description = "Catálogo público e gestão administrativa de produtos")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(
        summary = "Listar produtos ativos com filtros, paginação e ordenação dinâmica",
        description = "Retorna uma página de produtos ativos. Todos os filtros são opcionais e combináveis entre si. Endpoint público."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Página de produtos retornada com sucesso",
            content = @Content(mediaType = "application/json"))
    })
    public ResponseEntity<Page<ProductResponseDTO>> list(
            @Parameter(description = "Filtro por nome (busca parcial, case-insensitive)")
            @RequestParam(required = false) String name,

            @Parameter(description = "Filtro por categoria exata")
            @RequestParam(required = false) String category,

            @Parameter(description = "Preço mínimo (inclusive)", example = "50.00")
            @RequestParam(required = false) BigDecimal minPrice,

            @Parameter(description = "Preço máximo (inclusive)", example = "500.00")
            @RequestParam(required = false) BigDecimal maxPrice,

            @RequestParam(required = false) Boolean specialOffers,

            @Parameter(description = "Número da página (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Quantidade de itens por página", example = "12")
            @RequestParam(defaultValue = "12") int size,

            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        ProductFilterDTO filter = new ProductFilterDTO(name, category, minPrice, maxPrice, specialOffers);

        String[] sortParams = sort.split(",");
        String sortProperty = sortParams[0];
        Sort.Direction sortDirection = (sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable;

        // Se for uma ordenação complexa por agregação, delegamos a ordenação para a Specification
        // e criamos um Pageable comum sem ordenação interna para não quebrar o Hibernate
        if (sortProperty.equals("salesCount") || sortProperty.equals("rating")) {
            pageable = PageRequest.of(page, size);
        } else {
            pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortProperty));
        }

        // Passamos a propriedade e direção do sort para o Service processar no buildSpec
        return ResponseEntity.ok(productService.listWithFilters(filter, pageable, sortProperty, sortDirection));
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Buscar produto por ID",
        description = "Retorna os dados completos de um produto ativo pelo UUID. Endpoint público."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Produto encontrado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductResponseDTO.class))),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Produto não encontrado\"}")))
    })
    public ResponseEntity<ProductResponseDTO> findById(
            @Parameter(description = "UUID do produto", required = true)
            @PathVariable UUID id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @PostMapping
    @Operation(
        summary = "Criar produto",
        description = "Adiciona um novo produto ao catálogo com status ativo. Requer perfil ADMIN.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Produto criado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"name\": \"Nome é obrigatório\", \"price\": \"Preço deve ser maior que zero\"}"))),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}"))),
        @ApiResponse(responseCode = "403", description = "Sem permissão — requer ADMIN",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Acesso negado\"}")))
    })
    public ResponseEntity<ProductResponseDTO> create(@Valid @RequestBody ProductRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(request));
    }

    @GetMapping("/all")
    @Operation(
        summary = "Listar todos os produtos (incluindo inativos)",
        description = "Retorna todos os produtos sem filtro de status. Requer ADMIN.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<List<ProductResponseDTO>> listAll() {
        return ResponseEntity.ok(productService.listAll());
    }

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Excluir produto permanentemente",
        description = "Remove o produto do banco de dados. Requer ADMIN.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @Operation(
        summary = "Editar produto",
        description = "Substitui todos os campos editáveis de um produto existente (nome, descrição, categoria, preço e estoque). Requer perfil ADMIN.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Produto atualizado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"price\": \"Preço deve ser maior que zero\"}"))),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}"))),
        @ApiResponse(responseCode = "403", description = "Sem permissão — requer ADMIN",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Acesso negado\"}"))),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Produto não encontrado\"}")))
    })
    public ResponseEntity<ProductResponseDTO> update(
            @Parameter(description = "UUID do produto", required = true) @PathVariable UUID id,
            @Valid @RequestBody ProductRequestDTO request
    ) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(
        summary = "Inativar produto",
        description = "Marca o produto como inativo — ele deixa de aparecer no catálogo público, mas mantém histórico em pedidos. Requer ADMIN.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Produto inativado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}"))),
        @ApiResponse(responseCode = "403", description = "Sem permissão — requer ADMIN",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Acesso negado\"}"))),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Produto não encontrado\"}")))
    })
    public ResponseEntity<ProductResponseDTO> deactivate(
            @Parameter(description = "UUID do produto", required = true) @PathVariable UUID id) {
        return ResponseEntity.ok(productService.deactivate(id));
    }

    @PatchMapping("/{id}/stock")
    @Operation(
        summary = "Ajustar estoque",
        description = "Incrementa ou decrementa o estoque via delta. Use valor positivo para adicionar e negativo para remover unidades. " +
                      "Retorna 422 se o delta negativo deixar o estoque abaixo de zero. Requer ADMIN.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estoque ajustado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ProductResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Delta ausente ou inválido",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"delta\": \"Delta é obrigatório\"}"))),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}"))),
        @ApiResponse(responseCode = "403", description = "Sem permissão — requer ADMIN",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Acesso negado\"}"))),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Produto não encontrado\"}"))),
        @ApiResponse(responseCode = "422", description = "Estoque insuficiente para o delta negativo informado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Estoque insuficiente\"}")))
    })
    public ResponseEntity<ProductResponseDTO> updateStock(
            @Parameter(description = "UUID do produto", required = true) @PathVariable UUID id,
            @Valid @RequestBody StockUpdateDTO request
    ) {
        return ResponseEntity.ok(productService.updateStock(id, request));
    }
}
