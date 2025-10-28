using EVRentalApi.Models;

namespace EVRentalApi.Application.Services;

public interface IPaymentGatewayService
{
    Task<PaymentIntentResponse> CreatePaymentIntentAsync(PaymentIntentRequest request, int userId);
    Task<ConfirmPaymentResponse> ConfirmPaymentAsync(ConfirmPaymentRequest request, int userId);
    Task<(decimal amount, string methodType)> GetIntentDetailsAsync(string intentId);
    Task<bool> ValidateIntentAsync(string intentId, int userId);
}

public class PaymentGatewayService : IPaymentGatewayService
{
    private readonly Dictionary<string, PaymentIntentData> _activeIntents = new();

    public PaymentGatewayService()
    {
        // Cleanup old intents periodically
        _ = Task.Run(async () =>
        {
            while (true)
            {
                await Task.Delay(TimeSpan.FromMinutes(5));
                CleanupExpiredIntents();
            }
        });
    }

    public Task<PaymentIntentResponse> CreatePaymentIntentAsync(PaymentIntentRequest request, int userId)
    {
        // Generate unique intent ID
        var intentId = $"pi_{DateTime.UtcNow.Ticks}_{userId}_{Guid.NewGuid().ToString("N")[..8]}";
        
        // Generate client secret
        var clientSecret = $"pi_secret_{Guid.NewGuid()}";

        // Determine checkout URL based on payment method
        string? checkoutUrl = null;
        Dictionary<string, object>? paymentData = null;

        switch (request.Method.ToLower())
        {
            case "stripe":
                checkoutUrl = $"http://localhost:5173/payment/checkout?intent={intentId}&method=stripe";
                paymentData = new Dictionary<string, object>
                {
                    ["publicKey"] = "pk_test_51MockKey123456789",
                    ["clientSecret"] = clientSecret
                };
                break;
            
            case "paypal":
                checkoutUrl = $"http://localhost:5173/payment/checkout?intent={intentId}&method=paypal";
                paymentData = new Dictionary<string, object>
                {
                    ["orderId"] = Guid.NewGuid().ToString()
                };
                break;
            
            case "momo":
                checkoutUrl = $"http://localhost:8080/payment/momo?intent={intentId}&amount={request.Amount}";
                paymentData = new Dictionary<string, object>
                {
                    ["paymentUrl"] = GenerateMoMoUrl(request.Amount),
                    ["sandboxUrl"] = $"http://localhost:8080/payment/momo/sandbox?intent={intentId}&amount={request.Amount}"
                };
                break;
            
            case "vnpay":
                checkoutUrl = $"http://localhost:5173/payment/checkout?intent={intentId}&method=vnpay";
                paymentData = new Dictionary<string, object>
                {
                    ["paymentUrl"] = $"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?Amount={((long)(request.Amount * 100))}&OrderId={intentId.Replace("pi_", "ORD_")}"
                };
                break;
            
            case "bank_transfer":
                // Generate VNPay sandbox URL
                checkoutUrl = GenerateVnPaySandboxUrl(request.Amount, intentId);
                paymentData = new Dictionary<string, object>
                {
                    ["bankName"] = "MB Bank",
                    ["accountNumber"] = "2004777719",
                    ["accountName"] = "LUU VU HUNG",
                    ["qrCodeUrl"] = GenerateBankQR(request.Amount, intentId),
                    ["sandboxOrderId"] = intentId.Replace("pi_", "ORD_"),
                    ["amount"] = request.Amount,
                    ["currency"] = "VND"
                };
                break;
            
            default:
                checkoutUrl = $"http://localhost:5173/payment/checkout?intent={intentId}&method=default";
                break;
        }

        var intentData = new PaymentIntentData
        {
            IntentId = intentId,
            ClientSecret = clientSecret,
            UserId = userId,
            Amount = request.Amount,
            Currency = request.Currency,
            Method = request.Method,
            Status = "pending",
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            Metadata = request.Metadata ?? new Dictionary<string, string>()
        };

        _activeIntents[intentId] = intentData;

        var response = new PaymentIntentResponse
        {
            IntentId = intentId,
            ClientSecret = clientSecret,
            Status = "pending",
            CheckoutUrl = checkoutUrl,
            PaymentData = paymentData
        };

        return Task.FromResult(response);
    }

