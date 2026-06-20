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
import org.springframework.web.bind.annotation.*;
import projetowebsd.ecommerceback.dto.order.OrderFilterDTO;
import projetowebsd.ecommerceback.dto.order.OrderRequestDTO;
import projetowebsd.ecommerceback.dto.order.OrderResponseDTO;
import projetowebsd.ecommerceback.model.enums.OrderStatus;
import projetowebsd.ecommerceback.service.OrderService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Pedidos", description = "Criação e gestão de pedidos de compra")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(
        summary = "Finalizar compra",
        description = "Cria um novo pedido com status PENDING. Verifica e reserva o estoque de cada item. " +
                      "Dispara notificação WebSocket para admins conectados. Acessível por CUSTOMER e ADMIN."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Pedido criado com status PENDING",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = OrderResponseDTO.class))),
        @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"items\": \"O pedido deve conter ao menos um item\"}"))),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}"))),
        @ApiResponse(responseCode = "404", description = "Produto não encontrado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Produto não encontrado\"}"))),
        @ApiResponse(responseCode = "422", description = "Estoque insuficiente para um dos itens solicitados",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Estoque insuficiente para o produto Cadeira Escandinava\"}")))
    })
    public ResponseEntity<OrderResponseDTO> placeOrder(@Valid @RequestBody OrderRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.placeOrder(request));
    }

    @GetMapping("/my")
    @Operation(
        summary = "Histórico de pedidos do usuário autenticado",
        description = "Retorna todos os pedidos do usuário logado. Acessível por CUSTOMER e ADMIN."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista de pedidos do usuário",
            content = @Content(mediaType = "application/json")),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}")))
    })
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }

    @GetMapping
    @Operation(
        summary = "Listar todos os pedidos com filtros",
        description = "Retorna todos os pedidos da plataforma com suporte a filtros opcionais e combináveis. Requer ADMIN."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Lista de pedidos",
            content = @Content(mediaType = "application/json")),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}"))),
        @ApiResponse(responseCode = "403", description = "Sem permissão — requer ADMIN",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Acesso negado\"}")))
    })
    public ResponseEntity<List<OrderResponseDTO>> getAllOrders(
            @Parameter(description = "Filtrar por UUID do usuário")
            @RequestParam(required = false) UUID userId,

            @Parameter(description = "Data inicial (formato yyyy-MM-dd)", example = "2025-01-01")
            @RequestParam(required = false) LocalDate startDate,

            @Parameter(description = "Data final (formato yyyy-MM-dd)", example = "2025-12-31")
            @RequestParam(required = false) LocalDate endDate,

            @Parameter(description = "Valor mínimo do pedido", example = "100.00")
            @RequestParam(required = false) BigDecimal minAmount,

            @Parameter(description = "Valor máximo do pedido", example = "5000.00")
            @RequestParam(required = false) BigDecimal maxAmount,

            @Parameter(description = "Status do pedido",
                schema = @Schema(allowableValues = {"PENDING", "APPROVED", "REJECTED"}))
            @RequestParam(required = false) OrderStatus status
    ) {
        OrderFilterDTO filter = new OrderFilterDTO(userId, startDate, endDate, minAmount, maxAmount, status);
        return ResponseEntity.ok(orderService.getAllOrders(filter));
    }

    @GetMapping("/pending-count")
    @Operation(
        summary = "Contar pedidos pendentes",
        description = "Retorna o total de pedidos com status PENDING. Usado pelo painel admin para exibir badge de notificação. Requer ADMIN."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Contagem retornada com sucesso",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"count\": 7}"))),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}"))),
        @ApiResponse(responseCode = "403", description = "Sem permissão — requer ADMIN",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Acesso negado\"}")))
    })
    public ResponseEntity<Map<String, Long>> pendingCount() {
        return ResponseEntity.ok(Map.of("count", orderService.countPending()));
    }

    @PatchMapping("/{id}/approve")
    @Operation(
        summary = "Aprovar pedido pendente",
        description = "Muda o status de PENDING para APPROVED. Somente pedidos PENDING podem ser aprovados. " +
                      "Dispara notificação WebSocket para o cliente. Requer ADMIN."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Pedido aprovado com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = OrderResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}"))),
        @ApiResponse(responseCode = "403", description = "Sem permissão — requer ADMIN",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Acesso negado\"}"))),
        @ApiResponse(responseCode = "404", description = "Pedido não encontrado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Pedido não encontrado\"}"))),
        @ApiResponse(responseCode = "422", description = "Pedido não está com status PENDING",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Pedido não está pendente\"}")))
    })
    public ResponseEntity<OrderResponseDTO> approve(
            @Parameter(description = "UUID do pedido", required = true) @PathVariable UUID id) {
        return ResponseEntity.ok(orderService.approve(id));
    }

    @PatchMapping("/{id}/reject")
    @Operation(
        summary = "Rejeitar pedido pendente",
        description = "Muda o status de PENDING para REJECTED e restaura o estoque de todos os itens do pedido. " +
                      "Somente pedidos PENDING podem ser rejeitados. Dispara notificação WebSocket para o cliente. Requer ADMIN."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Pedido rejeitado e estoque restaurado",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = OrderResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Não autenticado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Token JWT ausente ou inválido\"}"))),
        @ApiResponse(responseCode = "403", description = "Sem permissão — requer ADMIN",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Acesso negado\"}"))),
        @ApiResponse(responseCode = "404", description = "Pedido não encontrado",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Pedido não encontrado\"}"))),
        @ApiResponse(responseCode = "422", description = "Pedido não está com status PENDING",
            content = @Content(mediaType = "application/json",
                schema = @Schema(example = "{\"error\": \"Pedido não está pendente\"}")))
    })
    public ResponseEntity<OrderResponseDTO> reject(
            @Parameter(description = "UUID do pedido", required = true) @PathVariable UUID id) {
        return ResponseEntity.ok(orderService.reject(id));
    }
}
