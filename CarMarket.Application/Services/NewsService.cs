using CarMarket.Application.DTOs.News;
using CarMarket.Domain.Models.Cms;
using Microsoft.EntityFrameworkCore;

namespace CarMarket.Application.Services
{
    public class NewsService : INewsService
    {
        private readonly IRepository<News> _newsRepo;
        private readonly IFileService _fileService;

        public NewsService(IRepository<News> newsRepo, IFileService fileService)
        {
            _newsRepo = newsRepo;
            _fileService = fileService;
        }

        public async Task<int> CreateAsync(NewsCreateDto dto, int authorId)
        {
            var news = new News
            {
                Title = dto.Title,
                Content = dto.Content,
                AuthorId = authorId,
                CreatedAt = DateTime.UtcNow
            };

            if (dto.ImageFiles != null && dto.ImageFiles.Any())
            {
                bool isFirst = true;
                foreach (var file in dto.ImageFiles)
                {
                    var fileName = await _fileService.SaveFileAsync(file, "news");
                    news.Images.Add(new NewsImage { Url = $"/uploads/news/{fileName}", IsMain = isFirst });
                    isFirst = false;
                }
            }

            await _newsRepo.CreateAsync(news);
            return news.Id;
        }

        public async Task<IEnumerable<NewsResponseDto>> GetAllAsync(bool includeArchived = false)
        {
            var query = _newsRepo.GetQueryable()
                .Include(n => n.Images)
                .Include(n => n.Author)
                .AsQueryable();

            if (!includeArchived)
                query = query.Where(n => !n.IsArchived);

            var newsList = await query.OrderByDescending(n => n.CreatedAt).ToListAsync();
            return newsList.Select(MapToResponseDto);
        }

        public async Task<NewsResponseDto?> GetByIdAsync(int id)
        {
            var news = await _newsRepo.GetQueryable()
                .Include(n => n.Images)
                .Include(n => n.Author)
                .FirstOrDefaultAsync(n => n.Id == id);

            return news != null ? MapToResponseDto(news) : null;
        }

        public async Task<bool> UpdateAsync(int id, NewsUpdateDto dto)
        {
            var news = await _newsRepo.GetQueryable()
                .Include(n => n.Images)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (news == null) return false;

            news.Title = dto.Title;
            news.Content = dto.Content;
            news.IsArchived = dto.IsArchived;

            if (dto.ImageFiles != null && dto.ImageFiles.Any())
            {
                foreach (var img in news.Images) _fileService.DeleteFile(img.Url);

                news.Images.Clear();

                bool isFirst = true;
                foreach (var file in dto.ImageFiles)
                {
                    var fileName = await _fileService.SaveFileAsync(file, "news");
                    news.Images.Add(new NewsImage { Url = $"/uploads/news/{fileName}", IsMain = isFirst });
                    isFirst = false;
                }
            }

            await _newsRepo.UpdateAsync(news);
            return true;
        }

        public async Task<bool> ArchiveAsync(int id)
        {
            var news = await _newsRepo.GetQueryable().FirstOrDefaultAsync(n => n.Id == id);
            if (news == null) return false;

            news.IsArchived = true;
            await _newsRepo.UpdateAsync(news);
            return true;
        }

        public async Task<bool> DeletePermanentlyAsync(int id)
        {
            var news = await _newsRepo.GetQueryable()
                .Include(n => n.Images)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (news == null) return false;

            foreach (var img in news.Images) _fileService.DeleteFile(img.Url);
            await _newsRepo.DeleteAsync(news);
            return true;
        }

        private NewsResponseDto MapToResponseDto(News news)
        {
            string fullName = "Неизвестный автор";
            if (news.Author != null)
            {
                fullName = $"{news.Author.FirstName} {news.Author.LastName}".Trim();
                if (string.IsNullOrWhiteSpace(fullName)) fullName = news.Author.Email ?? "Пользователь";
            }

            return new NewsResponseDto
            {
                Id = news.Id,
                Title = news.Title,
                Content = news.Content,
                IsArchived = news.IsArchived,
                AuthorName = fullName,
                CreatedAt = news.CreatedAt,
                Images = news.Images.Select(i => new NewsImageResponseDto { Url = i.Url, IsMain = i.IsMain }).ToList()
            };
        }
    }
}