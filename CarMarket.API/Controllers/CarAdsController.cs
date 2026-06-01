using CarMarket.Application.DTOs.Cars;
using CarMarket.Application.Interfaces;
using CarMarket.Domain.Models.Ads;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CarMarket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarAdsController : ControllerBase
    {
        private readonly ICarService _carService;

        public CarAdsController(ICarService carService)
        {
            _carService = carService;
        }

        private int CurrentUserId => int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] CarSearchFilterDto filter)
        {
            var result = await _carService.GetFilteredAdsAsync(filter);
            return Ok(result);
        }

        [Authorize]
        [HttpGet("my")] 
        public async Task<IActionResult> GetMy() =>
                    Ok(await _carService.GetUserAdsAsync(CurrentUserId));

        [HttpGet("{id}")] 
        public async Task<IActionResult> GetById(int id)
        {
            int? currentUserId = null;
            bool isAdmin = false;

            if (User.Identity?.IsAuthenticated == true)
            {
                var claim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (claim != null && int.TryParse(claim.Value, out int parsedId))
                {
                    currentUserId = parsedId;
                }
                isAdmin = User.IsInRole("Admin") || User.IsInRole("Manager");
            }

            var ad = await _carService.GetAdByIdAsync(id, currentUserId, isAdmin);
            if (ad == null) return NotFound();
            return Ok(ad);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CarAdCreateDto dto)
        {
            try
            {
                var adId = await _carService.CreateAdAsync(dto, CurrentUserId);
                return Ok(new { message = "Объявление успешно создано!", id = adId });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] CarAdUpdateDto dto)
        {
            var result = await _carService.UpdateAdAsync(id, CurrentUserId, dto);
            return result ? Ok(new { message = "Обновлено" }) : NotFound();
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _carService.DeleteAdAsync(id, CurrentUserId);
            return result ? Ok(new { message = "Удалено" }) : NotFound();
        }

        [Authorize]
        [HttpPatch("{id}/sold")]
        public async Task<IActionResult> MarkAsSold(int id)
        {
            var result = await _carService.UpdateAdStatusAsync(id, CurrentUserId, AdStatus.Sold);
            return result ? Ok(new { message = "Поздравляем с продажей!" }) : NotFound();
        }
    }
}