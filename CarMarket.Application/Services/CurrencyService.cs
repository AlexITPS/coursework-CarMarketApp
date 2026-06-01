using Microsoft.EntityFrameworkCore;

namespace CarMarket.Application.Services
{
    public class CurrencyService : ICurrencyService
    {
        private readonly IRepository<CurrencyRate> _currencyRepo;
        private readonly INbrbClient _nbrbClient; 

        public CurrencyService(IRepository<CurrencyRate> currencyRepo, INbrbClient nbrbClient)
        {
            _currencyRepo = currencyRepo;
            _nbrbClient = nbrbClient;
        }

        public async Task<IEnumerable<CurrencyRate>> GetCurrentRatesAsync()
        {
            var today = DateTime.UtcNow.Date;
            var localRates = await _currencyRepo.GetQueryable()
                .Where(r => r.Date >= today)
                .ToListAsync();

            if (!localRates.Any())
            {
                await RefreshRatesAsync();
                localRates = await _currencyRepo.GetQueryable().Where(r => r.Date >= today).ToListAsync();
            }

            return localRates;
        }

        public async Task RefreshRatesAsync()
        {
            var remoteRates = await _nbrbClient.GetRemoteRatesAsync();

            foreach (var r in remoteRates)
            {
                var existing = await _currencyRepo.GetQueryable()
                    .FirstOrDefaultAsync(x => x.Code == r.Cur_Abbreviation);

                if (existing != null)
                {
                    existing.Rate = r.Cur_OfficialRate;
                    existing.Scale = r.Cur_Scale;
                    existing.Date = DateTime.UtcNow.Date;
                    await _currencyRepo.UpdateAsync(existing);
                }
                else
                {
                    await _currencyRepo.CreateAsync(new CurrencyRate
                    {
                        Code = r.Cur_Abbreviation,
                        Rate = r.Cur_OfficialRate,
                        Scale = r.Cur_Scale,
                        Date = DateTime.UtcNow.Date
                    });
                }
            }
        }
    }
}