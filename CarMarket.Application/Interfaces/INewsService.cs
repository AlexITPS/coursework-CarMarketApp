using CarMarket.Application.DTOs.News;

namespace CarMarket.Application.Interfaces
{
    public interface INewsService
    {
        Task<int> CreateAsync(NewsCreateDto dto, int authorId);
        Task<IEnumerable<NewsResponseDto>> GetAllAsync(bool includeArchived = false);
        Task<NewsResponseDto?> GetByIdAsync(int id);

        Task<bool> UpdateAsync(int id, NewsUpdateDto dto);
        Task<bool> ArchiveAsync(int id); 
        Task<bool> DeletePermanentlyAsync(int id);
    }
}