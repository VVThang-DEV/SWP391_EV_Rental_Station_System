using EVRentalApi.Models;
using Microsoft.Data.SqlClient;
using System.Text.Json;

namespace EVRentalApi.Infrastructure.Repositories
{
	public class HandoverRepository : IHandoverRepository
	{
		private readonly Func<SqlConnection> _getConnection;

		public HandoverRepository(Func<SqlConnection> getConnection)
		{
			_getConnection = getConnection;
		}

		public async Task<int> CreateAsync(Handover h, SqlConnection? externalConnection = null, SqlTransaction? externalTransaction = null)
		{
			// If rentalId is missing but reservationId is provided, try to backfill from rentals table
			async Task<int?> TryResolveRentalIdAsync(SqlConnection conn, SqlTransaction? trans, int reservationId)
			{
				// 1) Direct link by reservation_id
				const string findByReservationSql = @"SELECT TOP 1 rental_id FROM dbo.rentals WHERE reservation_id = @reservation_id ORDER BY created_at DESC";
				using (var findCmd = new SqlCommand(findByReservationSql, conn, trans))
				{
					findCmd.Parameters.AddWithValue("@reservation_id", reservationId);
					var obj = await findCmd.ExecuteScalarAsync();
					if (obj != null && obj != DBNull.Value) return (int)obj;
				}

				// 2) Best-effort match by (user_id, vehicle_id) around timespan
				const string getResSql = @"SELECT user_id, vehicle_id, start_time, end_time FROM dbo.reservations WHERE reservation_id = @reservation_id";
				int userId = 0, vehicleId = 0;
				DateTime startTime = DateTime.UtcNow, endTime = DateTime.UtcNow;
				using (var getCmd = new SqlCommand(getResSql, conn, trans))
				{
					getCmd.Parameters.AddWithValue("@reservation_id", reservationId);
					using var r = await getCmd.ExecuteReaderAsync();
					if (await r.ReadAsync())
					{
						userId = r.GetInt32(0);
						vehicleId = r.GetInt32(1);
						startTime = r.GetDateTime(2);
						endTime = r.IsDBNull(3) ? startTime : r.GetDateTime(3);
					}
				}

				// If we have details, try to find recent rental for same user/vehicle
				if (userId != 0 && vehicleId != 0)
				{
					const string findByUserVehicleSql = @"
SELECT TOP 1 rental_id 
FROM dbo.rentals 
WHERE user_id = @user_id 
  AND vehicle_id = @vehicle_id
ORDER BY created_at DESC";
					using var f2 = new SqlCommand(findByUserVehicleSql, conn, trans);
					f2.Parameters.AddWithValue("@user_id", userId);
					f2.Parameters.AddWithValue("@vehicle_id", vehicleId);
					var obj2 = await f2.ExecuteScalarAsync();
					if (obj2 != null && obj2 != DBNull.Value) return (int)obj2;
				}

				return null;
			}

			// If cannot resolve rental, try to create a minimal rental from reservation
			async Task<int?> TryCreateRentalFromReservationAsync(SqlConnection conn, SqlTransaction? trans, int reservationId)
			{
				// Read reservation info
				const string getResSql = @"
SELECT TOP 1 r.user_id, r.vehicle_id, r.station_id, r.start_time, r.end_time
FROM dbo.reservations r
WHERE r.reservation_id = @reservation_id";
				using var getCmd = new SqlCommand(getResSql, conn, trans);
				getCmd.Parameters.AddWithValue("@reservation_id", reservationId);
				using var reader = await getCmd.ExecuteReaderAsync();
				if (!await reader.ReadAsync())
				{
					return null;
				}

				var userId = reader.GetInt32(0);
				var vehicleId = reader.GetInt32(1);
				var pickupStationId = reader.GetInt32(2);
				var startTime = reader.GetDateTime(3);
				DateTime? endTime = reader.IsDBNull(4) ? null : reader.GetDateTime(4);
				await reader.CloseAsync();

				// Create rental with completed status and end_time = GETDATE() if null
				const string insertSql = @"
INSERT INTO dbo.rentals (reservation_id, user_id, vehicle_id, pickup_station_id, return_station_id, start_time, end_time, status, created_at, updated_at)
VALUES (@reservation_id, @user_id, @vehicle_id, @pickup_station_id, NULL, @start_time, ISNULL(@end_time, GETDATE()), 'completed', GETDATE(), GETDATE());
SELECT CAST(SCOPE_IDENTITY() as int);";
				using var insCmd = new SqlCommand(insertSql, conn, trans);
				insCmd.Parameters.AddWithValue("@reservation_id", reservationId);
				insCmd.Parameters.AddWithValue("@user_id", userId);
				insCmd.Parameters.AddWithValue("@vehicle_id", vehicleId);
				insCmd.Parameters.AddWithValue("@pickup_station_id", pickupStationId);
				insCmd.Parameters.AddWithValue("@start_time", startTime);
				insCmd.Parameters.AddWithValue("@end_time", (object?)endTime ?? DBNull.Value);

				var newIdObj = await insCmd.ExecuteScalarAsync();
				if (newIdObj == null || newIdObj == DBNull.Value) return null;
				return (int)newIdObj;
			}

			var sql = @"
INSERT INTO dbo.handovers
	(rental_id, staff_id, [type], condition_notes, image_urls, created_at, reservation_id, return_time_status, late_hours, battery_level, mileage, exterior_condition, interior_condition, tires_condition, damages, late_fee, damage_fee, total_due, deposit_refund)
VALUES
	(@rental_id, @staff_id, @type, @condition_notes, @image_urls, GETDATE(), @reservation_id, @return_time_status, @late_hours, @battery_level, @mileage, @exterior_condition, @interior_condition, @tires_condition, @damages, @late_fee, @damage_fee, @total_due, @deposit_refund);
SELECT CAST(SCOPE_IDENTITY() as int);";

			var shouldDispose = externalConnection is null;
			var conn = externalConnection ?? _getConnection();
			try
			{
				if (conn.State != System.Data.ConnectionState.Open)
				{
					await conn.OpenAsync();
				}

				// Attempt backfill rental_id if missing
				if (!h.RentalId.HasValue && h.ReservationId.HasValue)
				{
					var resolved = await TryResolveRentalIdAsync(conn, externalTransaction, h.ReservationId.Value);
					if (resolved.HasValue) h.RentalId = resolved.Value;

					// If still not found, try to create rental from reservation
					if (!h.RentalId.HasValue)
					{
						var created = await TryCreateRentalFromReservationAsync(conn, externalTransaction, h.ReservationId.Value);
						if (created.HasValue) h.RentalId = created.Value;
					}
				}

				using var cmd = new SqlCommand(sql, conn, externalTransaction);
				cmd.Parameters.AddWithValue("@rental_id", (object?)h.RentalId ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@staff_id", h.StaffId);
				cmd.Parameters.AddWithValue("@type", h.Type);
				cmd.Parameters.AddWithValue("@condition_notes", (object?)h.ConditionNotes ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@image_urls", (object?)h.ImageUrls ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@reservation_id", (object?)h.ReservationId ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@return_time_status", (object?)h.ReturnTimeStatus ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@late_hours", (object?)h.LateHours ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@battery_level", (object?)h.BatteryLevel ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@mileage", (object?)h.Mileage ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@exterior_condition", (object?)h.ExteriorCondition ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@interior_condition", (object?)h.InteriorCondition ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@tires_condition", (object?)h.TiresCondition ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@damages", (object?)h.Damages ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@late_fee", (object?)h.LateFee ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@damage_fee", (object?)h.DamageFee ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@total_due", (object?)h.TotalDue ?? DBNull.Value);
				cmd.Parameters.AddWithValue("@deposit_refund", (object?)h.DepositRefund ?? DBNull.Value);

				var idObj = await cmd.ExecuteScalarAsync();
				return (int)(idObj ?? 0);
			}
			finally
			{
				if (shouldDispose)
				{
					await conn.CloseAsync();
					await conn.DisposeAsync();
				}
			}
		}

		public async Task<Handover?> GetByReservationIdAsync(int reservationId)
		{
			var sql = @"SELECT TOP 1 * FROM dbo.handovers WHERE reservation_id = @reservation_id ORDER BY created_at DESC";
			using var conn = _getConnection();
			await conn.OpenAsync();
			using var cmd = new SqlCommand(sql, conn);
			cmd.Parameters.AddWithValue("@reservation_id", reservationId);
			using var reader = await cmd.ExecuteReaderAsync();
			if (await reader.ReadAsync())
			{
				return Map(reader);
			}
			return null;
		}

		public async Task<Handover?> GetByRentalIdAsync(int rentalId)
		{
			var sql = @"SELECT TOP 1 * FROM dbo.handovers WHERE rental_id = @rental_id ORDER BY created_at DESC";
			using var conn = _getConnection();
			await conn.OpenAsync();
			using var cmd = new SqlCommand(sql, conn);
			cmd.Parameters.AddWithValue("@rental_id", rentalId);
			using var reader = await cmd.ExecuteReaderAsync();
			if (await reader.ReadAsync())
			{
				return Map(reader);
			}
			return null;
		}

		public async Task<IEnumerable<HandoverSummary>> GetByUserIdAsync(int userId)
		{
			var list = new List<HandoverSummary>();
			var sql = @"
SELECT 
    h.handover_id,
    h.rental_id,
    h.reservation_id,
    h.[type],
    h.created_at,
    h.return_time_status,
    h.late_hours,
    h.battery_level,
    h.mileage,
    h.late_fee,
    h.damage_fee,
    h.total_due,
    h.damages,
    r.vehicle_id,
    v.unique_vehicle_id,
    v.license_plate,
    vm.model_name,
    ISNULL(pay.wallet_paid, 0) AS wallet_paid
FROM dbo.handovers h
LEFT JOIN dbo.reservations r ON h.reservation_id = r.reservation_id
LEFT JOIN dbo.vehicles v ON r.vehicle_id = v.vehicle_id
LEFT JOIN dbo.vehicle_models vm ON v.model_id = vm.model_id
LEFT JOIN (
    SELECT 
        reservation_id,
        SUM(CASE 
                WHEN status = 'success' 
                 AND method_type = 'wallet' 
                 AND transaction_type IN ('payment','late_fee','damage_fee') 
                THEN amount 
                ELSE 0 
            END) AS wallet_paid
    FROM dbo.payments
    GROUP BY reservation_id
) pay ON pay.reservation_id = h.reservation_id
WHERE r.user_id = @userId
ORDER BY h.created_at DESC";

			using var conn = _getConnection();
			await conn.OpenAsync();
			using var cmd = new SqlCommand(sql, conn);
			cmd.Parameters.AddWithValue("@userId", userId);
			using var reader = await cmd.ExecuteReaderAsync();
			while (await reader.ReadAsync())
			{
				var damagesJson = reader.IsDBNull(reader.GetOrdinal("damages")) ? null : reader.GetString(reader.GetOrdinal("damages"));
				IEnumerable<string>? damages = null;
				if (!string.IsNullOrWhiteSpace(damagesJson))
				{
					try
					{
						damages = JsonSerializer.Deserialize<IEnumerable<string>>(damagesJson);
					}
					catch
					{
						damages = new[] { damagesJson };
					}
				}

				string vehicleLabel = "";
				if (!reader.IsDBNull(reader.GetOrdinal("model_name")))
				{
					vehicleLabel = reader.GetString(reader.GetOrdinal("model_name"));
				}
				else if (!reader.IsDBNull(reader.GetOrdinal("unique_vehicle_id")))
				{
					vehicleLabel = reader.GetString(reader.GetOrdinal("unique_vehicle_id"));
				}
				else if (!reader.IsDBNull(reader.GetOrdinal("license_plate")))
				{
					vehicleLabel = reader.GetString(reader.GetOrdinal("license_plate"));
				}
				else if (!reader.IsDBNull(reader.GetOrdinal("vehicle_id")))
				{
					vehicleLabel = $"Vehicle #{reader.GetInt32(reader.GetOrdinal("vehicle_id"))}";
				}

				var walletPaid = reader.IsDBNull(reader.GetOrdinal("wallet_paid")) ? 0m : reader.GetDecimal(reader.GetOrdinal("wallet_paid"));
				var totalDue = reader.IsDBNull(reader.GetOrdinal("total_due")) ? 0m : reader.GetDecimal(reader.GetOrdinal("total_due"));
				var remaining = Math.Max(0m, totalDue - walletPaid);

				list.Add(new HandoverSummary
				{
					HandoverId = reader.GetInt32(reader.GetOrdinal("handover_id")),
					RentalId = reader.IsDBNull(reader.GetOrdinal("rental_id")) ? null : reader.GetInt32(reader.GetOrdinal("rental_id")),
					ReservationId = reader.IsDBNull(reader.GetOrdinal("reservation_id")) ? null : reader.GetInt32(reader.GetOrdinal("reservation_id")),
					Type = reader.GetString(reader.GetOrdinal("type")),
					CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at")),
					ReturnTimeStatus = reader.IsDBNull(reader.GetOrdinal("return_time_status")) ? null : reader.GetString(reader.GetOrdinal("return_time_status")),
					LateHours = reader.IsDBNull(reader.GetOrdinal("late_hours")) ? null : reader.GetInt32(reader.GetOrdinal("late_hours")),
					BatteryLevel = reader.IsDBNull(reader.GetOrdinal("battery_level")) ? null : reader.GetInt32(reader.GetOrdinal("battery_level")),
					Mileage = reader.IsDBNull(reader.GetOrdinal("mileage")) ? null : reader.GetInt32(reader.GetOrdinal("mileage")),
					LateFee = reader.IsDBNull(reader.GetOrdinal("late_fee")) ? null : reader.GetDecimal(reader.GetOrdinal("late_fee")),
					DamageFee = reader.IsDBNull(reader.GetOrdinal("damage_fee")) ? null : reader.GetDecimal(reader.GetOrdinal("damage_fee")),
					TotalDue = reader.IsDBNull(reader.GetOrdinal("total_due")) ? null : reader.GetDecimal(reader.GetOrdinal("total_due")),
					Damages = damages,
					VehicleLabel = vehicleLabel,
					WalletPaidAmount = walletPaid,
					RemainingDue = remaining
				});
			}

			return list;
		}

		public async Task<HandoverDetail?> GetDetailByIdAsync(int handoverId, int userId)
		{
			using var conn = _getConnection();
			await conn.OpenAsync();

			const string sql = @"
SELECT 
    h.handover_id,
    h.rental_id,
    h.reservation_id,
    h.staff_id,
    h.[type],
    h.condition_notes,
    h.image_urls,
    h.created_at,
    h.return_time_status,
    h.late_hours,
    h.battery_level,
    h.mileage,
    h.late_fee,
    h.damage_fee,
    h.total_due,
    h.damages,
    r.vehicle_id,
    r.start_time,
    r.end_time,
    r.user_id,
    v.unique_vehicle_id,
    v.license_plate,
    vm.model_name,
    ISNULL(pay.wallet_paid, 0) AS wallet_paid
FROM dbo.handovers h
LEFT JOIN dbo.reservations r ON h.reservation_id = r.reservation_id
LEFT JOIN dbo.vehicles v ON r.vehicle_id = v.vehicle_id
LEFT JOIN dbo.vehicle_models vm ON v.model_id = vm.model_id
LEFT JOIN (
    SELECT 
        reservation_id,
        SUM(CASE 
                WHEN status = 'success' 
                 AND method_type = 'wallet' 
                 AND transaction_type IN ('payment','late_fee','damage_fee') 
                THEN amount 
                ELSE 0 
            END) AS wallet_paid
    FROM dbo.payments
    GROUP BY reservation_id
) pay ON pay.reservation_id = h.reservation_id
WHERE h.handover_id = @handoverId AND r.user_id = @userId";

			using var cmd = new SqlCommand(sql, conn);
			cmd.Parameters.AddWithValue("@handoverId", handoverId);
			cmd.Parameters.AddWithValue("@userId", userId);

			HandoverDetail? detail = null;
			int? reservationId = null;

			using (var reader = await cmd.ExecuteReaderAsync())
			{
				if (await reader.ReadAsync())
				{
					var damagesJson = reader.IsDBNull(reader.GetOrdinal("damages")) ? null : reader.GetString(reader.GetOrdinal("damages"));
					IEnumerable<string>? damages = null;
					if (!string.IsNullOrWhiteSpace(damagesJson))
					{
						try
						{
							damages = JsonSerializer.Deserialize<IEnumerable<string>>(damagesJson);
						}
						catch
						{
							damages = new[] { damagesJson };
						}
					}

					var imagesJson = reader.IsDBNull(reader.GetOrdinal("image_urls")) ? null : reader.GetString(reader.GetOrdinal("image_urls"));
					IEnumerable<string>? imageUrls = null;
					if (!string.IsNullOrWhiteSpace(imagesJson))
					{
						try
						{
							imageUrls = JsonSerializer.Deserialize<IEnumerable<string>>(imagesJson);
						}
						catch
						{
							imageUrls = new[] { imagesJson };
						}
					}

					string vehicleLabel = "";
					if (!reader.IsDBNull(reader.GetOrdinal("model_name")))
					{
						vehicleLabel = reader.GetString(reader.GetOrdinal("model_name"));
					}
					else if (!reader.IsDBNull(reader.GetOrdinal("unique_vehicle_id")))
					{
						vehicleLabel = reader.GetString(reader.GetOrdinal("unique_vehicle_id"));
					}
					else if (!reader.IsDBNull(reader.GetOrdinal("license_plate")))
					{
						vehicleLabel = reader.GetString(reader.GetOrdinal("license_plate"));
					}
					else if (!reader.IsDBNull(reader.GetOrdinal("vehicle_id")))
					{
						vehicleLabel = $"Vehicle #{reader.GetInt32(reader.GetOrdinal("vehicle_id"))}";
					}

					var walletPaid = reader.IsDBNull(reader.GetOrdinal("wallet_paid")) ? 0m : reader.GetDecimal(reader.GetOrdinal("wallet_paid"));
					var totalDue = reader.IsDBNull(reader.GetOrdinal("total_due")) ? 0m : reader.GetDecimal(reader.GetOrdinal("total_due"));
					var remaining = Math.Max(0m, totalDue - walletPaid);

					reservationId = reader.IsDBNull(reader.GetOrdinal("reservation_id")) ? null : reader.GetInt32(reader.GetOrdinal("reservation_id"));

					detail = new HandoverDetail
					{
						HandoverId = reader.GetInt32(reader.GetOrdinal("handover_id")),
						RentalId = reader.IsDBNull(reader.GetOrdinal("rental_id")) ? null : reader.GetInt32(reader.GetOrdinal("rental_id")),
						ReservationId = reservationId,
						Type = reader.GetString(reader.GetOrdinal("type")),
						CreatedAt = reader.GetDateTime(reader.GetOrdinal("created_at")),
						ReturnTimeStatus = reader.IsDBNull(reader.GetOrdinal("return_time_status")) ? null : reader.GetString(reader.GetOrdinal("return_time_status")),
						LateHours = reader.IsDBNull(reader.GetOrdinal("late_hours")) ? null : reader.GetInt32(reader.GetOrdinal("late_hours")),
						BatteryLevel = reader.IsDBNull(reader.GetOrdinal("battery_level")) ? null : reader.GetInt32(reader.GetOrdinal("battery_level")),
						Mileage = reader.IsDBNull(reader.GetOrdinal("mileage")) ? null : reader.GetInt32(reader.GetOrdinal("mileage")),
						LateFee = reader.IsDBNull(reader.GetOrdinal("late_fee")) ? null : reader.GetDecimal(reader.GetOrdinal("late_fee")),
						DamageFee = reader.IsDBNull(reader.GetOrdinal("damage_fee")) ? null : reader.GetDecimal(reader.GetOrdinal("damage_fee")),
						TotalDue = reader.IsDBNull(reader.GetOrdinal("total_due")) ? null : reader.GetDecimal(reader.GetOrdinal("total_due")),
						Damages = damages,
						VehicleLabel = vehicleLabel,
						ConditionNotes = reader.IsDBNull(reader.GetOrdinal("condition_notes")) ? null : reader.GetString(reader.GetOrdinal("condition_notes")),
						ImageUrls = imageUrls,
						WalletPaidAmount = walletPaid,
						RemainingDue = remaining
					};
				}
			}

			if (detail == null)
			{
				return null;
			}

			if (reservationId.HasValue)
			{
				const string paymentsSql = @"
SELECT payment_id, method_type, amount, status, transaction_type, created_at
FROM dbo.payments
WHERE reservation_id = @reservationId
ORDER BY created_at DESC";

				using var payCmd = new SqlCommand(paymentsSql, conn);
				payCmd.Parameters.AddWithValue("@reservationId", reservationId.Value);
				using var payReader = await payCmd.ExecuteReaderAsync();
				var payments = new List<HandoverPaymentRecord>();
				while (await payReader.ReadAsync())
				{
					payments.Add(new HandoverPaymentRecord
					{
						PaymentId = payReader.GetInt32(payReader.GetOrdinal("payment_id")),
						MethodType = payReader.GetString(payReader.GetOrdinal("method_type")),
						Amount = payReader.GetDecimal(payReader.GetOrdinal("amount")),
						Status = payReader.GetString(payReader.GetOrdinal("status")),
						TransactionType = payReader.IsDBNull(payReader.GetOrdinal("transaction_type")) ? "" : payReader.GetString(payReader.GetOrdinal("transaction_type")),
						CreatedAt = payReader.GetDateTime(payReader.GetOrdinal("created_at"))
					});
				}
				detail.Payments = payments;
			}

			return detail;
		}

		private static Handover Map(SqlDataReader r)
		{
			return new Handover
			{
				HandoverId = r.GetInt32(r.GetOrdinal("handover_id")),
				RentalId = r.IsDBNull(r.GetOrdinal("rental_id")) ? null : r.GetInt32(r.GetOrdinal("rental_id")),
				StaffId = r.GetInt32(r.GetOrdinal("staff_id")),
				Type = r.GetString(r.GetOrdinal("type")),
				ConditionNotes = r.IsDBNull(r.GetOrdinal("condition_notes")) ? null : r.GetString(r.GetOrdinal("condition_notes")),
				ImageUrls = r.IsDBNull(r.GetOrdinal("image_urls")) ? null : r.GetString(r.GetOrdinal("image_urls")),
				CreatedAt = r.GetDateTime(r.GetOrdinal("created_at")),
				ReservationId = r.IsDBNull(r.GetOrdinal("reservation_id")) ? null : r.GetInt32(r.GetOrdinal("reservation_id")),
				ReturnTimeStatus = r.IsDBNull(r.GetOrdinal("return_time_status")) ? null : r.GetString(r.GetOrdinal("return_time_status")),
				LateHours = r.IsDBNull(r.GetOrdinal("late_hours")) ? null : r.GetInt32(r.GetOrdinal("late_hours")),
				BatteryLevel = r.IsDBNull(r.GetOrdinal("battery_level")) ? null : r.GetInt32(r.GetOrdinal("battery_level")),
				Mileage = r.IsDBNull(r.GetOrdinal("mileage")) ? null : r.GetInt32(r.GetOrdinal("mileage")),
				ExteriorCondition = r.IsDBNull(r.GetOrdinal("exterior_condition")) ? null : r.GetString(r.GetOrdinal("exterior_condition")),
				InteriorCondition = r.IsDBNull(r.GetOrdinal("interior_condition")) ? null : r.GetString(r.GetOrdinal("interior_condition")),
				TiresCondition = r.IsDBNull(r.GetOrdinal("tires_condition")) ? null : r.GetString(r.GetOrdinal("tires_condition")),
				Damages = r.IsDBNull(r.GetOrdinal("damages")) ? null : r.GetString(r.GetOrdinal("damages")),
				LateFee = r.IsDBNull(r.GetOrdinal("late_fee")) ? null : r.GetDecimal(r.GetOrdinal("late_fee")),
				DamageFee = r.IsDBNull(r.GetOrdinal("damage_fee")) ? null : r.GetDecimal(r.GetOrdinal("damage_fee")),
				TotalDue = r.IsDBNull(r.GetOrdinal("total_due")) ? null : r.GetDecimal(r.GetOrdinal("total_due")),
				DepositRefund = r.IsDBNull(r.GetOrdinal("deposit_refund")) ? null : r.GetDecimal(r.GetOrdinal("deposit_refund"))
			};
		}
	}
}


