namespace CarMarket.Application.Interfaces
{
    public interface ICurrencyService
    {
        Task<IEnumerable<CurrencyRate>> GetCurrentRatesAsync();
        Task RefreshRatesAsync(); 
    }
}