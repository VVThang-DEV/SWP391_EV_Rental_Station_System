using EVRentalApi.Infrastructure.Repositories;
using EVRentalApi.Models;

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

		public HandoverService(IHandoverRepository repo)
		{
			_repo = repo;
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
			return (id > 0, id, id > 0 ? "Tạo biên bản bàn giao thành công" : "Tạo biên bản bàn giao thất bại");
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


