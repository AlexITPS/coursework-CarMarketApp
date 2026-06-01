namespace CarMarket.Domain.Models.Directory;
public class VehicleModel : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public int BrandId { get; set; }
    public Brand? Brand { get; set; }
}