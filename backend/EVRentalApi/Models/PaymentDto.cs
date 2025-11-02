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

// Wallet Deposit Request/Response
public record DepositRequest(
    decimal Amount,
    string MethodType,
    string? TransactionId = null
);

// Payment Gateway Models
public class PaymentIntentRequest
{
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "VND";
    public string Method { get; set; } = string.Empty; // stripe, paypal, momo, vnpay, bank_transfer
    public Dictionary<string, string>? Metadata { get; set; }
}

public class PaymentIntentResponse
{
    public string IntentId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public string? CheckoutUrl { get; set; }
    public Dictionary<string, object>? PaymentData { get; set; }
}

public class ConfirmPaymentRequest
{
    public string IntentId { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal? Amount { get; set; }
    public Dictionary<string, object>? PaymentData { get; set; }
}

public class ConfirmPaymentResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public decimal? NewBalance { get; set; }
}

// Staff Payment History DTO with customer and vehicle info
public class StaffPaymentDto
{
    public int PaymentId { get; set; }
    public int? ReservationId { get; set; }
    public int? RentalId { get; set; }
    public int? UserId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    public int? VehicleId { get; set; }
    public string? VehicleModel { get; set; }
    public string? VehicleUniqueId { get; set; }
    public string MethodType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? TransactionType { get; set; } // payment, deposit, refund, withdrawal
    public string? TransactionId { get; set; }
    public bool IsDeposit { get; set; }
    public DateTime CreatedAt { get; set; }
}