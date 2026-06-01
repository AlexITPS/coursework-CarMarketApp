using Microsoft.AspNetCore.Http;

namespace CarMarket.Application.DTOs.SpareParts
{
    public class SparePartUpdateDto
    {
        public string Title { get; set; } = string.Empty;
        public int SparePartCategoryId { get; set; }
        public int BrandId { get; set; }
        public decimal PriceByn { get; set; }
        public string Description { get; set; } = string.Empty;

        public SparePartCondition Condition { get; set; }

        public List<IFormFile> ImageFiles { get; set; } = new();
    }
}