using System.Data;
using Microsoft.Data.SqlClient;

namespace EVRentalApi.Infrastructure.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly string _connectionString;

        public CustomerRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("EVRentalDB") 
                ?? throw new ArgumentNullException(nameof(configuration));
        }

        public async Task<IEnumerable<dynamic>> GetAllCustomersAsync()
        {
            var customers = new List<dynamic>();
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            // Get all customers (users with role 'customer')
            var query = @"
                SELECT 
                    u.user_id,
                    u.email,
                    u.full_name,
                    u.phone,
                    u.is_active,
                    u.created_at,
                    u.updated_at,
                    u.wallet_balance,
                    -- Count total reservations
                    (SELECT COUNT(*) 
                     FROM reservations r 
                     WHERE r.user_id = u.user_id 
                     AND r.status NOT IN ('cancelled')) as total_reservations,
                    -- Count total rentals
                    (SELECT COUNT(*) 
                     FROM rentals rt 
                     WHERE rt.user_id = u.user_id 
                     AND rt.status IN ('completed', 'active')) as total_rentals,
                    -- Calculate total spent from payments (only payment type, excluding deposits)
                    -- Include payments with user_id OR payments linked via reservations
                    -- Also include payments with NULL transaction_type (old payments) that have reservation_id
                    (SELECT ISNULL(SUM(p.amount), 0) 
                     FROM payments p
                     LEFT JOIN reservations r ON p.reservation_id = r.reservation_id
                     WHERE (p.user_id = u.user_id OR r.user_id = u.user_id)
                     AND p.status = 'success'
                     AND (p.transaction_type = 'payment' OR (p.transaction_type IS NULL AND p.reservation_id IS NOT NULL))) as total_spent,
                    -- Count cancelled reservations for risk calculation
                    (SELECT COUNT(*) 
                     FROM reservations r 
                     WHERE r.user_id = u.user_id 
                     AND r.status = 'cancelled') as cancelled_count,
                    -- Count late returns (simplified - rentals that ended after scheduled end time)
                    (SELECT COUNT(*) 
                     FROM rentals rt 
                     INNER JOIN reservations r ON rt.reservation_id = r.reservation_id
                     WHERE rt.user_id = u.user_id 
                     AND rt.end_time IS NOT NULL
                     AND rt.end_time > r.end_time) as late_returns_count,
                    -- Count damages/incidents (handovers with damages reported)
                    (SELECT COUNT(*) 
                     FROM handovers h
                     INNER JOIN rentals rt ON h.rental_id = rt.rental_id
                     WHERE rt.user_id = u.user_id 
                     AND h.[type] = 'return'
                     AND h.damages IS NOT NULL
                     AND LTRIM(RTRIM(h.damages)) != '') as damages_count
                FROM users u
                INNER JOIN roles r ON u.role_id = r.role_id
                WHERE r.role_name = 'customer'
                ORDER BY u.created_at DESC";
            
            using var command = new SqlCommand(query, connection);
            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                customers.Add(CreateCustomerObject(reader));
            }
            
            return customers;
        }

        public async Task<dynamic?> GetCustomerByIdAsync(int userId)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"
                SELECT 
                    u.user_id,
                    u.email,
                    u.full_name,
                    u.phone,
                    u.cccd,
                    u.license_number,
                    u.address,
                    u.gender,
                    u.date_of_birth,
                    u.is_active,
                    u.created_at,
                    u.updated_at,
                    u.wallet_balance
                FROM users u
                WHERE u.user_id = @UserId";
            
            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@UserId", userId);
            
            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                return new
                {
                    user_id = reader.GetInt32("user_id"),
                    email = reader.GetString("email"),
                    full_name = reader.GetString("full_name"),
                    phone = reader.GetString("phone"),
                    cccd = reader.IsDBNull("cccd") ? null : reader.GetString("cccd"),
                    license_number = reader.IsDBNull("license_number") ? null : reader.GetString("license_number"),
                    address = reader.IsDBNull("address") ? null : reader.GetString("address"),
                    gender = reader.IsDBNull("gender") ? null : reader.GetString("gender"),
                    date_of_birth = reader.IsDBNull("date_of_birth") ? null : reader.GetDateTime("date_of_birth").ToString("yyyy-MM-dd"),
                    is_active = reader.IsDBNull("is_active") ? true : reader.GetBoolean("is_active"),
                    created_at = reader.GetDateTime("created_at"),
                    updated_at = reader.GetDateTime("updated_at"),
                    wallet_balance = reader.IsDBNull("wallet_balance") ? 0 : reader.GetDecimal("wallet_balance")
                };
            }
            
            return null;
        }

        public async Task<dynamic?> GetCustomerStatsAsync(int userId)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            var query = @"
                SELECT 
                    -- Total reservations
                    (SELECT COUNT(*) 
                     FROM reservations r 
                     WHERE r.user_id = @UserId 
                     AND r.status NOT IN ('cancelled')) as total_reservations,
                    -- Total rentals
                    (SELECT COUNT(*) 
                     FROM rentals rt 
                     WHERE rt.user_id = @UserId 
                     AND rt.status IN ('completed', 'active')) as total_rentals,
                    -- Total spent (only payment type, excluding deposits)
                    -- Include payments with user_id OR payments linked via reservations
                    -- Also include payments with NULL transaction_type (old payments) that have reservation_id
                    (SELECT ISNULL(SUM(p.amount), 0) 
                     FROM payments p
                     LEFT JOIN reservations r ON p.reservation_id = r.reservation_id
                     WHERE (p.user_id = @UserId OR r.user_id = @UserId)
                     AND p.status = 'success'
                     AND (p.transaction_type = 'payment' OR (p.transaction_type IS NULL AND p.reservation_id IS NOT NULL))) as total_spent,
                    -- Cancelled count
                    (SELECT COUNT(*) 
                     FROM reservations r 
                     WHERE r.user_id = @UserId 
                     AND r.status = 'cancelled') as cancelled_count,
                    -- Late returns (simplified)
                    (SELECT COUNT(*) 
                     FROM rentals rt 
                     INNER JOIN reservations r ON rt.reservation_id = r.reservation_id
                     WHERE rt.user_id = @UserId 
                     AND rt.end_time IS NOT NULL
                     AND rt.end_time > r.end_time) as late_returns_count,
                    -- Count damages/incidents (handovers with damages reported)
                    (SELECT COUNT(*) 
                     FROM handovers h
                     INNER JOIN rentals rt ON h.rental_id = rt.rental_id
                     WHERE rt.user_id = @UserId 
                     AND h.[type] = 'return'
                     AND h.damages IS NOT NULL
                     AND LTRIM(RTRIM(h.damages)) != '') as damages_count";
            
            using var command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@UserId", userId);
            
            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                return new
                {
                    total_reservations = reader.GetInt32("total_reservations"),
                    total_rentals = reader.GetInt32("total_rentals"),
                    total_spent = reader.GetDecimal("total_spent"),
                    cancelled_count = reader.GetInt32("cancelled_count"),
                    late_returns_count = reader.GetInt32("late_returns_count"),
                    damages_count = reader.GetInt32("damages_count")
                };
            }
            
            return null;
        }

        private static dynamic CreateCustomerObject(SqlDataReader reader)
        {
            var totalReservations = reader.GetInt32("total_reservations");
            var totalRentals = reader.GetInt32("total_rentals");
            var totalSpent = reader.GetDecimal("total_spent");
            var cancelledCount = reader.GetInt32("cancelled_count");
            var lateReturnsCount = reader.GetInt32("late_returns_count");
            var damagesCount = reader.GetInt32("damages_count");
            
            // Calculate risk level based on cancellation rate, late returns, and damages
            // High Risk: >30% cancellation rate OR >2 late returns OR >=2 damages
            // Medium Risk: >15% cancellation rate OR >=1 late return OR >=1 damage
            // Low Risk: Default for all other cases
            string riskLevel = "low";
            
            if (totalReservations > 0)
            {
                double cancellationRate = (double)cancelledCount / totalReservations;
                if (cancellationRate > 0.3 || lateReturnsCount > 2 || damagesCount >= 2)
                {
                    riskLevel = "high";
                }
                else if (cancellationRate > 0.15 || lateReturnsCount > 0 || damagesCount >= 1)
                {
                    riskLevel = "medium";
                }
            }
            else
            {
                // New customers with no reservations are considered low risk
                // But if they already have damages, they should be medium risk
                if (damagesCount >= 1)
                {
                    riskLevel = "medium";
                }
                else
                {
                    riskLevel = "low";
                }
            }
            
            // Determine status
            string status = reader.IsDBNull("is_active") || reader.GetBoolean("is_active") ? "active" : "suspended";
            
            return new
            {
                id = $"CU{reader.GetInt32("user_id").ToString("D3")}",
                user_id = reader.GetInt32("user_id"),
                name = reader.GetString("full_name"),
                email = reader.GetString("email"),
                phone = reader.IsDBNull("phone") ? "" : reader.GetString("phone"),
                rentals = totalRentals,
                spent = (double)totalSpent,
                risk = riskLevel,
                status = status,
                wallet_balance = reader.IsDBNull("wallet_balance") ? 0 : (double)reader.GetDecimal("wallet_balance"),
                created_at = reader.GetDateTime("created_at"),
                total_reservations = totalReservations,
                cancelled_count = cancelledCount,
                late_returns_count = lateReturnsCount,
                damages_count = damagesCount
            };
        }

        public async Task<bool> UpdateCustomerAsync(int userId, UpdateCustomerRequest request)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var updates = new List<string>();
            var parameters = new List<SqlParameter>();

            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                updates.Add("full_name = @FullName");
                parameters.Add(new SqlParameter("@FullName", request.FullName));
            }

            if (!string.IsNullOrWhiteSpace(request.Phone))
            {
                updates.Add("phone = @Phone");
                parameters.Add(new SqlParameter("@Phone", request.Phone));
            }

            if (request.Address != null)
            {
                updates.Add("address = @Address");
                parameters.Add(new SqlParameter("@Address", request.Address ?? (object)DBNull.Value));
            }

            if (request.IsActive.HasValue)
            {
                updates.Add("is_active = @IsActive");
                parameters.Add(new SqlParameter("@IsActive", request.IsActive.Value));
            }

            if (updates.Count == 0)
            {
                return false; // No updates to perform
            }

            updates.Add("updated_at = GETDATE()");
            parameters.Add(new SqlParameter("@UserId", userId));

            var query = $@"
                UPDATE users 
                SET {string.Join(", ", updates)}
                WHERE user_id = @UserId";

            using var command = new SqlCommand(query, connection);
            command.Parameters.AddRange(parameters.ToArray());

            var rowsAffected = await command.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }
    }
}

