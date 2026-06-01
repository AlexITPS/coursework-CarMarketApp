using System.Net.Http.Json;
using CarMarket.Application.Interfaces; 

namespace CarMarket.Infrastructure.ExternalServices
{
    public class NbrbClient : INbrbClient 
    {
        private readonly HttpClient _httpClient;
        public NbrbClient(HttpClient httpClient) => _httpClient = httpClient;

        public async Task<List<NbrbRateDto>> GetRemoteRatesAsync()
        {
            var url = "https://www.nbrb.by/api/exrates/rates?periodicity=0";
            var rates = await _httpClient.GetFromJsonAsync<List<NbrbRateDto>>(url);

            var needed = new[] { "USD", "EUR", "RUB", "CNY" };
            return rates?.Where(r => needed.Contains(r.Cur_Abbreviation)).ToList() ?? new List<NbrbRateDto>();
        }
    }
}