namespace CarMarket.Application.DTOs.Cars
{
    public class CarAdResponseDto
    {
        public int Id { get; set; }

        public string BrandName { get; set; } = string.Empty;
        public string ModelName { get; set; } = string.Empty;
        public string CityName { get; set; } = string.Empty;
        public string RegionName { get; set; } = string.Empty;

        public int Year { get; set; }
        public decimal PriceByn { get; set; }
        public int Mileage { get; set; }
        public string Description { get; set; } = string.Empty;

        public double? EngineVolume { get; set; }
        public int EnginePower { get; set; }
        public int? BatteryCapacity { get; set; }

        public string Fuel { get; set; } = string.Empty;
        public string Transmission { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Drive { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        public List<string> Images { get; set; } = new();

        public int SellerId { get; set; }

        public string SellerName { get; set; } = string.Empty;
        public string SellerPhone { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}