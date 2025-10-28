namespace EVRentalApi.Models
{
    public class StationUpdateRequest
    {
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? Status { get; set; }
        public int? TotalSlots { get; set; }
        public string? Amenities { get; set; }
        public double? Rating { get; set; }
        public string? OperatingHours { get; set; }
        public bool? FastCharging { get; set; }
        public string? Image { get; set; }
    }
}
