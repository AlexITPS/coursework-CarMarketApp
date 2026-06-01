namespace CarMarket.Domain.Models.Cms
{
    public class NewsImage : BaseEntity
    {
        public string Url { get; set; } = string.Empty;
        public bool IsMain { get; set; }
        public int NewsId { get; set; }
        public News? News { get; set; }
    }
}
