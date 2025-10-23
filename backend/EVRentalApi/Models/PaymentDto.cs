namespace EVRentalApi.Models;

public class CreatePaymentRequest
{
    public int? ReservationId { get; set; }
    public int? RentalId { get; set; }
    public string MethodType { get; set; } = string.Empty; // cash, momo, vnpay, bank_transfer
    public decimal Amount { get; set; }
    public string Status { get; set; } = "success"; // pending, success, failed, refunded
    public string? TransactionId { get; set; }
    public bool IsDeposit { get; set; } = false;
}

public class PaymentResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public PaymentDto? Payment { get; set; }
}

public class PaymentDto
{
    public int PaymentId { get; set; }
    public int? ReservationId { get; set; }
    public int? RentalId { get; set; }
    public string MethodType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public bool IsDeposit { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

