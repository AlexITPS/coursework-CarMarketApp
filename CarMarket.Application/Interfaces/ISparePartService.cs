using CarMarket.Application.DTOs.Common;
using CarMarket.Application.DTOs.SpareParts;
using CarMarket.Domain.Models.Ads;

namespace CarMarket.Application.Interfaces
{
    public interface ISparePartService
    {
        Task<int> CreateAsync(SparePartCreateDto dto, int userId);
        Task<PagedResultDto<SparePartResponseDto>> GetFilteredAsync(SparePartSearchFilterDto filter);
        Task<SparePartResponseDto?> GetByIdAsync(int id, int? currentUserId, bool isAdmin);

        Task<IEnumerable<SparePartResponseDto>> GetUserPartsAsync(int userId);
        Task<bool> UpdateAsync(int id, int userId, SparePartUpdateDto dto);
        Task<bool> DeleteAsync(int id, int userId, bool isAdmin);
        Task<bool> UpdateStatusAsync(int id, int userId, AdStatus newStatus, bool isAdmin);
        SparePartResponseDto MapToResponseDto(SparePartAd sparePartAd);
    }
}