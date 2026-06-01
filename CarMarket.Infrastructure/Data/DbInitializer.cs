using CarMarket.Domain.Models.Auth;
using CarMarket.Domain.Models.Directory;
using Microsoft.EntityFrameworkCore;

namespace CarMarket.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            if (!context.Users.Any(u => u.Role == UserRole.Admin))
            {
                var admin = new User
                {
                    Email = "admin@market.by",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                    FirstName = "Главный",
                    LastName = "Администратор",
                    Phone = "+375291112233",
                    Role = UserRole.Admin,
                    IsActive = true
                };

                context.Users.Add(admin);
                await context.SaveChangesAsync();
            }

            if (!context.Users.Any(u => u.Role == UserRole.Manager))
            {
                var managers = new List<User>
        {
            new User
            {
                Email = "ivan.manager@market.by",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager123"),
                FirstName = "Иван",
                LastName = "Контентов",
                Phone = "+375292223344",
                Role = UserRole.Manager,
                IsActive = true
            },
            new User
            {
                Email = "anna.manager@market.by",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager123"),
                FirstName = "Анна",
                LastName = "Пресс-секретарь",
                Phone = "+375293334455",
                Role = UserRole.Manager,
                IsActive = true
            },
            new User
            {
                Email = "alex.manager@market.by",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("manager123"),
                FirstName = "Алексей",
                LastName = "Модераторов",
                Phone = "+375294445566",
                Role = UserRole.Manager,
                IsActive = true
            }
        };

                await context.Users.AddRangeAsync(managers);
                await context.SaveChangesAsync();
            }

            if (!await context.Brands.AnyAsync())
            {
                await context.Brands.AddRangeAsync(GetInitialBrands());
            }

            if (!await context.Regions.AnyAsync())
            {
                await context.Regions.AddRangeAsync(GetInitialRegions());
            }

            if (!await context.SparePartCategories.AnyAsync())
            {
                await context.SparePartCategories.AddRangeAsync(GetInitialSparePartCategories());
            }

            await context.SaveChangesAsync();
        }

        private static List<Brand> GetInitialBrands()
        {
            return new List<Brand>
            {
                new Brand { Name = "Volkswagen", Models = new List<VehicleModel> {
                    new VehicleModel { Name = "Passat" },
                    new VehicleModel { Name = "Golf" },
                    new VehicleModel { Name = "Polo" },
                    new VehicleModel { Name = "Tiguan" },
                    new VehicleModel { Name = "Touareg" }
                }},
                new Brand { Name = "BMW", Models = new List<VehicleModel> {
                    new VehicleModel { Name = "3 Series" },
                    new VehicleModel { Name = "5 Series" },
                    new VehicleModel { Name = "7 Series" },
                    new VehicleModel { Name = "X5" },
                    new VehicleModel { Name = "X6" }
                }},
                new Brand { Name = "Audi", Models = new List<VehicleModel> {
                    new VehicleModel { Name = "A4" },
                    new VehicleModel { Name = "A6" },
                    new VehicleModel { Name = "A8" },
                    new VehicleModel { Name = "Q5" },
                    new VehicleModel { Name = "Q7" }
                }},
                new Brand { Name = "Geely", Models = new List<VehicleModel> {
                    new VehicleModel { Name = "Coolray" },
                    new VehicleModel { Name = "Atlas Pro" },
                    new VehicleModel { Name = "Emgrand" },
                    new VehicleModel { Name = "Tugella" },
                    new VehicleModel { Name = "Monjaro" }
                }},
                new Brand { Name = "Tesla", Models = new List<VehicleModel> {
                    new VehicleModel { Name = "Model 3" },
                    new VehicleModel { Name = "Model Y" },
                    new VehicleModel { Name = "Model S" },
                    new VehicleModel { Name = "Model X" }
                }},
                new Brand { Name = "Renault", Models = new List<VehicleModel> {
                    new VehicleModel { Name = "Logan" },
                    new VehicleModel { Name = "Duster" },
                    new VehicleModel { Name = "Sandero" },
                    new VehicleModel { Name = "Megane" },
                    new VehicleModel { Name = "Scenic" }
                }},
                new Brand { Name = "Toyota", Models = new List<VehicleModel> {
                    new VehicleModel { Name = "Camry" },
                    new VehicleModel { Name = "RAV4" },
                    new VehicleModel { Name = "Land Cruiser" },
                    new VehicleModel { Name = "Corolla" },
                    new VehicleModel { Name = "Prius" }
                }},
                new Brand { Name = "Ford", Models = new List<VehicleModel> {
                    new VehicleModel { Name = "Focus" },
                    new VehicleModel { Name = "Mondeo" },
                    new VehicleModel { Name = "Escape" },
                    new VehicleModel { Name = "Mustang" }
                }},
                new Brand { Name = "Mercedes-Benz", Models = new List<VehicleModel> {
                    new VehicleModel { Name = "C-Class" },
                    new VehicleModel { Name = "E-Class" },
                    new VehicleModel { Name = "S-Class" },
                    new VehicleModel { Name = "GLE" }
                }}
            };
                }

        private static List<Region> GetInitialRegions()
        {
            return new List<Region>
            {
                new Region { Name = "Минская", Cities = new List<City> {
                    new City { Name = "Минск" },
                    new City { Name = "Борисов" },
                    new City { Name = "Солигорск" },
                    new City { Name = "Молодечно" },
                    new City { Name = "Жодино" },
                    new City { Name = "Слуцк" }
                }},
                new Region { Name = "Гродненская", Cities = new List<City> {
                    new City { Name = "Гродно" },
                    new City { Name = "Лида" },
                    new City { Name = "Слоним" },
                    new City { Name = "Волковыск" },
                    new City { Name = "Сморгонь" }
                }},
                new Region { Name = "Брестская", Cities = new List<City> {
                    new City { Name = "Брест" },
                    new City { Name = "Барановичи" },
                    new City { Name = "Пинск" },
                    new City { Name = "Кобрин" },
                    new City { Name = "Лунинец" }
                }},
                new Region { Name = "Гомельская", Cities = new List<City> {
                    new City { Name = "Гомель" },
                    new City { Name = "Мозырь" },
                    new City { Name = "Жлобин" },
                    new City { Name = "Речица" },
                    new City { Name = "Светлогорск" }
                }},
                new Region { Name = "Витебская", Cities = new List<City> {
                    new City { Name = "Витебск" },
                    new City { Name = "Орша" },
                    new City { Name = "Полоцк" },
                    new City { Name = "Новополоцк" },
                    new City { Name = "Глубокое" }
                }},
                new Region { Name = "Могилевская", Cities = new List<City> {
                    new City { Name = "Могилев" },
                    new City { Name = "Бобруйск" },
                    new City { Name = "Горки" },
                    new City { Name = "Осиповичи" },
                    new City { Name = "Кричев" }
                }}
            };
        }

        private static List<SparePartCategory> GetInitialSparePartCategories()
        {
            return new List<SparePartCategory>
            {
                new SparePartCategory { Name = "Двигатель" },
                new SparePartCategory { Name = "Трансмиссия (КПП)" },
                new SparePartCategory { Name = "Ходовая часть (Подвеска)" },
                new SparePartCategory { Name = "Тормозная система" },
                new SparePartCategory { Name = "Рулевое управление" },
                new SparePartCategory { Name = "Кузовные детали" },
                new SparePartCategory { Name = "Оптика (Фары, фонари)" },
                new SparePartCategory { Name = "Электрооборудование" },
                new SparePartCategory { Name = "Система охлаждения" },
                new SparePartCategory { Name = "Топливная система" },
                new SparePartCategory { Name = "Выхлопная система" },
                new SparePartCategory { Name = "Салон и интерьер" },
                new SparePartCategory { Name = "Диски и шины" },
                new SparePartCategory { Name = "Аккумуляторы" },
                new SparePartCategory { Name = "Фильтры" },
                new SparePartCategory { Name = "Масла и техжидкости" },
                new SparePartCategory { Name = "Кондиционер и отопление" },
                new SparePartCategory { Name = "Стекла и зеркала" },
                new SparePartCategory { Name = "Система зажигания" },
                new SparePartCategory { Name = "Датчики и блоки управления" },
                new SparePartCategory { Name = "Турбины и компрессоры" },
                new SparePartCategory { Name = "Сцепление" },
                new SparePartCategory { Name = "Приводные валы (ШРУС)" },
                new SparePartCategory { Name = "Амортизаторы и пружины" },
                new SparePartCategory { Name = "Рычаги и сайлентблоки" },
                new SparePartCategory { Name = "Генераторы и стартеры" },
                new SparePartCategory { Name = "Прокладки и уплотнители" },
                new SparePartCategory { Name = "Ремни и ролики ГРМ" },
                new SparePartCategory { Name = "Замки и ручки" },
                new SparePartCategory { Name = "Автоаксессуары" }
            };
        }


    }
}