namespace CarMarket.Domain.Models.Cms
{
    public class News : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsArchived { get; set; } = false; 

        public ICollection<NewsImage> Images { get; set; } = new List<NewsImage>();

        public int AuthorId { get; set; }
        public User? Author { get; set; }
    }
}