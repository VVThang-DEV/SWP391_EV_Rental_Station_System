using System.Text.Json;

namespace EVRentalApi.Models
{
	public class Handover
	{
		public int HandoverId { get; set; }
		public int? RentalId { get; set; }
		public int StaffId { get; set; }
		public string Type { get; set; } = "return"; // pickup | return
		public string? ConditionNotes { get; set; }
		public string? ImageUrls { get; set; } // JSON string array
		public DateTime CreatedAt { get; set; }
		public int? ReservationId { get; set; }
		public string? ReturnTimeStatus { get; set; } // on_time | late | early
		public int? LateHours { get; set; }
		public int? BatteryLevel { get; set; }
		public int? Mileage { get; set; }
		public string? ExteriorCondition { get; set; }
		public string? InteriorCondition { get; set; }
		public string? TiresCondition { get; set; }
		public string? Damages { get; set; } // JSON string array or description
		public decimal? LateFee { get; set; }
		public decimal? DamageFee { get; set; }
		public decimal? TotalDue { get; set; }
		public decimal? DepositRefund { get; set; }
	}

	public class CreateHandoverRequest
	{
		public int? RentalId { get; set; }
		public int? ReservationId { get; set; }
		public string Type { get; set; } = "return";
		public string? ConditionNotes { get; set; }
		public List<string>? ImageUrlList { get; set; }
		public string? ReturnTimeStatus { get; set; }
		public int? LateHours { get; set; }
		public int? BatteryLevel { get; set; }
		public int? Mileage { get; set; }
		public string? ExteriorCondition { get; set; }
		public string? InteriorCondition { get; set; }
		public string? TiresCondition { get; set; }
		public List<string>? DamagesList { get; set; }
		public decimal? LateFee { get; set; }
		public decimal? DamageFee { get; set; }
		public decimal? TotalDue { get; set; }
		public decimal? DepositRefund { get; set; }
	}

	public static class HandoverMapper
	{
		public static Handover ToEntity(CreateHandoverRequest req, int staffId)
		{
			return new Handover
			{
				RentalId = req.RentalId,
				StaffId = staffId,
				Type = req.Type,
				ConditionNotes = req.ConditionNotes,
				ImageUrls = req.ImageUrlList is null ? null : JsonSerializer.Serialize(req.ImageUrlList),
				CreatedAt = DateTime.UtcNow,
				ReservationId = req.ReservationId,
				ReturnTimeStatus = req.ReturnTimeStatus,
				LateHours = req.LateHours,
				BatteryLevel = req.BatteryLevel,
				Mileage = req.Mileage,
				ExteriorCondition = req.ExteriorCondition,
				InteriorCondition = req.InteriorCondition,
				TiresCondition = req.TiresCondition,
				Damages = req.DamagesList is null ? null : JsonSerializer.Serialize(req.DamagesList),
				LateFee = req.LateFee,
				DamageFee = req.DamageFee,
				TotalDue = req.TotalDue,
				DepositRefund = req.DepositRefund
			};
		}
	}

	public class HandoverSummary
	{
		public int HandoverId { get; set; }
		public int? ReservationId { get; set; }
		public int? RentalId { get; set; }
		public string Type { get; set; } = "";
		public DateTime CreatedAt { get; set; }
		public string? ReturnTimeStatus { get; set; }
		public int? LateHours { get; set; }
		public int? BatteryLevel { get; set; }
		public int? Mileage { get; set; }
		public decimal? LateFee { get; set; }
		public decimal? DamageFee { get; set; }
		public decimal? TotalDue { get; set; }
		public IEnumerable<string>? Damages { get; set; }
		public string VehicleLabel { get; set; } = "";
		public decimal WalletPaidAmount { get; set; }
		public decimal RemainingDue { get; set; }
	}

	public class HandoverPaymentRecord
	{
		public int PaymentId { get; set; }
		public string MethodType { get; set; } = "";
		public decimal Amount { get; set; }
		public string Status { get; set; } = "";
		public string TransactionType { get; set; } = "";
		public DateTime CreatedAt { get; set; }
	}

	public class HandoverDetail : HandoverSummary
	{
		public string? ConditionNotes { get; set; }
		public IEnumerable<string>? ImageUrls { get; set; }
		public IEnumerable<HandoverPaymentRecord> Payments { get; set; } = Array.Empty<HandoverPaymentRecord>();
	}
}


