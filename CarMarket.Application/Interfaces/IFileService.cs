using Microsoft.AspNetCore.Http;

namespace CarMarket.Application.Interfaces
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(IFormFile file, string folder);
        void DeleteFile(string relativePath);
    }
}