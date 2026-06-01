using System.Security.Claims;
using CarMarket.Application.DTOs.News;
using CarMarket.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarMarket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly INewsService _newsService;
        public NewsController(INewsService newsService) => _newsService = newsService;

        private int CurrentUserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll([FromQuery] bool includeArchived = false)
        {
            if (includeArchived && !User.IsInRole("Admin") && !User.IsInRole("Manager"))
            {
                includeArchived = false;
            }

            return Ok(await _newsService.GetAllAsync(includeArchived));
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(int id)
        {
            var news = await _newsService.GetByIdAsync(id);
            if (news == null) return NotFound();

            if (news.IsArchived && !User.IsInRole("Admin") && !User.IsInRole("Manager"))
                return NotFound();

            return Ok(news);
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] NewsCreateDto dto)
        {
            var id = await _newsService.CreateAsync(dto, CurrentUserId);
            return Ok(new { id, message = "Новость успешно опубликована" });
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] NewsUpdateDto dto)
        {
            var result = await _newsService.UpdateAsync(id, dto);
            return result ? Ok(new { message = "Новость успешно обновлена" }) : NotFound();
        }

        [Authorize(Roles = "Admin,Manager")]
        [HttpPatch("{id}/archive")]
        public async Task<IActionResult> Archive(int id)
        {
            var result = await _newsService.ArchiveAsync(id);
            return result ? Ok(new { message = "Новость перенесена в архив" }) : NotFound();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}/permanent")]
        public async Task<IActionResult> DeletePermanently(int id)
        {
            var result = await _newsService.DeletePermanentlyAsync(id);
            return result ? Ok(new { message = "Новость полностью удалена из системы" }) : NotFound();
        }
    }
}