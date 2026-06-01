using CarMarket.Application.DTOs.Common;
using CarMarket.Application.DTOs.SpareParts;
using CarMarket.Application.Helpers;
using Microsoft.EntityFrameworkCore;

namespace CarMarket.Application.Services
{
    public class SparePartService : ISparePartService
    {
        private readonly IRepository<SparePartAd> _partRepo;
        private readonly IRepository<Brand> _brandRepo;
        private readonly IRepository<SparePartCategory> _categoryRepo;
        private readonly IFileService _fileService;

        public SparePartService(
            IRepository<SparePartAd> partRepo,
            IRepository<Brand> brandRepo,
            IRepository<SparePartCategory> categoryRepo,
            IFileService fileService)
        {
            _partRepo = partRepo;
            _brandRepo = brandRepo;
            _categoryRepo = categoryRepo;
            _fileService = fileService;
        }

        public async Task<int> CreateAsync(SparePartCreateDto dto, int userId)
        {
            var brandExists = await _brandRepo.GetQueryable().AnyAsync(b => b.Id == dto.BrandId);
            var categoryExists = await _categoryRepo.GetQueryable().AnyAsync(c => c.Id == dto.SparePartCategoryId);

            if (!brandExists || !categoryExists)
            {
                throw new Exception("Указан неверный бренд или категория запчасти");
            }

            var part = new SparePartAd
            {
                Title = dto.Title,
                SparePartCategoryId = dto.SparePartCategoryId,
                BrandId = dto.BrandId,
                PriceByn = dto.PriceByn,
                Description = dto.Description,
                Condition = dto.Condition,
                UserId = userId,
                Status = AdStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            if (dto.ImageFiles != null && dto.ImageFiles.Any())
            {
                bool isFirst = true;
                foreach (var file in dto.ImageFiles)
                {
                    var fileName = await _fileService.SaveFileAsync(file, "parts");
                    part.Images.Add(new SparePartImage
                    {
                        Url = $"/uploads/parts/{fileName}",
                        IsMain = isFirst
                    });
                    isFirst = false;
                }
            }

            await _partRepo.CreateAsync(part);
            return part.Id;
        }

        public async Task<SparePartResponseDto?> GetByIdAsync(int id, int? currentUserId = null, bool isAdmin = false)
        {
            var part = await _partRepo.GetQueryable()
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (part == null) return null;

            if (part.Status != AdStatus.Active && part.UserId != currentUserId && !isAdmin)
            {
                return null;
            }

            return MapToResponseDto(part);
        }

        public async Task<IEnumerable<SparePartResponseDto>> GetUserPartsAsync(int userId)
        {
            var parts = await _partRepo.GetQueryable()
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .Include(p => p.User)
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return parts.Select(MapToResponseDto);
        }

        public async Task<bool> UpdateAsync(int id, int userId, SparePartUpdateDto dto)
        {
            var part = await _partRepo.GetQueryable()
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (part == null) return false;

            part.Title = dto.Title;
            part.SparePartCategoryId = dto.SparePartCategoryId;
            part.BrandId = dto.BrandId;
            part.PriceByn = dto.PriceByn;
            part.Description = dto.Description;
            part.Condition = dto.Condition;

            if (dto.ImageFiles != null && dto.ImageFiles.Any())
            {
                foreach (var img in part.Images)
                {
                    _fileService.DeleteFile(img.Url);
                }
                part.Images.Clear();

                bool isFirst = true;
                foreach (var file in dto.ImageFiles)
                {
                    var fileName = await _fileService.SaveFileAsync(file, "parts");
                    part.Images.Add(new SparePartImage
                    {
                        Url = $"/uploads/parts/{fileName}",
                        IsMain = isFirst
                    });
                    isFirst = false;
                }
            }

            part.Status = AdStatus.Pending;

            await _partRepo.UpdateAsync(part);
            return true;
        }

        public async Task<bool> UpdateStatusAsync(int id, int userId, AdStatus newStatus, bool isAdmin)
        {
            var query = _partRepo.GetQueryable();

            var part = isAdmin
                ? await query.FirstOrDefaultAsync(p => p.Id == id)
                : await query.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (part == null) return false;

            part.Status = newStatus;
            await _partRepo.UpdateAsync(part);
            return true;
        }

        public async Task<bool> DeleteAsync(int id, int userId, bool isAdmin)
        {
            var query = _partRepo.GetQueryable().Include(p => p.Images);

            var part = isAdmin
                ? await query.FirstOrDefaultAsync(p => p.Id == id)
                : await query.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (part == null) return false;

            foreach (var img in part.Images)
            {
                _fileService.DeleteFile(img.Url);
            }

            await _partRepo.DeleteAsync(part);
            return true;
        }

        public async Task<PagedResultDto<SparePartResponseDto>> GetFilteredAsync(SparePartSearchFilterDto filter)
        {
            var pageNumber = filter.PageNumber < 1 ? 1 : filter.PageNumber;
            var pageSize = filter.PageSize < 1 ? 10 : filter.PageSize;

            var query = _partRepo.GetQueryable()
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .Include(p => p.User)
                .Where(p => p.Status == AdStatus.Active); 

            if (filter.BrandId.HasValue)
                query = query.Where(p => p.BrandId == filter.BrandId);

            if (filter.CategoryId.HasValue)
                query = query.Where(p => p.SparePartCategoryId == filter.CategoryId);

            if (filter.MinPrice.HasValue)
                query = query.Where(p => p.PriceByn >= filter.MinPrice);

            if (filter.MaxPrice.HasValue)
                query = query.Where(p => p.PriceByn <= filter.MaxPrice);

            if (filter.Condition.HasValue)
                query = query.Where(p => p.Condition == filter.Condition);

            var totalCount = await query.CountAsync();

            query = filter.SortBy switch
            {
                "price_asc" => query.OrderBy(p => p.PriceByn),
                "price_desc" => query.OrderByDescending(p => p.PriceByn),
                "oldest" => query.OrderBy(p => p.CreatedAt),
                _ => query.OrderByDescending(p => p.CreatedAt) 
            };

            var items = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

            return new PagedResultDto<SparePartResponseDto>
            {
                Items = items.Select(MapToResponseDto),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public SparePartResponseDto MapToResponseDto(SparePartAd ad)
        {
            return new SparePartResponseDto
            {
                Id = ad.Id,
                Title = ad.Title,

                SparePartCategoryId = ad.SparePartCategoryId,
                BrandId = ad.BrandId,

                CategoryName = ad.Category?.Name ?? "Без категории",
                BrandName = ad.Brand?.Name ?? "Универсальная",
                PriceByn = ad.PriceByn,
                Description = ad.Description,

                ConditionId = (int)ad.Condition,
                ConditionName = EnumTranslator.TranslateToRus(ad.Condition),

                StatusId = (int)ad.Status,
                StatusName = EnumTranslator.TranslateToRus(ad.Status),

                SellerId = ad.UserId,

                Images = ad.Images.OrderByDescending(i => i.IsMain).Select(img => img.Url).ToList(),
                SellerName = ad.User != null ? $"{ad.User.FirstName} {ad.User.LastName}" : "Не указан",
                SellerPhone = ad.User?.Phone ?? "",
                CreatedAt = ad.CreatedAt
            };
        }
    }
}