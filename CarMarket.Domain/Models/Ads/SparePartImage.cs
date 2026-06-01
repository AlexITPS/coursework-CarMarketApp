namespace CarMarket.Domain.Models.Ads
{
    public class SparePartImage : BaseEntity
    {
        public string Url { get; set; } = string.Empty;
        public bool IsMain { get; set; }

        public int SparePartAdId { get; set; }
        public SparePartAd? SparePartAd { get; set; }
    }
}
