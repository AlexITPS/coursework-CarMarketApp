namespace CarMarket.Domain.Models.Ads
{
    public enum AdStatus 
    { 
        Pending, 
        Active, 
        Sold, 
        Rejected 
    }

    public class CarAd : BaseEntity
    {
        public int VehicleModelId { get; set; }
        public VehicleModel? VehicleModel { get; set; }

        public int Year { get; set; }
        public decimal PriceByn { get; set; }
        public int Mileage { get; set; }

        // ДВС
        public double? EngineVolume { get; set; } // null для электро
        public int EnginePower { get; set; } 

        // Электро
        public int? BatteryCapacity { get; set; } // кВт*ч (null для обычных)

        public FuelType Fuel { get; set; }
        public Transmission Transmission { get; set; }
        public BodyType Body { get; set; }
        public CarMarket.Domain.Models.Common.DriveType Drive { get; set; }
        public CarCondition Condition { get; set; } 

        public int CityId { get; set; }
        public City? City { get; set; }

        public string Description { get; set; } = string.Empty;
        public ICollection<CarImage> Images { get; set; } = new List<CarImage>();
        public AdStatus Status { get; set; } = AdStatus.Pending;

        public int UserId { get; set; }
        public User? User { get; set; }
    }
}