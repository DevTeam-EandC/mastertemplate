using System.ComponentModel.DataAnnotations;

namespace CompanyModuleApi.DTOs.Auth
{
    public class RefreshTokenRequestDto
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
