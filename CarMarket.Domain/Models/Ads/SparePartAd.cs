namespace CarMarket.Domain.Models.Ads
{
    public class SparePartAd : BaseEntity
    {
        public string Title { get; set; } = string.Empty;

        public int SparePartCategoryId { get; set; }
        public SparePartCategory? Category { get; set; }

        public decimal PriceByn { get; set; }
        public string Description { get; set; } = string.Empty;

        public int BrandId { get; set; } 
        public Brand? Brand { get; set; }

        public SparePartCondition Condition { get; set; }
        public AdStatus Status { get; set; } = AdStatus.Pending;

        public ICollection<SparePartImage> Images { get; set; } = new List<SparePartImage>();

        public int UserId { get; set; }
        public User? User { get; set; }
    }
}