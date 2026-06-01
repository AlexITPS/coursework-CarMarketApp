namespace CarMarket.Domain.Models.Directory;
public class Brand : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public ICollection<VehicleModel> Models { get; set; } = new List<VehicleModel>();
}