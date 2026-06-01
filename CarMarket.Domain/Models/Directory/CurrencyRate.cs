namespace CarMarket.Domain.Models.Directory
{
    public class CurrencyRate : BaseEntity
    {
        public string Code { get; set; } = string.Empty; 
        public decimal Rate { get; set; }              
        public int Scale { get; set; }                  
        public DateTime Date { get; set; }              
    }
}