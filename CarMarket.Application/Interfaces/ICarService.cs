using CarMarket.Application.DTOs.Cars;
using CarMarket.Application.DTOs.Common;

namespace CarMarket.Application.Interfaces
{
    public interface ICarService
    {
        Task<int> CreateAdAsync(CarAdCreateDto dto, int userId);
        Task<IEnumerable<CarAdResponseDto>> GetAllAdsAsync();
        Task<CarAdResponseDto?> GetAdByIdAsync(int id, int? currentUserId, bool isAdmin);
        Task<PagedResultDto<CarAdResponseDto>> GetFilteredAdsAsync(CarSearchFilterDto filter);

        Task<IEnumerable<CarAdResponseDto>> GetUserAdsAsync(int userId);
        Task<bool> UpdateAdAsync(int adId, int userId, CarAdUpdateDto dto);
        Task<bool> DeleteAdAsync(int adId, int userId);
        Task<bool> UpdateAdStatusAsync(int adId, int userId, AdStatus newStatus);
        CarAdResponseDto MapToResponseDto(CarAd carAd);
    }
}