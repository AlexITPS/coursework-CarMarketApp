using DriveType = CarMarket.Domain.Models.Common.DriveType;

namespace CarMarket.Application.Helpers
{
    public static class EnumTranslator
    {
        public static string TranslateToRus(FuelType fuel) => fuel switch
        {
            FuelType.Petrol => "Бензин",
            FuelType.Diesel => "Дизель",
            FuelType.Electric => "Электро",
            FuelType.Hybrid => "Гибрид",
            FuelType.Gas => "Газ",
            _ => fuel.ToString()
        };

        public static string TranslateToRus(Transmission transmission) => transmission switch
        {
            Transmission.Manual => "Механика",
            Transmission.Automatic => "Автомат",
            Transmission.Robot => "Робот",
            Transmission.CVT => "Вариатор",
            _ => transmission.ToString()
        };

        public static string TranslateToRus(CarCondition condition) => condition switch
        {
            CarCondition.New => "Новая",
            CarCondition.Used => "С пробегом",
            CarCondition.Crashed => "Аварийная",
            CarCondition.ForParts => "На запчасти",
            _ => condition.ToString()
        };

        public static string TranslateToRus(BodyType body) => body switch
        {
            BodyType.Sedan => "Седан",
            BodyType.SUV => "Внедорожник",
            BodyType.Hatchback => "Хэтчбек",
            BodyType.Coupe => "Купе",
            BodyType.Minivan => "Минивэн",
            BodyType.Wagon => "Универсал",
            BodyType.Liftback => "Лифтбек",
            BodyType.Pickup => "Пикап",
            BodyType.Truck => "Грузовик",
            _ => body.ToString()
        };

        public static string TranslateToRus(DriveType drive) => drive switch
        {
            DriveType.Front => "Передний",
            DriveType.Rear => "Задний",
            DriveType.All => "Полный",
            _ => drive.ToString()
        };

        public static string TranslateToRus(AdStatus status) => status switch
        {
            AdStatus.Pending => "На модерации",
            AdStatus.Active => "Активно",
            AdStatus.Sold => "Продано",
            AdStatus.Rejected => "Отклонено",
            _ => status.ToString()
        };

        public static string TranslateToRus(SparePartCondition condition) => condition switch
        {
            SparePartCondition.New => "Новое",
            SparePartCondition.Used => "Б/у",
            SparePartCondition.Refurbished => "Восстановлено",
            SparePartCondition.Defective => "С дефектом",
            SparePartCondition.ForParts => "На разбор / запчасти",
            _ => condition.ToString()
        };
    }
}