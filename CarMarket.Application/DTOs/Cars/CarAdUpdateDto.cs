using Microsoft.AspNetCore.Http;

namespace CarMarket.Application.DTOs.Cars 
{
    public class CarAdUpdateDto
    {
        public decimal PriceByn { get; set; }
        public int Mileage { get; set; }
        public int Year { get; set; }
        public string Description { get; set; } = string.Empty;
        public double? EngineVolume { get; set; }
        public int EnginePower { get; set; }
        public int? BatteryCapacity { get; set; }
        public int CityId { get; set; }

        public int Fuel { get; set; }
        public int Transmission { get; set; }
        public int Body { get; set; }
        public int Drive { get; set; }
        public int Condition { get; set; }

        public List<IFormFile> ImageFiles { get; set; } = new();
    }
}