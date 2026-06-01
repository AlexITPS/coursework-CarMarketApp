using Microsoft.AspNetCore.Http;

namespace CarMarket.Application.DTOs.News
{
    public class NewsUpdateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsArchived { get; set; }
        public List<IFormFile> ImageFiles { get; set; } = new(); 
    }
}