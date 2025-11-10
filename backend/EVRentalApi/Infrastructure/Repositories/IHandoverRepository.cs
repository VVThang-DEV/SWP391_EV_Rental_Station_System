using EVRentalApi.Models;
using Microsoft.Data.SqlClient;

namespace EVRentalApi.Infrastructure.Repositories
{
	public interface IHandoverRepository
	{
		Task<int> CreateAsync(Handover handover, SqlConnection? externalConnection = null, SqlTransaction? externalTransaction = null);
		Task<Handover?> GetByReservationIdAsync(int reservationId);
		Task<Handover?> GetByRentalIdAsync(int rentalId);
		Task<IEnumerable<HandoverSummary>> GetByUserIdAsync(int userId);
		Task<HandoverDetail?> GetDetailByIdAsync(int handoverId, int userId);
	}
}


