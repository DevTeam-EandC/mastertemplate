
namespace SalesModuleWebAPI.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;

        public DateTime AccessTokenExpiresAtUtc { get; set; }

        public string RefreshToken { get; set; } = string.Empty;

        public DateTime RefreshTokenExpiresAtUtc { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public List<string> Roles { get; set; } = new();

        public List<DashboardAssignmentDto> Dashboards { get; set; } = new();
    }
}
