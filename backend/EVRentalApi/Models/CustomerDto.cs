namespace EVRentalApi.Models
{
    public class CustomerDto
    {
        public string Id { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int Rentals { get; set; }
        public double Spent { get; set; }
        public string Risk { get; set; } = "low";
        public string Status { get; set; } = "active";
        public double WalletBalance { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CustomerDetailDto : CustomerDto
    {
        public string? Cccd { get; set; }
        public string? LicenseNumber { get; set; }
        public string? Address { get; set; }
        public string? Gender { get; set; }
        public string? DateOfBirth { get; set; }
        public int TotalReservations { get; set; }
        public int CancelledCount { get; set; }
        public int LateReturnsCount { get; set; }
        public int DamagesCount { get; set; }
    }
}

