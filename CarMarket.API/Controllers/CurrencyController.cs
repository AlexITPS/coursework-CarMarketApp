using CarMarket.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarMarket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CurrencyController : ControllerBase
    {
        private readonly ICurrencyService _currencyService;
        public CurrencyController(ICurrencyService service) => _currencyService = service;

        [HttpGet("rates")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRates()
        {
            return Ok(await _currencyService.GetCurrentRatesAsync());
        }

        [HttpPost("refresh")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Refresh()
        {
            await _currencyService.RefreshRatesAsync();
            return Ok(new { message = "Курсы валют успешно актуализированы в базе данных" });
        }
    }
}