using EVRentalApi.Infrastructure.Repositories;
using EVRentalApi.Models;

namespace EVRentalApi.Application.Services;

public interface IIncidentService
{
    Task<IncidentResponse> CreateIncidentAsync(CreateIncidentRequest request, int userId);
    Task<IEnumerable<IncidentDto>> GetIncidentsByStationAsync(int stationId);
    Task<IEnumerable<IncidentDto>> GetUserIncidentsAsync(int userId);
    Task<IncidentDto?> GetIncidentByIdAsync(int incidentId);
    Task<IncidentResponse> UpdateIncidentAsync(int incidentId, UpdateIncidentRequest request, int? handledBy = null);
    Task<int> GetUnreadIncidentCountAsync(int stationId);
    Task<IEnumerable<IncidentDto>> GetRecentIncidentsAsync(int? stationId, string? status, int limit);
}

public class IncidentResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public IncidentDto? Incident { get; set; }
}

public class IncidentService : IIncidentService
{
    private readonly IIncidentRepository _incidentRepository;

    public IncidentService(IIncidentRepository incidentRepository)
    {
        _incidentRepository = incidentRepository;
    }

    public async Task<IncidentResponse> CreateIncidentAsync(CreateIncidentRequest request, int userId)
    {
        try
        {
            // Validate request
            if (string.IsNullOrWhiteSpace(request.Type))
            {
                return new IncidentResponse
                {
                    Success = false,
                    Message = "Incident type is required"
                };
            }

            if (string.IsNullOrWhiteSpace(request.Description))
            {
                return new IncidentResponse
                {
                    Success = false,
                    Message = "Incident description is required"
                };
            }

            if (request.VehicleId <= 0)
            {
                return new IncidentResponse
                {
                    Success = false,
                    Message = "Valid vehicle ID is required"
                };
            }

            if (request.StationId <= 0)
            {
                return new IncidentResponse
                {
                    Success = false,
                    Message = "Valid station ID is required"
                };
            }

            // Validate priority
            var validPriorities = new[] { "low", "medium", "high", "urgent" };
            if (!validPriorities.Contains(request.Priority.ToLower()))
            {
                request.Priority = "medium";
            }

            // Validate type
            var validTypes = new[] { "accident", "breakdown", "damage", "theft", "other" };
            if (!validTypes.Contains(request.Type.ToLower()))
            {
                request.Type = "other";
            }

            var incident = await _incidentRepository.CreateIncidentAsync(request, userId);

            if (incident == null)
            {
                return new IncidentResponse
                {
                    Success = false,
                    Message = "Failed to create incident"
                };
            }

            return new IncidentResponse
            {
                Success = true,
                Message = "Incident reported successfully",
                Incident = incident
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IncidentService] Error creating incident: {ex.Message}");
            return new IncidentResponse
            {
                Success = false,
                Message = $"An error occurred while creating the incident: {ex.Message}"
            };
        }
    }

    public async Task<IEnumerable<IncidentDto>> GetIncidentsByStationAsync(int stationId)
    {
        try
        {
            return await _incidentRepository.GetIncidentsByStationIdAsync(stationId);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IncidentService] Error getting incidents by station: {ex.Message}");
            return Enumerable.Empty<IncidentDto>();
        }
    }

    public async Task<IEnumerable<IncidentDto>> GetUserIncidentsAsync(int userId)
    {
        try
        {
            return await _incidentRepository.GetIncidentsByUserIdAsync(userId);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IncidentService] Error getting user incidents: {ex.Message}");
            return Enumerable.Empty<IncidentDto>();
        }
    }

    public async Task<IncidentDto?> GetIncidentByIdAsync(int incidentId)
    {
        try
        {
            return await _incidentRepository.GetIncidentByIdAsync(incidentId);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IncidentService] Error getting incident by id: {ex.Message}");
            return null;
        }
    }

    public async Task<IncidentResponse> UpdateIncidentAsync(int incidentId, UpdateIncidentRequest request, int? handledBy = null)
    {
        try
        {
            // Validate status if provided
            if (!string.IsNullOrEmpty(request.Status))
            {
                var validStatuses = new[] { "reported", "in_progress", "resolved" };
                if (!validStatuses.Contains(request.Status.ToLower()))
                {
                    return new IncidentResponse
                    {
                        Success = false,
                        Message = "Invalid status. Must be one of: reported, in_progress, resolved"
                    };
                }
            }

            // Validate priority if provided
            if (!string.IsNullOrEmpty(request.Priority))
            {
                var validPriorities = new[] { "low", "medium", "high", "urgent" };
                if (!validPriorities.Contains(request.Priority.ToLower()))
                {
                    return new IncidentResponse
                    {
                        Success = false,
                        Message = "Invalid priority. Must be one of: low, medium, high, urgent"
                    };
                }
            }

            var success = await _incidentRepository.UpdateIncidentAsync(incidentId, request, handledBy);

            if (!success)
            {
                return new IncidentResponse
                {
                    Success = false,
                    Message = "Failed to update incident"
                };
            }

            var updatedIncident = await _incidentRepository.GetIncidentByIdAsync(incidentId);

            return new IncidentResponse
            {
                Success = true,
                Message = "Incident updated successfully",
                Incident = updatedIncident
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IncidentService] Error updating incident: {ex.Message}");
            return new IncidentResponse
            {
                Success = false,
                Message = $"An error occurred while updating the incident: {ex.Message}"
            };
        }
    }

    public async Task<int> GetUnreadIncidentCountAsync(int stationId)
    {
        try
        {
            return await _incidentRepository.GetUnreadIncidentCountAsync(stationId);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IncidentService] Error getting unread count: {ex.Message}");
            return 0;
        }
    }

    public async Task<IEnumerable<IncidentDto>> GetRecentIncidentsAsync(int? stationId, string? status, int limit)
    {
        try
        {
            return await _incidentRepository.GetRecentIncidentsAsync(stationId, status, limit);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IncidentService] Error getting recent incidents: {ex.Message}");
            return Enumerable.Empty<IncidentDto>();
        }
    }
}

