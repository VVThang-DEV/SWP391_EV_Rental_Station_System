namespace EVRentalApi.Models
{
    public class VehicleDto
    {
        public int VehicleId { get; set; }
        public string ModelId { get; set; } = string.Empty;
        public int StationId { get; set; }
        public string UniqueVehicleId { get; set; } = string.Empty;
        public int BatteryLevel { get; set; }
        public int MaxRangeKm { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal PricePerHour { get; set; }
        public decimal PricePerDay { get; set; }
        public decimal Rating { get; set; }
        public int ReviewCount { get; set; }
        public int Trips { get; set; }
        public int Mileage { get; set; }
        public string LastMaintenance { get; set; } = string.Empty;
        public string InspectionDate { get; set; } = string.Empty;
        public string InsuranceExpiry { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public string LicensePlate { get; set; } = string.Empty;
        public string FuelEfficiency { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public VehicleModelDto? VehicleModel { get; set; }
        public StationDto? Station { get; set; }

        // Computed properties for frontend compatibility
        public string Id => $"VEHICLE-{VehicleId}";
        public string Availability => Status;
        public int Range => MaxRangeKm;
        public string Name => $"{ModelId} Vehicle";
        public string Brand => "VinFast";
        public string Model => ModelId;
        public string Type => "Unknown";
        public int Year => 2024;
        public int Seats => 5;
        public List<string> Features => new List<string>();
        public string Description => string.Empty;
    }
}
