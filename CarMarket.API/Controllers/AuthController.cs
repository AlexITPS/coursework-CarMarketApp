using CarMarket.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using CarMarket.Application.DTOs.Auth;

namespace CarMarket.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto request)
        {
            try
            {
                var user = await _authService.Register(request);
                return Ok(new { message = "Регистрация успешна!" });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto request)
        {
            var token = await _authService.Login(request);
            if (token == null)
                return Unauthorized("Неверный email или пароль");

            return Ok(new { token });
        }
    }
}