using CarMarket.Application.DTOs.SpareParts;
using CarMarket.Application.Helpers;
using CarMarket.Application.Interfaces;
using CarMarket.Domain.Models.Ads;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CarMarket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SparePartsController : ControllerBase
    {
        private readonly ISparePartService _sparePartService;

        public SparePartsController(ISparePartService sparePartService)
        {
            _sparePartService = sparePartService;
        }

        private int CurrentUserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [Authorize]
        [HttpGet("my")] 
        public async Task<IActionResult> GetMyParts()
        {
            var parts = await _sparePartService.GetUserPartsAsync(CurrentUserId);
            return Ok(parts);
        }

        [HttpGet("{id}")] 
        public async Task<IActionResult> Get(int id)
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

            var part = await _sparePartService.GetByIdAsync(id, currentUserId, isAdmin);
            return part != null ? Ok(part) : NotFound();
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] SparePartCreateDto dto)
        {
            var id = await _sparePartService.CreateAsync(dto, CurrentUserId);
            return Ok(new { id, message = "Запчасть успешно выставлена на продажу" });
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] SparePartUpdateDto dto)
        {
            var result = await _sparePartService.UpdateAsync(id, CurrentUserId, dto);
            return result ? Ok(new { message = "Объявление обновлено" }) : NotFound();
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromQuery] AdStatus status)
        {
            var result = await _sparePartService.UpdateStatusAsync(id, CurrentUserId, status, isAdmin: true);

            if (!result)
                return NotFound(new { message = "Объявление не найдено" });

            return Ok(new { message = $"Статус успешно изменен на {EnumTranslator.TranslateToRus(status)}" });
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] SparePartSearchFilterDto filter)
        {
            var result = await _sparePartService.GetFilteredAsync(filter);
            return Ok(result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            bool isAdmin = User.IsInRole("Admin") || User.IsInRole("Manager");
            var result = await _sparePartService.DeleteAsync(id, CurrentUserId, isAdmin);

            if (!result)
                return StatusCode(403, new { message = "Объявление не найдено или доступ запрещен" });

            return Ok(new { message = "Объявление успешно удалено" });
        }

        [Authorize]
        [HttpPatch("{id}/sold")]
        public async Task<IActionResult> MarkAsSold(int id)
        {
            var result = await _sparePartService.UpdateStatusAsync(id, CurrentUserId, AdStatus.Sold, false);
            return result ? Ok(new { message = "Отмечено как продано" }) : NotFound();
        }
    }
}