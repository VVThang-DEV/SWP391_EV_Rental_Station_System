using EVRentalApi.Models;

namespace EVRentalApi.Infrastructure.Repositories;

public interface IIncidentRepository
{
    Task<IncidentDto?> CreateIncidentAsync(CreateIncidentRequest request, int userId);
    Task<IEnumerable<IncidentDto>> GetIncidentsByStationIdAsync(int stationId);
    Task<IEnumerable<IncidentDto>> GetIncidentsByUserIdAsync(int userId);
    Task<IncidentDto?> GetIncidentByIdAsync(int incidentId);
    Task<bool> UpdateIncidentAsync(int incidentId, UpdateIncidentRequest request, int? handledBy = null);
    Task<int> GetUnreadIncidentCountAsync(int stationId);
    Task<IEnumerable<IncidentDto>> GetRecentIncidentsAsync(int? stationId, string? status, int limit);
}

