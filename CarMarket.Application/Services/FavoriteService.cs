using CarMarket.Application.DTOs.Cars;
using CarMarket.Application.DTOs.SpareParts;
using CarMarket.Application.Interfaces;
using CarMarket.Domain.Models.Ads;
using Microsoft.EntityFrameworkCore;

namespace CarMarket.Application.Services
{
    public class FavoriteService : IFavoriteService
    {
        private readonly IRepository<FavoriteAd> _favRepo;
        private readonly IRepository<CarAd> _carRepo;               
        private readonly IRepository<SparePartAd> _sparePartRepo;   
        private readonly ICarService _carService;
        private readonly ISparePartService _sparePartService;

        public FavoriteService(
            IRepository<FavoriteAd> favRepo,
            IRepository<CarAd> carRepo,
            IRepository<SparePartAd> sparePartRepo,
            ICarService carService,
            ISparePartService sparePartService)
        {
            _favRepo = favRepo;
            _carRepo = carRepo;
            _sparePartRepo = sparePartRepo;
            _carService = carService;
            _sparePartService = sparePartService;
        }

        public async Task<bool> ToggleCarFavoriteAsync(int carAdId, int userId)
        {
            var carAd = await _carRepo.GetQueryable()
                .FirstOrDefaultAsync(c => c.Id == carAdId);

            if (carAd == null)
                throw new InvalidOperationException("Объявление не найдено.");

            if (carAd.Status != AdStatus.Active)
            {
                throw new InvalidOperationException("Нельзя добавить в избранное неактивное объявление.");
            }

            if (carAd.UserId == userId)
                throw new InvalidOperationException("Вы не можете добавить в избранное собственное объявление.");

            var existing = await _favRepo.FindAsync(f => f.UserId == userId && f.CarAdId == carAdId);

            if (existing != null)
            {
                await _favRepo.DeleteAsync(existing);
                return false;
            }

            await _favRepo.CreateAsync(new FavoriteAd { UserId = userId, CarAdId = carAdId });
            return true;
        }

        public async Task<bool> ToggleSparePartFavoriteAsync(int sparePartId, int userId)
        {
            var sparePartAd = await _sparePartRepo.GetQueryable()
                .FirstOrDefaultAsync(p => p.Id == sparePartId);

            if (sparePartAd == null)
                throw new InvalidOperationException("Объявление не найдено.");

            if (sparePartAd.Status != AdStatus.Active)
            {
                throw new InvalidOperationException("Нельзя добавить в избранное неактивное объявление.");
            }

            if (sparePartAd.UserId == userId)
                throw new InvalidOperationException("Вы не можете добавить в избранное собственное объявление.");

            var existing = await _favRepo.FindAsync(f => f.UserId == userId && f.SparePartAdId == sparePartId);

            if (existing != null)
            {
                await _favRepo.DeleteAsync(existing);
                return false;
            }

            await _favRepo.CreateAsync(new FavoriteAd { UserId = userId, SparePartAdId = sparePartId });
            return true;
        }

        public async Task<IEnumerable<CarAdResponseDto>> GetFavoriteCarsAsync(int userId)
        {
            var favorites = await _favRepo.GetQueryable()
                .Include(f => f.CarAd!).ThenInclude(a => a.VehicleModel!.Brand!)
                .Include(f => f.CarAd!).ThenInclude(a => a.City!.Region!)
                .Include(f => f.CarAd!).ThenInclude(a => a.Images)
                .Include(f => f.CarAd!).ThenInclude(a => a.User!)
                .Where(f => f.UserId == userId && f.CarAdId != null)
                .Select(f => f.CarAd!)
                .ToListAsync();

            return favorites.Select(a => _carService.MapToResponseDto(a));
        }

        public async Task<IEnumerable<SparePartResponseDto>> GetFavoriteSparePartsAsync(int userId)
        {
            var favorites = await _favRepo.GetQueryable()
                .Include(f => f.SparePartAd!).ThenInclude(p => p.Images)
                .Include(f => f.SparePartAd!).ThenInclude(p => p.User!)
                .Where(f => f.UserId == userId && f.SparePartAdId != null)
                .Select(f => f.SparePartAd!)
                .ToListAsync();

            return favorites.Select(p => _sparePartService.MapToResponseDto(p));
        }
    }
}