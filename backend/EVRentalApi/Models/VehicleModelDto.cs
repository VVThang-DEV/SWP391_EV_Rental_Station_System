namespace EVRentalApi.Models
{
    public class VehicleModelDto
    {
        public string ModelId { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string ModelName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Year { get; set; }
        public int Seats { get; set; }
        public string Features { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public decimal PricePerHour { get; set; }
        public decimal PricePerDay { get; set; }
        public int MaxRangeKm { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Computed properties for frontend compatibility
        public List<string> FeaturesList => 
            string.IsNullOrEmpty(Features) 
                ? new List<string>() 
                : Features.Split(',').Select(f => f.Trim()).ToList();
    }
}
