namespace CarMarket.Application.Interfaces
{
    public class NbrbRateDto
    {
        public string Cur_Abbreviation { get; set; } = string.Empty;
        public decimal Cur_OfficialRate { get; set; }
        public int Cur_Scale { get; set; }
        public DateTime Date { get; set; }
    }

    public interface INbrbClient
    {
        Task<List<NbrbRateDto>> GetRemoteRatesAsync();
    }
}