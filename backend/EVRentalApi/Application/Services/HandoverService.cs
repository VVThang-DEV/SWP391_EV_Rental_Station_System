using EVRentalApi.Infrastructure.Repositories;
using EVRentalApi.Models;
using Microsoft.Data.SqlClient;

namespace EVRentalApi.Application.Services
{
	public interface IHandoverService
	{
		Task<(bool Success, int HandoverId, string Message)> CreateAsync(CreateHandoverRequest request, int staffId);
		Task<Handover?> GetByReservationAsync(int reservationId);
		Task<IEnumerable<HandoverSummary>> GetUserHandoversAsync(int userId);
		Task<HandoverDetail?> GetDetailAsync(int handoverId, int userId);
	}

	public class HandoverService : IHandoverService
	{
		private readonly IHandoverRepository _repo;
		private readonly IEmailService _emailService;
		private readonly Func<SqlConnection> _getConnection;

		public HandoverService(IHandoverRepository repo, IEmailService emailService, Func<SqlConnection> getConnection)
		{
			_repo = repo;
			_emailService = emailService;
			_getConnection = getConnection;
		}

		public async Task<(bool Success, int HandoverId, string Message)> CreateAsync(CreateHandoverRequest request, int staffId)
		{
			// Allow QC handovers without reservation/rental linkage (used for post-return checks)
			var isQc = string.Equals(request.Type, "qc", StringComparison.OrdinalIgnoreCase);

			if (!isQc && request.ReservationId is null && request.RentalId is null)
			{
				return (false, 0, "ReservationId hoặc RentalId là bắt buộc");
			}

			var entity = HandoverMapper.ToEntity(request, staffId);
			var id = await _repo.CreateAsync(entity);
			
			if (id > 0)
			{
				// If handover has damage fee, create pending payment record and notify customer
				if (request.DamageFee.HasValue && request.DamageFee.Value > 0 && request.ReservationId.HasValue)
				{
					await CreatePendingDamagePaymentAsync(request.ReservationId.Value, request.DamageFee.Value);
					await SendDamagePaymentNotificationAsync(request.ReservationId.Value, request.DamageFee.Value);
				}
				
				// If handover has late fee, create pending payment record and notify customer
				if (request.LateFee.HasValue && request.LateFee.Value > 0 && request.ReservationId.HasValue)
				{
					await CreatePendingLateFeePaymentAsync(request.ReservationId.Value, request.LateFee.Value);
					await SendLateFeePaymentNotificationAsync(request.ReservationId.Value, request.LateFee.Value);
				}
			}
			
			return (id > 0, id, id > 0 ? "Tạo biên bản bàn giao thành công" : "Tạo biên bản bàn giao thất bại");
		}

