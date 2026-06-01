using CarMarket.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CarMarket.API.Filters
{
    public class ActiveUserFilter : IAsyncActionFilter
    {
        private readonly ApplicationDbContext _context;

        public ActiveUserFilter(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var userPrincipal = context.HttpContext.User;

            if (userPrincipal.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = userPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (int.TryParse(userIdClaim, out int userId))
                {
                    var dbUser = await _context.Users
                                         .AsNoTracking() 
                                         .FirstOrDefaultAsync(u => u.Id == userId);

                    if (dbUser == null || !dbUser.IsActive)
                    {
                        context.Result = new ObjectResult(new { message = "Доступ запрещен. Ваш аккаунт деактивирован." })
                        {
                            StatusCode = StatusCodes.Status403Forbidden
                        };
                        return;
                    }
                }
            }

            await next();
        }
    }
}