using Microsoft.AspNetCore.Http;

namespace CarMarket.Application.DTOs.News
{
    public class NewsCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<IFormFile> ImageFiles { get; set; } = new();
    }
}