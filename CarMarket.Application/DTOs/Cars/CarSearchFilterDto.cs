namespace CarMarket.Application.DTOs.Cars
{
    public class CarSearchFilterDto
    {
        public int? BrandId { get; set; }
        public int? VehicleModelId { get; set; }
        public int? RegionId { get; set; }
        public int? CityId { get; set; }

        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? MinYear { get; set; }
        public int? MaxYear { get; set; }

        public int? MinMileage { get; set; }
        public int? MaxMileage { get; set; }

        public double? MinEngineVolume { get; set; }
        public double? MaxEngineVolume { get; set; }

        public int? MinEnginePower { get; set; }
        public int? MaxEnginePower { get; set; }

        public int? MinBatteryCapacity { get; set; }
        public int? MaxBatteryCapacity { get; set; }

        public int? Fuel { get; set; }
        public int? Transmission { get; set; }
        public int? Body { get; set; }
        public int? Drive { get; set; }
        public int? Condition { get; set; }

        public string? SortBy { get; set; }

        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}