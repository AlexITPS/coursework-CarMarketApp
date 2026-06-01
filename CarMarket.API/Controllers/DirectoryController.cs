using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarMarket.Application.Interfaces;
using CarMarket.Application.DTOs.Common;
using CarMarket.Domain.Models.Directory;

namespace CarMarket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DirectoryController : ControllerBase
    {
        private readonly IRepository<Brand> _brandRepo;
        private readonly IRepository<VehicleModel> _modelRepo;
        private readonly IRepository<Region> _regionRepo;
        private readonly IRepository<City> _cityRepo;
        private readonly IRepository<SparePartCategory> _spareCategoryRepo;

        public DirectoryController(
            IRepository<Brand> brandRepo,
            IRepository<VehicleModel> modelRepo,
            IRepository<Region> regionRepo,
            IRepository<City> cityRepo,
            IRepository<SparePartCategory> spareCategoryRepo)
        {
            _brandRepo = brandRepo;
            _modelRepo = modelRepo;
            _regionRepo = regionRepo;
            _cityRepo = cityRepo;
            _spareCategoryRepo = spareCategoryRepo;
        }

        [HttpGet("brands")]
        public async Task<IActionResult> GetBrands()
        {
            var brands = await _brandRepo.GetQueryable()
                .OrderBy(b => b.Name)
                .Select(b => new LookupDto { Id = b.Id, Name = b.Name })
                .ToListAsync();
            return Ok(brands);
        }

        [HttpGet("models")]
        public async Task<IActionResult> GetModels([FromQuery] int brandId)
        {
            var models = await _modelRepo.GetQueryable()
                .Where(m => m.BrandId == brandId)
                .OrderBy(m => m.Name)
                .Select(m => new LookupDto { Id = m.Id, Name = m.Name })
                .ToListAsync();
            return Ok(models);
        }

        [HttpGet("regions")]
        public async Task<IActionResult> GetRegions()
        {
            var regions = await _regionRepo.GetQueryable()
                .OrderBy(r => r.Name)
                .Select(r => new LookupDto { Id = r.Id, Name = r.Name })
                .ToListAsync();
            return Ok(regions);
        }

        [HttpGet("cities")]
        public async Task<IActionResult> GetCities([FromQuery] int regionId)
        {
            var cities = await _cityRepo.GetQueryable()
                .Where(c => c.RegionId == regionId)
                .OrderBy(c => c.Name)
                .Select(c => new LookupDto { Id = c.Id, Name = c.Name })
                .ToListAsync();
            return Ok(cities);
        }

        [HttpGet("spare-categories")]
        public async Task<IActionResult> GetSpareCategories()
        {
            var categories = await _spareCategoryRepo.GetQueryable()
                .OrderBy(c => c.Name)
                .Select(c => new LookupDto { Id = c.Id, Name = c.Name })
                .ToListAsync();
            return Ok(categories);
        }
    }
}