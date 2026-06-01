namespace CarMarket.Domain.Models.Auth
{
    public enum UserRole 
    { 
        Client, 
        Manager, 
        Admin 
    }

    public class User : BaseEntity
    {
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Client;
        public bool IsActive { get; set; } = true;
    }
}