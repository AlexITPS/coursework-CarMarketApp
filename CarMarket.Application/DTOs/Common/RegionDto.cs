namespace CarMarket.Application.DTOs.Common
{
    public class RegionDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<CityDto> Cities { get; set; } = new();
    }

    public class CityDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}