namespace CarMarket.Application.DTOs.Common
{
    public class BrandDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<VehicleModelDto> Models { get; set; } = new();
    }

    public class VehicleModelDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}