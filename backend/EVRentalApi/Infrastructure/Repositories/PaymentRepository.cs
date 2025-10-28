using Microsoft.Data.SqlClient;
using System.Data;
using EVRentalApi.Models;
using Microsoft.Extensions.Configuration;

namespace EVRentalApi.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly string _connectionString;

        public PaymentRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("EVRentalDB") 
                ?? throw new InvalidOperationException("EVRentalDB connection string not found");
        }

    public async Task<PaymentResponse?> CreatePaymentAsync(CreatePaymentRequest request)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Validate that either reservation_id or rental_id is provided, but not both
            if ((request.ReservationId.HasValue && request.RentalId.HasValue) || 
                (!request.ReservationId.HasValue && !request.RentalId.HasValue))
            {
                return new PaymentResponse
                {
                    Success = false,
                    Message = "Either reservation_id or rental_id must be provided, but not both"
                };
            }

            // Create payment
            var insertSql = @"
                INSERT INTO payments (
                    reservation_id, rental_id, method_type, amount, status, 
                    transaction_id, is_deposit, created_at, updated_at
                )
                OUTPUT INSERTED.payment_id, INSERTED.reservation_id, INSERTED.rental_id, 
                       INSERTED.method_type, INSERTED.amount, INSERTED.status, 
                       INSERTED.transaction_id, INSERTED.is_deposit, 
                       INSERTED.created_at, INSERTED.updated_at
                VALUES (
                    @ReservationId, @RentalId, @MethodType, @Amount, @Status, 
                    @TransactionId, @IsDeposit, GETDATE(), GETDATE()
                )";

            using var command = new SqlCommand(insertSql, connection);
            command.Parameters.AddWithValue("@ReservationId", request.ReservationId ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@RentalId", request.RentalId ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@MethodType", request.MethodType);
            command.Parameters.AddWithValue("@Amount", request.Amount);
            command.Parameters.AddWithValue("@Status", request.Status);
            command.Parameters.AddWithValue("@TransactionId", request.TransactionId ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@IsDeposit", request.IsDeposit);

            // Log the payment being inserted
            Console.WriteLine($"[Payment] Creating payment for reservation_id: {request.ReservationId}, amount: {request.Amount}, method: {request.MethodType}");

            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                var payment = new PaymentDto
                {
                    PaymentId = reader.GetInt32("payment_id"),
                    ReservationId = reader.IsDBNull("reservation_id") ? null : reader.GetInt32("reservation_id"),
                    RentalId = reader.IsDBNull("rental_id") ? null : reader.GetInt32("rental_id"),
                    MethodType = reader.GetString("method_type"),
                    Amount = reader.GetDecimal("amount"),
                    Status = reader.GetString("status"),
                    TransactionId = reader.IsDBNull("transaction_id") ? null : reader.GetString("transaction_id"),
                    IsDeposit = reader.GetBoolean("is_deposit"),
                    CreatedAt = reader.GetDateTime("created_at"),
                    UpdatedAt = reader.GetDateTime("updated_at")
                };

                Console.WriteLine($"[Payment] Successfully created payment with ID: {payment.PaymentId}");

                return new PaymentResponse
                {
                    Success = true,
                    Message = $"Payment created successfully. Payment ID: {payment.PaymentId}",
                    Payment = payment
                };
            }

            return new PaymentResponse
            {
                Success = false,
                Message = "Failed to create payment"
            };
        }
        catch (Exception ex)
        {
            return new PaymentResponse
            {
                Success = false,
                Message = $"Error creating payment: {ex.Message}"
            };
        }
    }

    public async Task<IEnumerable<PaymentDto>> GetPaymentsByReservationIdAsync(int reservationId)
    {
        var payments = new List<PaymentDto>();

        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                SELECT payment_id, reservation_id, rental_id, method_type, amount, status, 
                       transaction_id, is_deposit, created_at, updated_at
                FROM payments
                WHERE reservation_id = @ReservationId
                ORDER BY created_at DESC";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@ReservationId", reservationId);

            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                payments.Add(new PaymentDto
                {
                    PaymentId = reader.GetInt32("payment_id"),
                    ReservationId = reader.IsDBNull("reservation_id") ? null : reader.GetInt32("reservation_id"),
                    RentalId = reader.IsDBNull("rental_id") ? null : reader.GetInt32("rental_id"),
                    MethodType = reader.GetString("method_type"),
                    Amount = reader.GetDecimal("amount"),
                    Status = reader.GetString("status"),
                    TransactionId = reader.IsDBNull("transaction_id") ? null : reader.GetString("transaction_id"),
                    IsDeposit = reader.GetBoolean("is_deposit"),
                    CreatedAt = reader.GetDateTime("created_at"),
                    UpdatedAt = reader.GetDateTime("updated_at")
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting payments: {ex.Message}");
        }

        return payments;
    }

    public async Task<IEnumerable<PaymentDto>> GetPaymentsByUserIdAsync(int userId)
    {
        var payments = new List<PaymentDto>();

        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                SELECT p.payment_id, p.reservation_id, p.rental_id, p.method_type, p.amount, p.status, 
                       p.transaction_id, p.is_deposit, p.created_at, p.updated_at
                FROM payments p
                LEFT JOIN reservations r ON p.reservation_id = r.reservation_id
                LEFT JOIN rentals l ON p.rental_id = l.rental_id
                WHERE r.user_id = @UserId OR l.user_id = @UserId
                ORDER BY p.created_at DESC";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@UserId", userId);

            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                payments.Add(new PaymentDto
                {
                    PaymentId = reader.GetInt32("payment_id"),
                    ReservationId = reader.IsDBNull("reservation_id") ? null : reader.GetInt32("reservation_id"),
                    RentalId = reader.IsDBNull("rental_id") ? null : reader.GetInt32("rental_id"),
                    MethodType = reader.GetString("method_type"),
                    Amount = reader.GetDecimal("amount"),
                    Status = reader.GetString("status"),
                    TransactionId = reader.IsDBNull("transaction_id") ? null : reader.GetString("transaction_id"),
                    IsDeposit = reader.GetBoolean("is_deposit"),
                    CreatedAt = reader.GetDateTime("created_at"),
                    UpdatedAt = reader.GetDateTime("updated_at")
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting payments: {ex.Message}");
        }

        return payments;
    }

    public async Task<PaymentDto?> GetPaymentByIdAsync(int paymentId)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                SELECT payment_id, reservation_id, rental_id, method_type, amount, status, 
                       transaction_id, is_deposit, created_at, updated_at
                FROM payments
                WHERE payment_id = @PaymentId";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@PaymentId", paymentId);

            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                return new PaymentDto
                {
                    PaymentId = reader.GetInt32("payment_id"),
                    ReservationId = reader.IsDBNull("reservation_id") ? null : reader.GetInt32("reservation_id"),
                    RentalId = reader.IsDBNull("rental_id") ? null : reader.GetInt32("rental_id"),
                    MethodType = reader.GetString("method_type"),
                    Amount = reader.GetDecimal("amount"),
                    Status = reader.GetString("status"),
                    TransactionId = reader.IsDBNull("transaction_id") ? null : reader.GetString("transaction_id"),
                    IsDeposit = reader.GetBoolean("is_deposit"),
                    CreatedAt = reader.GetDateTime("created_at"),
                    UpdatedAt = reader.GetDateTime("updated_at")
                };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting payment: {ex.Message}");
        }

        return null;
    }
}

