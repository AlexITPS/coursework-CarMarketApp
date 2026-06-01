namespace CarMarket.Domain.Models.Common
{
    public enum FuelType 
    { 
        Petrol, 
        Diesel, 
        Electric, 
        Hybrid, 
        Gas 
    }

    public enum Transmission 
    { 
        Manual, 
        Automatic, 
        Robot, 
        CVT 
    }

    public enum CarCondition
    {
        New,        
        Used,       
        Crashed,    
        ForParts    
    }

    public enum SparePartCondition
    {
        New,
        Used,
        Refurbished,
        Defective,
        ForParts
    }

    public enum BodyType
    {
        Sedan, 
        SUV, 
        Hatchback, 
        Coupe, 
        Minivan, 
        Wagon,
        Liftback,   
        Pickup,     
        Truck       
    }

    public enum DriveType 
    { 
        Front, 
        Rear, 
        All 
    }
}