		private async Task CreatePendingDamagePaymentAsync(int reservationId, decimal damageFee)
		{
			try
			{
				using var conn = _getConnection();
				await conn.OpenAsync();

				// Get user_id from reservation
				var getUserCmd = new SqlCommand("SELECT user_id FROM dbo.reservations WHERE reservation_id = @ReservationId", conn);
				getUserCmd.Parameters.AddWithValue("@ReservationId", reservationId);
				var userIdObj = await getUserCmd.ExecuteScalarAsync();
				
				if (userIdObj == null || userIdObj == DBNull.Value)
				{
					Console.WriteLine($"[HandoverService] Could not find user for reservation {reservationId}");
					return;
				}

				var userId = (int)userIdObj;

				// Check if pending damage_fee payment already exists
				var checkCmd = new SqlCommand(@"
					SELECT COUNT(1) FROM dbo.payments 
					WHERE reservation_id = @ReservationId 
					AND transaction_type = 'damage_fee' 
					AND status = 'pending'", conn);
				checkCmd.Parameters.AddWithValue("@ReservationId", reservationId);
				var exists = (int)await checkCmd.ExecuteScalarAsync() > 0;

				if (!exists)
				{
					// Create pending payment record
					var transactionId = $"DAMAGE_FEE_{reservationId}_{DateTime.Now.Ticks}";
					var insertCmd = new SqlCommand(@"
						INSERT INTO dbo.payments (user_id, reservation_id, method_type, amount, status, transaction_type, transaction_id, created_at, updated_at)
						VALUES (@UserId, @ReservationId, 'wallet', @Amount, 'pending', 'damage_fee', @TransactionId, GETDATE(), GETDATE())", conn);
					insertCmd.Parameters.AddWithValue("@UserId", userId);
					insertCmd.Parameters.AddWithValue("@ReservationId", reservationId);
					insertCmd.Parameters.AddWithValue("@Amount", damageFee);
					insertCmd.Parameters.AddWithValue("@TransactionId", transactionId);
					await insertCmd.ExecuteNonQueryAsync();
					
					Console.WriteLine($"[HandoverService] Created pending damage_fee payment for reservation {reservationId}, amount: {damageFee}");
				}
			}
			catch (Exception ex)
			{
				Console.WriteLine($"[HandoverService] Error creating pending damage payment: {ex.Message}");
			}
		}

		private async Task CreatePendingLateFeePaymentAsync(int reservationId, decimal lateFee)
		{
			try
			{
				using var conn = _getConnection();
				await conn.OpenAsync();

				// Get user_id from reservation
				var getUserCmd = new SqlCommand("SELECT user_id FROM dbo.reservations WHERE reservation_id = @ReservationId", conn);
				getUserCmd.Parameters.AddWithValue("@ReservationId", reservationId);
				var userIdObj = await getUserCmd.ExecuteScalarAsync();
				
				if (userIdObj == null || userIdObj == DBNull.Value)
				{
					Console.WriteLine($"[HandoverService] Could not find user for reservation {reservationId}");
					return;
				}

				var userId = (int)userIdObj;

				// Check if pending late_fee payment already exists
				var checkCmd = new SqlCommand(@"
					SELECT COUNT(1) FROM dbo.payments 
					WHERE reservation_id = @ReservationId 
					AND transaction_type = 'late_fee' 
					AND status = 'pending'", conn);
				checkCmd.Parameters.AddWithValue("@ReservationId", reservationId);
				var exists = (int)await checkCmd.ExecuteScalarAsync() > 0;

				if (!exists)
				{
					// Create pending payment record
					var transactionId = $"LATE_FEE_{reservationId}_{DateTime.Now.Ticks}";
					var insertCmd = new SqlCommand(@"
						INSERT INTO dbo.payments (user_id, reservation_id, method_type, amount, status, transaction_type, transaction_id, created_at, updated_at)
						VALUES (@UserId, @ReservationId, 'wallet', @Amount, 'pending', 'late_fee', @TransactionId, GETDATE(), GETDATE())", conn);
					insertCmd.Parameters.AddWithValue("@UserId", userId);
					insertCmd.Parameters.AddWithValue("@ReservationId", reservationId);
					insertCmd.Parameters.AddWithValue("@Amount", lateFee);
					insertCmd.Parameters.AddWithValue("@TransactionId", transactionId);
					await insertCmd.ExecuteNonQueryAsync();
					
					Console.WriteLine($"[HandoverService] Created pending late_fee payment for reservation {reservationId}, amount: {lateFee}");
				}
			}
			catch (Exception ex)
			{
				Console.WriteLine($"[HandoverService] Error creating pending late fee payment: {ex.Message}");
			}
		}

		private async Task SendDamagePaymentNotificationAsync(int reservationId, decimal damageFee)
		{
			try
			{
				using var conn = _getConnection();
				await conn.OpenAsync();

				// Get customer info
				var getCustomerCmd = new SqlCommand(@"
					SELECT u.email, u.full_name, r.reservation_id
					FROM dbo.reservations r
					INNER JOIN dbo.users u ON r.user_id = u.user_id
					WHERE r.reservation_id = @ReservationId", conn);
				getCustomerCmd.Parameters.AddWithValue("@ReservationId", reservationId);
				
				using var reader = await getCustomerCmd.ExecuteReaderAsync();
				if (!await reader.ReadAsync())
				{
					Console.WriteLine($"[HandoverService] Could not find customer for reservation {reservationId}");
					return;
				}

				var customerEmail = reader.IsDBNull(0) ? null : reader.GetString(0);
				var customerName = reader.IsDBNull(1) ? "Khách hàng" : reader.GetString(1);
				await reader.CloseAsync();

				if (string.IsNullOrEmpty(customerEmail))
				{
					Console.WriteLine($"[HandoverService] Customer email not found for reservation {reservationId}");
					return;
				}

				// Send email notification
				var emailSubject = $"Thông báo: Phí hư hỏng cần thanh toán - Booking #{reservationId}";
				var emailBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .info-box {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #d32f2f; }}
        .amount-box {{ background: #ffebee; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #d32f2f; text-align: center; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
        .highlight {{ color: #d32f2f; font-weight: bold; font-size: 18px; }}
        .button {{ display: inline-block; padding: 12px 24px; background: #d32f2f; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>⚠️ Thông báo phí hư hỏng</h1>
        </div>
        <div class='content'>
            <p>Xin chào <strong>{customerName}</strong>,</p>
            
            <p>Sau khi kiểm tra xe trả về, chúng tôi phát hiện có hư hỏng và cần thu phí sửa chữa.</p>
            
            <div class='info-box'>
                <h3>📋 Thông tin giao dịch</h3>
                <p><strong>Booking ID:</strong> #{reservationId}</p>
                <p><strong>Loại phí:</strong> Phí hư hỏng</p>
            </div>
            
            <div class='amount-box'>
                <p style='margin: 0; color: #666;'>Số tiền cần thanh toán</p>
                <p class='highlight' style='margin: 10px 0;'>{damageFee:N0} VND</p>
            </div>
            
            <div class='info-box'>
                <h3>💳 Hướng dẫn thanh toán</h3>
                <p>Vui lòng thanh toán số tiền trên bằng <strong>EV Wallet</strong> trong ứng dụng của bạn.</p>
                <p>Sau khi thanh toán, hệ thống sẽ tự động cập nhật trạng thái.</p>
            </div>
            
            <p>Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.</p>
            
            <p>Trân trọng,<br>Đội ngũ EVRentals</p>
        </div>
        <div class='footer'>
            <p>Email này được gửi tự động từ hệ thống EVRentals</p>
        </div>
    </div>
</body>
</html>";

				await _emailService.SendAsync(customerEmail, emailSubject, emailBody);
				Console.WriteLine($"[HandoverService] Sent damage payment notification to {customerEmail}");
			}
			catch (Exception ex)
			{
				Console.WriteLine($"[HandoverService] Error sending damage payment notification: {ex.Message}");
			}
		}

		private async Task SendLateFeePaymentNotificationAsync(int reservationId, decimal lateFee)
		{
			try
			{
				using var conn = _getConnection();
				await conn.OpenAsync();

				// Get customer info
				var getCustomerCmd = new SqlCommand(@"
					SELECT u.email, u.full_name, r.reservation_id
					FROM dbo.reservations r
					INNER JOIN dbo.users u ON r.user_id = u.user_id
					WHERE r.reservation_id = @ReservationId", conn);
				getCustomerCmd.Parameters.AddWithValue("@ReservationId", reservationId);
				
				using var reader = await getCustomerCmd.ExecuteReaderAsync();
				if (!await reader.ReadAsync())
				{
					Console.WriteLine($"[HandoverService] Could not find customer for reservation {reservationId}");
					return;
				}

				var customerEmail = reader.IsDBNull(0) ? null : reader.GetString(0);
				var customerName = reader.IsDBNull(1) ? "Khách hàng" : reader.GetString(1);
				await reader.CloseAsync();

				if (string.IsNullOrEmpty(customerEmail))
				{
					Console.WriteLine($"[HandoverService] Customer email not found for reservation {reservationId}");
					return;
				}

				// Send email notification
				var emailSubject = $"Thông báo: Phí trễ giờ cần thanh toán - Booking #{reservationId}";
				var emailBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .info-box {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ff9800; }}
        .amount-box {{ background: #fff3e0; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #ff9800; text-align: center; }}
        .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 12px; }}
        .highlight {{ color: #f57c00; font-weight: bold; font-size: 18px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>⏰ Thông báo phí trễ giờ</h1>
        </div>
        <div class='content'>
            <p>Xin chào <strong>{customerName}</strong>,</p>
            
            <p>Bạn đã trả xe muộn so với thời gian đã đặt, vì vậy cần thanh toán phí trễ giờ.</p>
            
            <div class='info-box'>
                <h3>📋 Thông tin giao dịch</h3>
                <p><strong>Booking ID:</strong> #{reservationId}</p>
                <p><strong>Loại phí:</strong> Phí trễ giờ</p>
            </div>
            
            <div class='amount-box'>
                <p style='margin: 0; color: #666;'>Số tiền cần thanh toán</p>
                <p class='highlight' style='margin: 10px 0;'>{lateFee:N0} VND</p>
            </div>
            
            <div class='info-box'>
                <h3>💳 Hướng dẫn thanh toán</h3>
                <p>Vui lòng thanh toán số tiền trên bằng <strong>EV Wallet</strong> trong ứng dụng của bạn.</p>
                <p>Sau khi thanh toán, hệ thống sẽ tự động cập nhật trạng thái.</p>
            </div>
            
            <p>Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.</p>
            
            <p>Trân trọng,<br>Đội ngũ EVRentals</p>
        </div>
        <div class='footer'>
            <p>Email này được gửi tự động từ hệ thống EVRentals</p>
        </div>
    </div>
</body>
</html>";

				await _emailService.SendAsync(customerEmail, emailSubject, emailBody);
				Console.WriteLine($"[HandoverService] Sent late fee payment notification to {customerEmail}");
			}
			catch (Exception ex)
			{
				Console.WriteLine($"[HandoverService] Error sending late fee payment notification: {ex.Message}");
			}
		}

		public Task<Handover?> GetByReservationAsync(int reservationId)
		{
			return _repo.GetByReservationIdAsync(reservationId);
		}

		public Task<IEnumerable<HandoverSummary>> GetUserHandoversAsync(int userId)
		{
			return _repo.GetByUserIdAsync(userId);
		}

		public Task<HandoverDetail?> GetDetailAsync(int handoverId, int userId)
		{
			return _repo.GetDetailByIdAsync(handoverId, userId);
		}
	}
}


