using CarMarket.Application.DTOs.Cars;
using CarMarket.Application.DTOs.Common;
using CarMarket.Application.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CarMarket.Application.Services
{
    public class CarService : ICarService
    {
        private readonly IRepository<CarAd> _carRepo;
        private readonly IRepository<VehicleModel> _modelRepo; 
        private readonly IRepository<City> _cityRepo;
        private readonly IFileService _fileService;

        public CarService(
            IRepository<CarAd> carRepo,
            IRepository<VehicleModel> modelRepo,
            IRepository<City> cityRepo,
            IFileService fileService)
        {
            _carRepo = carRepo;
            _modelRepo = modelRepo;
            _cityRepo = cityRepo;
            _fileService = fileService;
        }

        public async Task<int> CreateAdAsync(CarAdCreateDto dto, int userId)
        {
            // 1. Проверяем существование модели и города
            var modelExists = await _modelRepo.GetQueryable().AnyAsync(m => m.Id == dto.VehicleModelId);
            var cityExists = await _cityRepo.GetQueryable().AnyAsync(c => c.Id == dto.CityId);

            if (!modelExists || !cityExists)
            {
                throw new ArgumentException("Указана неверная модель автомобиля или город.");
            }

            // 2. Валидация диапазонов чисел (Бизнес-логика)
            if (dto.PriceByn <= 0)
                throw new ArgumentException("Цена должна быть строго больше нуля.");

            if (dto.Mileage < 0)
                throw new ArgumentException("Пробег не может быть отрицательным.");

            // Верхняя граница — текущий год + 1 (для машин следующего модельного года)
            int maxAllowedYear = DateTime.UtcNow.Year + 1;
            if (dto.Year < 1900 || dto.Year > maxAllowedYear)
                throw new ArgumentException($"Год выпуска должен быть в диапазоне от 1900 до {maxAllowedYear}.");

            if (dto.EnginePower <= 0)
                throw new ArgumentException("Мощность двигателя должна быть больше нуля.");

            // 3. Защита от "кривых" int, приходящих вместо Enum
            if (!Enum.IsDefined(typeof(FuelType), dto.Fuel))
                throw new ArgumentException("Указан несуществующий тип топлива.");

            if (!Enum.IsDefined(typeof(Transmission), dto.Transmission))
                throw new ArgumentException("Указан несуществующий тип КПП.");

            if (!Enum.IsDefined(typeof(BodyType), dto.Body))
                throw new ArgumentException("Указан несуществующий тип кузова.");

            if (!Enum.IsDefined(typeof(CarMarket.Domain.Models.Common.DriveType), dto.Drive))
                throw new ArgumentException("Указан несуществующий тип привода.");

            if (!Enum.IsDefined(typeof(CarCondition), dto.Condition))
                throw new ArgumentException("Указано несуществующее состояние автомобиля.");

            var fuelType = (FuelType)dto.Fuel;

            // 4. Кросс-валидация зависимых полей (ДВС vs Электро)
            if (fuelType == FuelType.Electric)
            {
                if (!dto.BatteryCapacity.HasValue || dto.BatteryCapacity <= 0)
                    throw new ArgumentException("Для электромобиля необходимо обязательно указать емкость батареи (кВт*ч).");
            }
            else
            {
                if (!dto.EngineVolume.HasValue || dto.EngineVolume <= 0)
                    throw new ArgumentException("Для выбранного типа топлива необходимо указать объем двигателя.");
            }

            // 5. Создание сущности и сборка объекта
            var carAd = new CarAd
            {
                UserId = userId,
                VehicleModelId = dto.VehicleModelId,
                CityId = dto.CityId,
                Year = dto.Year,
                PriceByn = dto.PriceByn,
                Mileage = dto.Mileage,
                Description = dto.Description?.Trim() ?? string.Empty,
                EnginePower = dto.EnginePower,

                Fuel = fuelType,
                // Очищаем взаимоисключающие поля на бэкенде для чистоты данных в БД
                EngineVolume = (fuelType == FuelType.Electric) ? null : dto.EngineVolume,
                BatteryCapacity = (fuelType == FuelType.Electric || fuelType == FuelType.Hybrid) ? dto.BatteryCapacity : null,

                Transmission = (Transmission)dto.Transmission,
                Body = (BodyType)dto.Body,
                Drive = (CarMarket.Domain.Models.Common.DriveType)dto.Drive,
                Condition = (CarCondition)dto.Condition,
                Status = AdStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            // 6. Сохранение изображений (Твоя рабочая логика)
            if (dto.ImageFiles != null && dto.ImageFiles.Any())
            {
                bool isFirst = true;
                foreach (var file in dto.ImageFiles)
                {
                    // Здесь можно добавить мини-валидацию на расширение файла (jpg, png, webp)
                    var extension = Path.GetExtension(file.FileName).ToLower();
                    if (extension != ".jpg" && extension != ".jpeg" && extension != ".png" && extension != ".webp")
                    {
                        throw new ArgumentException($"Файл {file.FileName} имеет недопустимый формат. Разрешены только JPG, PNG, WEBP.");
                    }

                    var fileName = await _fileService.SaveFileAsync(file, "cars");
                    carAd.Images.Add(new CarImage
                    {
                        Url = $"/uploads/cars/{fileName}",
                        IsMain = isFirst
                    });
                    isFirst = false;
                }
            }

            await _carRepo.CreateAsync(carAd);
            return carAd.Id;
        }

        public async Task<CarAdResponseDto?> GetAdByIdAsync(int id, int? currentUserId = null, bool isAdmin = false)
        {
            var ad = await _carRepo.FindAsync(
                a => a.Id == id,
                a => a.VehicleModel!.Brand!,
                a => a.City!.Region!,
                a => a.Images,
                a => a.User!
            );

            if (ad == null) return null;

            if (ad.Status != AdStatus.Active && ad.UserId != currentUserId && !isAdmin)
            {
                return null;
            }

            return MapToResponseDto(ad);
        }

        public async Task<IEnumerable<CarAdResponseDto>> GetAllAdsAsync()
        {
            var ads = await _carRepo.GetAllAsync(
                a => a.VehicleModel!.Brand!,
                a => a.City!.Region!,
                a => a.Images,
                a => a.User!
            );

            return ads.OrderByDescending(a => a.CreatedAt).Select(MapToResponseDto);
        }

        public async Task<PagedResultDto<CarAdResponseDto>> GetFilteredAdsAsync(CarSearchFilterDto filter)
        {
            var query = _carRepo.GetQueryable()
                .Include(a => a.VehicleModel!.Brand!)
                .Include(a => a.City!.Region!)
                .Include(a => a.Images)
                .Include(a => a.User!)
                .Where(a => a.Status == AdStatus.Active);

            if (filter.BrandId.HasValue)
                query = query.Where(a => a.VehicleModel!.BrandId == filter.BrandId);

            if (filter.VehicleModelId.HasValue)
                query = query.Where(a => a.VehicleModelId == filter.VehicleModelId);

            if (filter.RegionId.HasValue)
                query = query.Where(a => a.City!.RegionId == filter.RegionId);

            if (filter.CityId.HasValue)
                query = query.Where(a => a.CityId == filter.CityId);

            if (filter.MinPrice.HasValue)
                query = query.Where(a => a.PriceByn >= filter.MinPrice);

            if (filter.MaxPrice.HasValue)
                query = query.Where(a => a.PriceByn <= filter.MaxPrice);

            if (filter.MinYear.HasValue)
                query = query.Where(a => a.Year >= filter.MinYear);

            if (filter.MaxYear.HasValue)
                query = query.Where(a => a.Year <= filter.MaxYear);

            // ---------------------------------------------------------------
            if (filter.MinMileage.HasValue)
                query = query.Where(a => a.Mileage >= filter.MinMileage);

            if (filter.MaxMileage.HasValue)
                query = query.Where(a => a.Mileage <= filter.MaxMileage);

            if (filter.MinEngineVolume.HasValue)
                query = query.Where(a => a.EngineVolume >= filter.MinEngineVolume);

            if (filter.MaxEngineVolume.HasValue)
                query = query.Where(a => a.EngineVolume <= filter.MaxEngineVolume);

            if (filter.MinEnginePower.HasValue)
                query = query.Where(a => a.EnginePower >= filter.MinEnginePower);

            if (filter.MaxEnginePower.HasValue)
                query = query.Where(a => a.EnginePower <= filter.MaxEnginePower);

            if (filter.MinBatteryCapacity.HasValue)
                query = query.Where(a => a.BatteryCapacity >= filter.MinBatteryCapacity);

            if (filter.MaxBatteryCapacity.HasValue)
                query = query.Where(a => a.BatteryCapacity <= filter.MaxBatteryCapacity);
            // ---------------------------------------------------------------

            // Enums
            if (filter.Fuel.HasValue)
                query = query.Where(a => a.Fuel == (FuelType)filter.Fuel);

            if (filter.Transmission.HasValue)
                query = query.Where(a => a.Transmission == (Transmission)filter.Transmission);

            if (filter.Body.HasValue)
                query = query.Where(a => a.Body == (BodyType)filter.Body);

            if (filter.Drive.HasValue)
                query = query.Where(a => a.Drive == (CarMarket.Domain.Models.Common.DriveType)filter.Drive);

            if (filter.Condition.HasValue)
                query = query.Where(a => a.Condition == (CarCondition)filter.Condition);

            var totalCount = await query.CountAsync();

            query = filter.SortBy switch
            {
                "price_asc" => query.OrderBy(a => a.PriceByn),
                "price_desc" => query.OrderByDescending(a => a.PriceByn),
                "year_asc" => query.OrderBy(a => a.Year),
                "year_desc" => query.OrderByDescending(a => a.Year),
                _ => query.OrderByDescending(a => a.CreatedAt)
            };

            var ads = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResultDto<CarAdResponseDto>
            {
                Items = ads.Select(MapToResponseDto),
                TotalCount = totalCount,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize
            };
        }

        public async Task<IEnumerable<CarAdResponseDto>> GetUserAdsAsync(int userId)
        {
            var ads = await _carRepo.GetQueryable()
                .Include(a => a.VehicleModel!.Brand!)
                .Include(a => a.City!.Region!)
                .Include(a => a.Images)
                .Include(a => a.User!)
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return ads.Select(MapToResponseDto);
        }

        public async Task<bool> UpdateAdAsync(int adId, int userId, CarAdUpdateDto dto)
        {
            var ad = await _carRepo.GetQueryable()
                .Include(a => a.Images)
                .FirstOrDefaultAsync(a => a.Id == adId && a.UserId == userId);

            if (ad == null) return false;

            ad.PriceByn = dto.PriceByn;
            ad.Mileage = dto.Mileage;
            ad.Year = dto.Year;
            ad.Description = dto.Description;
            ad.CityId = dto.CityId;
            ad.EnginePower = dto.EnginePower;
            ad.Fuel = (FuelType)dto.Fuel;

            ad.EngineVolume = (ad.Fuel == FuelType.Electric) ? null : dto.EngineVolume;
            ad.BatteryCapacity = (ad.Fuel == FuelType.Electric || ad.Fuel == FuelType.Hybrid) ? dto.BatteryCapacity : null;

            ad.Transmission = (Transmission)dto.Transmission;
            ad.Body = (BodyType)dto.Body;
            ad.Drive = (CarMarket.Domain.Models.Common.DriveType)dto.Drive;
            ad.Condition = (CarCondition)dto.Condition;

            if (dto.ImageFiles != null && dto.ImageFiles.Any())
            {
                foreach (var img in ad.Images)
                {
                    _fileService.DeleteFile(img.Url);
                }
                ad.Images.Clear();

                bool isFirst = true;
                foreach (var file in dto.ImageFiles)
                {
                    var fileName = await _fileService.SaveFileAsync(file, "cars");
                    ad.Images.Add(new CarImage
                    {
                        Url = $"/uploads/cars/{fileName}",
                        IsMain = isFirst
                    });
                    isFirst = false;
                }
            }

            ad.Status = AdStatus.Pending;
            await _carRepo.UpdateAsync(ad);
            return true;
        }

        public async Task<bool> DeleteAdAsync(int adId, int userId)
        {
            var ad = await _carRepo.GetQueryable()
                .Include(a => a.Images)
                .FirstOrDefaultAsync(a => a.Id == adId && a.UserId == userId);

            if (ad == null) return false;

            foreach (var img in ad.Images)
            {
                _fileService.DeleteFile(img.Url);
            }

            await _carRepo.DeleteAsync(ad);
            return true;
        }

        public async Task<bool> UpdateAdStatusAsync(int adId, int userId, AdStatus newStatus)
        {
            var ad = await _carRepo.GetQueryable()
                .FirstOrDefaultAsync(a => a.Id == adId && a.UserId == userId);

            if (ad == null) return false;

            ad.Status = newStatus;
            await _carRepo.UpdateAsync(ad);
            return true;
        }

        public CarAdResponseDto MapToResponseDto(CarAd ad)
        {
            return new CarAdResponseDto
            {
                Id = ad.Id,
                BrandName = ad.VehicleModel?.Brand?.Name ?? "Не указано",
                ModelName = ad.VehicleModel?.Name ?? "Не указано",
                CityName = ad.City?.Name ?? "Не указано",
                RegionName = ad.City?.Region?.Name ?? "Не указано",
                Year = ad.Year,
                PriceByn = ad.PriceByn,
                Mileage = ad.Mileage,
                Description = ad.Description,
                EngineVolume = ad.EngineVolume,
                EnginePower = ad.EnginePower,
                BatteryCapacity = ad.BatteryCapacity,

                Status = EnumTranslator.TranslateToRus(ad.Status),
                Fuel = EnumTranslator.TranslateToRus(ad.Fuel),
                Transmission = EnumTranslator.TranslateToRus(ad.Transmission),
                Body = EnumTranslator.TranslateToRus(ad.Body),
                Drive = EnumTranslator.TranslateToRus(ad.Drive),
                Condition = EnumTranslator.TranslateToRus(ad.Condition),

                Images = ad.Images.Select(img => img.Url).ToList(),

                SellerId = ad.UserId,

                SellerName = ad.User != null ? $"{ad.User.FirstName} {ad.User.LastName}".Trim() : "Не указан",
                SellerPhone = ad.User?.Phone ?? string.Empty,
                CreatedAt = ad.CreatedAt
            };
        }
    }
}