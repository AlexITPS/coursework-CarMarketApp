namespace CarMarket.Domain.Models.Directory;
public class City : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public int RegionId { get; set; }
    public Region? Region { get; set; }
}