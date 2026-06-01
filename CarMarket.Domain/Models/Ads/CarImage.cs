namespace CarMarket.Domain.Models.Ads
{
    public class CarImage : BaseEntity
    {
        public string Url { get; set; } = string.Empty;
        public bool IsMain { get; set; }

        public int CarAdId { get; set; }
        public CarAd? CarAd { get; set; }
    }
}