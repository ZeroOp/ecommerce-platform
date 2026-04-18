package com.redstore.inventory.dto;

public record OperationResultDto(
        boolean success,
        String code,
        String message
) {
    public static OperationResultDto ok() {
        return new OperationResultDto(true, "OK", null);
    }

    public static OperationResultDto insufficientStock() {
        return new OperationResultDto(false, "INSUFFICIENT_STOCK", "Not enough quantity available");
    }
}
