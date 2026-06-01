namespace CarMarket.Application.DTOs.SpareParts
{
    public class SparePartResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;

        public int SparePartCategoryId { get; set; }
        public int BrandId { get; set; }

        public string CategoryName { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;
        public decimal PriceByn { get; set; }
        public string Description { get; set; } = string.Empty;

        public int ConditionId { get; set; }                  
        public string ConditionName { get; set; } = string.Empty; 

        public int StatusId { get; set; }                     
        public string StatusName { get; set; } = string.Empty;    

        public List<string> Images { get; set; } = new();
        public int SellerId { get; set; }
        public string SellerName { get; set; } = string.Empty;
        public string SellerPhone { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}