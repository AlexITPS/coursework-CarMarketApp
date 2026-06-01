namespace CarMarket.Domain.Models.Directory;
public class Region : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public ICollection<City> Cities { get; set; } = new List<City>();
}