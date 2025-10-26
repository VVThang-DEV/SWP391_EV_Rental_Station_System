using Microsoft.Data.SqlClient;
using System.Data;
using EVRentalApi.Models;
using Microsoft.Extensions.Configuration;

namespace EVRentalApi.Infrastructure.Repositories;

public class ReservationRepository : IReservationRepository
{
    private readonly string _connectionString;

        public ReservationRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("EVRentalDB") 
                ?? throw new InvalidOperationException("EVRentalDB connection string not found");
        }

    public async Task<ReservationResponse?> CreateReservationAsync(CreateReservationRequest request)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // ⚠️ BUSINESS RULE: Check if user already has an active/pending reservation
            Console.WriteLine($"[Reservation] ⚠️ Checking if user {request.UserId} already has active bookings...");
            
            // Check for ALL non-completed reservations (case-insensitive)
            var checkExistingSql = @"
                SELECT reservation_id, status 
                FROM reservations 
                WHERE user_id = @UserId 
                AND LOWER(status) NOT IN ('completed', 'cancelled', 'finished')
                ORDER BY created_at DESC";
            
            using var checkExistingCmd = new SqlCommand(checkExistingSql, connection);
            checkExistingCmd.Parameters.AddWithValue("@UserId", request.UserId);
            
            var existingReservations = new List<(int id, string status)>();
            using (var existingReader = await checkExistingCmd.ExecuteReaderAsync())
            {
                while (await existingReader.ReadAsync())
                {
                    var id = existingReader.GetInt32("reservation_id");
                    var status = existingReader.GetString("status");
                    existingReservations.Add((id, status));
                }
            }
            
            Console.WriteLine($"[Reservation] ⚠️ User {request.UserId} has {existingReservations.Count} active/pending reservation(s): {string.Join(", ", existingReservations.Select(r => $"#{r.id} ({r.status})"))}");
            
            if (existingReservations.Count > 0)
            {
                Console.WriteLine($"[Reservation] ❌ BLOCKED: User {request.UserId} already has an active booking");
                return new ReservationResponse
                {
                    Success = false,
                    Message = "You already have an active booking. Please complete or cancel your existing booking before making a new one."
                };
            }
            
            Console.WriteLine($"[Reservation] ✅ User {request.UserId} has no active bookings - allowing new reservation");

            // Check if vehicle is available
            var checkAvailabilitySql = @"
                SELECT status FROM vehicles WHERE vehicle_id = @VehicleId";
            
            using var checkCmd = new SqlCommand(checkAvailabilitySql, connection);
            checkCmd.Parameters.AddWithValue("@VehicleId", request.VehicleId);
            var vehicleStatus = await checkCmd.ExecuteScalarAsync() as string;

            Console.WriteLine($"[Reservation] Vehicle {request.VehicleId} status: {vehicleStatus ?? "NOT FOUND"}");

            if (vehicleStatus == null)
            {
                return new ReservationResponse
                {
                    Success = false,
                    Message = $"Vehicle with ID {request.VehicleId} not found"
                };
            }

            if (vehicleStatus != "available")
            {
                return new ReservationResponse
                {
                    Success = false,
                    Message = $"Vehicle is not available for booking. Current status: {vehicleStatus}"
                };
            }

            // Create reservation - SQL Server will auto-generate reservation_id with IDENTITY
            var insertSql = @"
                INSERT INTO reservations (user_id, vehicle_id, station_id, start_time, end_time, status, created_at)
                OUTPUT INSERTED.reservation_id, INSERTED.user_id, INSERTED.vehicle_id, INSERTED.station_id, 
                       INSERTED.start_time, INSERTED.end_time, INSERTED.status, INSERTED.created_at
                VALUES (@UserId, @VehicleId, @StationId, @StartTime, @EndTime, 'pending', GETDATE())";

            using var command = new SqlCommand(insertSql, connection);
            command.Parameters.AddWithValue("@UserId", request.UserId);
            command.Parameters.AddWithValue("@VehicleId", request.VehicleId);
            command.Parameters.AddWithValue("@StationId", request.StationId);
            
            // Ensure DateTime values are properly formatted for SQL Server
            command.Parameters.AddWithValue("@StartTime", request.StartTime);
            command.Parameters.AddWithValue("@EndTime", request.EndTime);
            
            // Log the values being inserted
            Console.WriteLine($"[Reservation] Inserting reservation with StartTime: {request.StartTime}, EndTime: {request.EndTime}");

            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                var reservation = new ReservationDto
                {
                    ReservationId = reader.GetInt32("reservation_id"),
                    UserId = reader.GetInt32("user_id"),
                    VehicleId = reader.GetInt32("vehicle_id"),
                    StationId = reader.GetInt32("station_id"),
                    StartTime = reader.GetDateTime("start_time"),
                    EndTime = reader.GetDateTime("end_time"),
                    Status = reader.GetString("status"),
                    CreatedAt = reader.GetDateTime("created_at")
                };

                // Log the saved values
                Console.WriteLine($"[Reservation] Successfully saved reservation {reservation.ReservationId} with StartTime: {reservation.StartTime}, EndTime: {reservation.EndTime}");

                // Close reader before updating vehicle status
                reader.Close();

                // Update vehicle status to "pending" after successful reservation
                var updateVehicleStatusSql = @"
                    UPDATE vehicles 
                    SET status = 'pending', updated_at = GETDATE()
                    WHERE vehicle_id = @VehicleId";
                
                using var updateCmd = new SqlCommand(updateVehicleStatusSql, connection);
                updateCmd.Parameters.AddWithValue("@VehicleId", request.VehicleId);
                var rowsAffected = await updateCmd.ExecuteNonQueryAsync();

                if (rowsAffected > 0)
                {
                    Console.WriteLine($"[Reservation] Updated vehicle {request.VehicleId} status to 'pending'");
                }
                else
                {
                    Console.WriteLine($"[Reservation] Warning: Failed to update vehicle {request.VehicleId} status");
                }

                return new ReservationResponse
                {
                    Success = true,
                    Message = $"Reservation created successfully. Reservation ID: {reservation.ReservationId}",
                    Reservation = reservation
                };
            }

            return new ReservationResponse
            {
                Success = false,
                Message = "Failed to create reservation"
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Reservation] Error creating reservation: {ex.Message}");
            Console.WriteLine($"[Reservation] Stack trace: {ex.StackTrace}");
            return new ReservationResponse
            {
                Success = false,
                Message = $"Error creating reservation: {ex.Message}"
            };
        }
    }

    public async Task<IEnumerable<ReservationDto>> GetReservationsByUserIdAsync(int userId)
    {
        var reservations = new List<ReservationDto>();

        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                SELECT reservation_id, user_id, vehicle_id, station_id, start_time, end_time, status, created_at
                FROM reservations
                WHERE user_id = @UserId
                ORDER BY created_at DESC";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@UserId", userId);

            using var reader = await command.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                reservations.Add(new ReservationDto
                {
                    ReservationId = reader.GetInt32("reservation_id"),
                    UserId = reader.GetInt32("user_id"),
                    VehicleId = reader.GetInt32("vehicle_id"),
                    StationId = reader.GetInt32("station_id"),
                    StartTime = reader.GetDateTime("start_time"),
                    EndTime = reader.GetDateTime("end_time"),
                    Status = reader.GetString("status"),
                    CreatedAt = reader.GetDateTime("created_at")
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting reservations: {ex.Message}");
        }

        return reservations;
    }

    public async Task<ReservationDto?> GetReservationByIdAsync(int reservationId)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                SELECT reservation_id, user_id, vehicle_id, station_id, start_time, end_time, status, created_at
                FROM reservations
                WHERE reservation_id = @ReservationId";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@ReservationId", reservationId);

            using var reader = await command.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                return new ReservationDto
                {
                    ReservationId = reader.GetInt32("reservation_id"),
                    UserId = reader.GetInt32("user_id"),
                    VehicleId = reader.GetInt32("vehicle_id"),
                    StationId = reader.GetInt32("station_id"),
                    StartTime = reader.GetDateTime("start_time"),
                    EndTime = reader.GetDateTime("end_time"),
                    Status = reader.GetString("status"),
                    CreatedAt = reader.GetDateTime("created_at")
                };
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting reservation: {ex.Message}");
        }

        return null;
    }

    public async Task<bool> UpdateReservationStatusAsync(int reservationId, string status)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            var sql = @"
                UPDATE reservations
                SET status = @Status
                WHERE reservation_id = @ReservationId";

            using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@ReservationId", reservationId);
            command.Parameters.AddWithValue("@Status", status);

            var rowsAffected = await command.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating reservation status: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> CancelReservationAsync(int reservationId)
    {
        try
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // First, get the vehicle_id from the reservation
            var getVehicleSql = @"
                SELECT vehicle_id FROM reservations WHERE reservation_id = @ReservationId";
            
            using var getVehicleCmd = new SqlCommand(getVehicleSql, connection);
            getVehicleCmd.Parameters.AddWithValue("@ReservationId", reservationId);
            var vehicleIdObj = await getVehicleCmd.ExecuteScalarAsync();

            if (vehicleIdObj == null)
            {
                Console.WriteLine($"[Reservation] Reservation {reservationId} not found");
                return false;
            }

            int vehicleId = (int)vehicleIdObj;

            // Update reservation status to cancelled
            var updateReservationSql = @"
                UPDATE reservations
                SET status = 'cancelled'
                WHERE reservation_id = @ReservationId";

            using var updateReservationCmd = new SqlCommand(updateReservationSql, connection);
            updateReservationCmd.Parameters.AddWithValue("@ReservationId", reservationId);
            var reservationRowsAffected = await updateReservationCmd.ExecuteNonQueryAsync();

            if (reservationRowsAffected > 0)
            {
                Console.WriteLine($"[Reservation] Cancelled reservation {reservationId}");

                // Update vehicle status back to "available"
                var updateVehicleStatusSql = @"
                    UPDATE vehicles 
                    SET status = 'available', updated_at = GETDATE()
                    WHERE vehicle_id = @VehicleId";
                
                using var updateVehicleCmd = new SqlCommand(updateVehicleStatusSql, connection);
                updateVehicleCmd.Parameters.AddWithValue("@VehicleId", vehicleId);
                var vehicleRowsAffected = await updateVehicleCmd.ExecuteNonQueryAsync();

                if (vehicleRowsAffected > 0)
                {
                    Console.WriteLine($"[Reservation] Updated vehicle {vehicleId} status back to 'available'");
                }
                else
                {
                    Console.WriteLine($"[Reservation] Warning: Failed to update vehicle {vehicleId} status");
                }

                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error cancelling reservation: {ex.Message}");
            return false;
        }
    }
}

