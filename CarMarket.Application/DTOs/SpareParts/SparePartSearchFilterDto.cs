namespace CarMarket.Application.DTOs.SpareParts
{
    public class SparePartSearchFilterDto
    {
        public int? BrandId { get; set; }
        public int? CategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }

        public SparePartCondition? Condition { get; set; }

        public string? SortBy { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}