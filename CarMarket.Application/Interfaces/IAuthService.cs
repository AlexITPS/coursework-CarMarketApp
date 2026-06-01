using CarMarket.Application.DTOs.Auth;

namespace CarMarket.Application.Interfaces
{
    public interface IAuthService
    {
        Task<User> Register(UserRegisterDto request);
        Task<string?> Login(UserLoginDto request);
    }
}