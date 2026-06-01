using Microsoft.EntityFrameworkCore;
using CarMarket.Domain.Models.Auth;
using CarMarket.Domain.Models.Ads;
using CarMarket.Domain.Models.Cms;
using CarMarket.Domain.Models.Directory;

namespace CarMarket.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<CarAd> CarAds { get; set; }
        public DbSet<SparePartAd> SparePartAds { get; set; }
        public DbSet<News> News { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<VehicleModel> VehicleModels { get; set; }
        public DbSet<Region> Regions { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<CarImage> CarImages { get; set; }
        public DbSet<FavoriteAd> FavoriteAds { get; set; }
        public DbSet<SparePartImage> SparePartImages { get; set; }
        public DbSet<NewsImage> NewsImages { get; set; }
        public DbSet<SparePartCategory> SparePartCategories { get; set; }
        DbSet<CurrencyRate> Currencies { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<NewsImage>()
                .HasOne(i => i.News)
                .WithMany(n => n.Images)
                .HasForeignKey(i => i.NewsId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CarImage>()
                .HasOne(i => i.CarAd)
                .WithMany(c => c.Images)
                .HasForeignKey(i => i.CarAdId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SparePartImage>()
                .HasOne(i => i.SparePartAd)
                .WithMany(s => s.Images)
                .HasForeignKey(i => i.SparePartAdId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}