namespace SalesModuleWebAPI.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAtUtc { get; set; }

        public LoginUserDto User { get; set; } = new();

        public List<DashboardAssignmentDto> Dashboards { get; set; }
            = new();
    }
}
