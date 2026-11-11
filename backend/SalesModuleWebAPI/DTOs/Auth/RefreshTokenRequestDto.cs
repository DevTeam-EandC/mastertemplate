using System.ComponentModel.DataAnnotations;

namespace SalesModuleWebAPI.DTOs.Auth
{
    public class RefreshTokenRequestDto
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
