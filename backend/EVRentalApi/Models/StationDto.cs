namespace EVRentalApi.Models
{
    public class StationDto
    {
        public int StationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public string Status { get; set; } = string.Empty;
        public int AvailableVehicles { get; set; }
        public int TotalSlots { get; set; }
        public string Amenities { get; set; } = string.Empty;
        public decimal Rating { get; set; }
        public string OperatingHours { get; set; } = string.Empty;
        public bool FastCharging { get; set; }
        public string Image { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Computed properties for frontend compatibility
        public CoordinatesDto Coordinates => new CoordinatesDto
        {
            Lat = (double)Latitude,
            Lng = (double)Longitude
        };

        public List<string> AmenitiesList => 
            string.IsNullOrEmpty(Amenities) 
                ? new List<string>() 
                : System.Text.Json.JsonSerializer.Deserialize<List<string>>(Amenities) ?? new List<string>();
    }

    public class CoordinatesDto
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
    }
}
