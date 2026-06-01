using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CarMarket.Application.Interfaces;
using System.Security.Claims;
using System.Linq;

namespace CarMarket.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FavoritesController : ControllerBase
    {
        private readonly IFavoriteService _favService;

        public FavoritesController(IFavoriteService favService)
        {
            _favService = favService;
        }

        private int CurrentUserId => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // POST: api/Favorites/car/{id}
        [HttpPost("car/{id}")]
        public async Task<IActionResult> ToggleCar(int id)
        {
            var added = await _favService.ToggleCarFavoriteAsync(id, CurrentUserId);
            return Ok(new { isFavorite = added, message = added ? "Машина добавлена в избранное" : "Машина удалена из избранного" });
        }

        // GET: api/Favorites/car/{id}/check
        [HttpGet("car/{id}/check")]
        public async Task<IActionResult> CheckCarFavorite(int id)
        {
            var favorites = await _favService.GetFavoriteCarsAsync(CurrentUserId);
            var isFavorite = favorites.Any(c => c.Id == id);
            return Ok(new { isFavorite = isFavorite });
        }

        // GET: api/Favorites/cars
        [HttpGet("cars")]
        public async Task<IActionResult> GetMyCars()
        {
            return Ok(await _favService.GetFavoriteCarsAsync(CurrentUserId));
        }

        // POST: api/Favorites/spare-part/{id}
        [HttpPost("spare-part/{id}")]
        public async Task<IActionResult> ToggleSparePart(int id)
        {
            var added = await _favService.ToggleSparePartFavoriteAsync(id, CurrentUserId);
            return Ok(new { isFavorite = added, message = added ? "Запчасть добавлена в избранное" : "Запчасть удалена из избранного" });
        }

        // GET: api/Favorites/spare-part/{id}/check
        [HttpGet("spare-part/{id}/check")]
        public async Task<IActionResult> CheckSparePartFavorite(int id)
        {
            var favorites = await _favService.GetFavoriteSparePartsAsync(CurrentUserId);
            var isFavorite = favorites.Any(p => p.Id == id);
            return Ok(new { isFavorite = isFavorite });
        }

        // GET: api/Favorites/spare-parts
        [HttpGet("spare-parts")]
        public async Task<IActionResult> GetMySpareParts()
        {
            return Ok(await _favService.GetFavoriteSparePartsAsync(CurrentUserId));
        }
    }
}