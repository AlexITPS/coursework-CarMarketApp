namespace CarMarket.Application.DTOs.News
{
    public class NewsResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsArchived { get; set; }

        public List<NewsImageResponseDto> Images { get; set; } = new(); 

        public string AuthorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}