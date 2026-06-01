namespace CarMarket.Domain.Models.Ads
{
    public class FavoriteAd : BaseEntity
    {
        public int UserId { get; set; }
        public User? User { get; set; }

        public int? CarAdId { get; set; }
        public CarAd? CarAd { get; set; }

        public int? SparePartAdId { get; set; }
        public SparePartAd? SparePartAd { get; set; }
    }
}