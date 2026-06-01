using CarMarket.Application.DTOs.Cars;
using CarMarket.Application.DTOs.SpareParts;

namespace CarMarket.Application.Interfaces
{
    public interface IFavoriteService
    {
        Task<bool> ToggleCarFavoriteAsync(int carAdId, int userId);
        Task<bool> ToggleSparePartFavoriteAsync(int sparePartId, int userId);
        Task<IEnumerable<CarAdResponseDto>> GetFavoriteCarsAsync(int userId);
        Task<IEnumerable<SparePartResponseDto>> GetFavoriteSparePartsAsync(int userId);
    }
}