    public async Task<ConfirmPaymentResponse> ConfirmPaymentAsync(ConfirmPaymentRequest request, int userId)
    {
        Console.WriteLine($"[ConfirmPaymentAsync] IntentId: {request.IntentId}, UserId: {userId}");
        
        // Validate intent exists
        if (!_activeIntents.TryGetValue(request.IntentId, out var intent))
        {
            Console.WriteLine($"[ConfirmPaymentAsync] Intent not found in active intents. Total active intents: {_activeIntents.Count}");
            
            // SANDBOX MODE: Allow confirmation without checking intent storage
            // (Useful for testing when backend restarts and loses in-memory data)
            Console.WriteLine("[ConfirmPaymentAsync] SANDBOX MODE: Allowing payment confirmation without intent validation");
            
            // Generate transaction ID
            var sandboxTransactionId = $"TXN_{DateTime.UtcNow.Ticks}_{userId}";
            
            return new ConfirmPaymentResponse
            {
                Success = true,
                Message = "Payment confirmed successfully (SANDBOX MODE)",
                TransactionId = sandboxTransactionId,
                NewBalance = null // Will be updated by wallet deposit endpoint
            };
        }

        Console.WriteLine($"[ConfirmPaymentAsync] Found intent: Status={intent.Status}, UserId={intent.UserId}, Amount={intent.Amount}");

        // Validate user
        if (intent.UserId != userId)
        {
            return new ConfirmPaymentResponse
            {
                Success = false,
                Message = "Unauthorized"
            };
        }

        // Validate intent status
        if (intent.Status != "pending")
        {
            return new ConfirmPaymentResponse
            {
                Success = false,
                Message = $"Payment intent is already {intent.Status}"
            };
        }

        // Check if expired
        if (DateTime.UtcNow > intent.ExpiresAt)
        {
            return new ConfirmPaymentResponse
            {
                Success = false,
                Message = "Payment intent has expired"
            };
        }

        // Simulate payment processing
        // In production, this would call the actual payment gateway
        await Task.Delay(1500); // Simulate network delay

        // Mark as completed
        intent.Status = "completed";
        intent.CompletedAt = DateTime.UtcNow;

        // Generate transaction ID
        var transactionId = $"TXN_{DateTime.UtcNow.Ticks}_{userId}";

        return new ConfirmPaymentResponse
        {
            Success = true,
            Message = "Payment confirmed successfully",
            TransactionId = transactionId,
            NewBalance = null // Will be updated by wallet deposit endpoint
        };
    }

    private void CleanupExpiredIntents()
    {
        var now = DateTime.UtcNow;
        var expiredKeys = _activeIntents
            .Where(kvp => now > kvp.Value.ExpiresAt.AddMinutes(60))
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var key in expiredKeys)
        {
            _activeIntents.Remove(key);
        }
    }

    private string GenerateMoMoUrl(decimal amount)
    {
        var orderId = Guid.NewGuid().ToString();
        var amountStr = ((long)(amount * 100)).ToString();
        // Local MoMo Sandbox Payment URL
        return $"http://localhost:8080/payment/momo/sandbox?amount={amountStr}&orderId={orderId}";
    }

    private string GenerateVnPaySandboxUrl(decimal amount, string intentId)
    {
        // VNPay Sandbox mock endpoint
        return $"http://localhost:5000/api/payment/vnpay/sandbox?amount={(long)amount}&orderId={intentId.Replace("pi_", "ORD_")}";
    }

    private string GenerateBankQR(decimal amount, string intentId)
    {
        var transferContent = $"EV {intentId.Replace("pi_", "").Substring(0, 15)}";
        var bankCode = "970422"; // MB Bank
        var accountNumber = "2004777719";
        return $"https://img.vietqr.io/image/{bankCode}-{accountNumber}-compact2.jpg?amount={(long)amount}&addInfo={Uri.EscapeDataString(transferContent)}";
    }

    // Store payment intent amount for confirmation
    public async Task<(decimal amount, string methodType)> GetIntentDetailsAsync(string intentId)
    {
        if (_activeIntents.TryGetValue(intentId, out var intent))
        {
            return (intent.Amount, intent.Method);
        }
        return (0, "");
    }

    public async Task<bool> ValidateIntentAsync(string intentId, int userId)
    {
        if (!_activeIntents.TryGetValue(intentId, out var intent))
        {
            return false;
        }
        
        return intent.UserId == userId && intent.Status == "pending" && DateTime.UtcNow <= intent.ExpiresAt;
    }

    private class PaymentIntentData
    {
        public string IntentId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "VND";
        public string Method { get; set; } = string.Empty;
        public string Status { get; set; } = "pending";
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public Dictionary<string, string> Metadata { get; set; } = new();
    }
}

